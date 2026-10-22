import http from "node:http";
import { LocalJobQueue } from "./queue.js";
import { ApiClient } from "./api-client.js";
import { detectWindowsPrinters } from "./detectors/windows-printers.js";
import { sendRawToPrinter } from "./transports/index.js";
import { HtmlRasterizer } from "./renderer/html-to-raster.js";
import { EscPos } from "./escpos/commands.js";
import { loadConfig } from "./crypto-store.js";
import type { AgentConfig, PrintJobDto } from "./types.js";

export class PrintAgent {
  private config: AgentConfig;
  private queue: LocalJobQueue;
  private client: ApiClient;
  private sseCleanup: (() => void) | null = null;
  private isProcessing = false;
  private sseStatus = "DISCONNECTED";
  private lastEventAt: string | null = null;
  private lastFallbackPollAt: string | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private pollTimer: NodeJS.Timeout | null = null;
  private statusServer: http.Server | null = null;
  private isStopped = false;

  constructor(customConfig?: AgentConfig) {
    this.config = customConfig || loadConfig();
    this.queue = new LocalJobQueue();
    this.client = new ApiClient(this.config);
  }

  public async start(): Promise<void> {
    if (!this.config.token || !this.config.deviceId) {
      throw new Error("Print Agent is not paired yet. Please run: agent pair <code>");
    }

    console.log(`[Agent] Starting Print Agent for ERP at ${this.config.erpUrl}...`);
    console.log(`[Agent] Device ID: ${this.config.deviceId} (${this.config.deviceName})`);

    // 1. Report detected local printers
    try {
      const localPrinters = detectWindowsPrinters();
      console.log(`[Agent] Detected ${localPrinters.length} local Windows printers.`);
      await this.client.reportPrinters(localPrinters);
    } catch (err) {
      console.warn("[Agent] Initial printer reporting failed (continuing):", err);
    }

    // 2. Start Local Loopback HTTP Status Server (bound to 127.0.0.1 ONLY)
    this.startLoopbackStatusServer(4099);

    // 3. Start SSE connection
    this.connectSse();

    // 4. Start Heartbeat Timer (every 30s)
    this.startHeartbeatTimer();

    // 5. Start Polling Fallback Timer (every 45s)
    this.startPollingTimer();

    // 6. Initial queue drain and pending sync
    void this.drainQueue();
    void this.syncPendingCompletedJobs();
  }

  public stop(): void {
    this.isStopped = true;
    if (this.sseCleanup) {
      this.sseCleanup();
      this.sseCleanup = null;
    }
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.statusServer) {
      try {
        this.statusServer.close();
      } catch {
        // ignore
      }
    }
    console.log("[Agent] Print Agent stopped.");
  }

  private connectSse(): void {
    if (this.sseCleanup) {
      this.sseCleanup();
    }

    this.sseCleanup = this.client.connectSse(
      (job) => {
        this.lastEventAt = new Date().toISOString();
        console.log(`[Agent] Received SSE print job: ${job.id} (${job.jobType})`);
        this.queue.enqueue(job);
        void this.drainQueue();
      },
      () => {
        this.sseStatus = "CONNECTED";
        console.log("[Agent] SSE stream connected.");
      },
      (err) => {
        this.sseStatus = "ERROR";
        console.warn("[Agent] SSE stream error:", err.message);
      },
    );
  }

  private startHeartbeatTimer(): void {
    const intervalMs = this.config.heartbeatIntervalMs || 30000;
    this.heartbeatTimer = setInterval(async () => {
      if (this.isStopped) return;
      try {
        await this.client.sendHeartbeat({
          sseStatus: this.sseStatus,
          lastEventAt: this.lastEventAt || undefined,
          lastFallbackPollAt: this.lastFallbackPollAt || undefined,
        });
        // Check if there are offline jobs that need status sync
        void this.syncPendingCompletedJobs();
      } catch {
        // Cloud DB / ERP temporarily unreachable — silent keep-alive
      }
    }, intervalMs);
  }

  private startPollingTimer(): void {
    const intervalMs = this.config.fallbackPollIntervalMs || 45000;
    this.pollTimer = setInterval(async () => {
      if (this.isStopped) return;
      try {
        this.lastFallbackPollAt = new Date().toISOString();
        const jobs = await this.client.fetchJobs(10);
        if (jobs.length > 0) {
          console.log(`[Agent] Fallback poll retrieved ${jobs.length} pending jobs.`);
          for (const job of jobs) {
            this.queue.enqueue(job);
          }
          void this.drainQueue();
        }
      } catch {
        // Cloud offline fallback
      }
    }, intervalMs);
  }

  private async drainQueue(): Promise<void> {
    if (this.isProcessing || this.isStopped) return;
    this.isProcessing = true;

    try {
      while (!this.isStopped) {
        const queuedItem = this.queue.getNextJob();
        if (!queuedItem) break;

        const job = queuedItem.job;
        console.log(`[Agent] Processing job ${job.id} (Attempt ${queuedItem.attempts + 1}/${job.maxAttempts})...`);
        this.queue.markPrinting(job.id);

        try {
          await this.client.markProcessing(job.id).catch(() => null);
          await this.executePrintJob(job);
          console.log(`[Agent] Job ${job.id} printed successfully.`);
          this.queue.markCompleted(job.id, job.idempotencyKey);
          await this.client.markComplete(job.id).catch(() => null);
          this.queue.markSynced(job.id);
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const errCode = (err as { code?: string })?.code || "PRINT_EXECUTION_FAILED";
          console.error(`[Agent] Job ${job.id} failed:`, errCode, errMsg);

          if (queuedItem.attempts >= job.maxAttempts) {
            this.queue.markFailed(job.id, errCode, errMsg);
            await this.client.markFailed(job.id, errCode, errMsg).catch(() => null);
          } else {
            // Re-queue with exponential backoff
            const delay = Math.min(30000, 2000 * Math.pow(2, queuedItem.attempts));
            setTimeout(() => {
              void this.drainQueue();
            }, delay);
            break;
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async executePrintJob(job: PrintJobDto): Promise<void> {
    const printer = job.printerConfiguration;
    if (!printer) {
      throw new Error(`Job ${job.id} has no printer configuration attached.`);
    }

    let payload: Buffer;

    if (job.jobType === "OPEN_CASH_DRAWER") {
      // Just send drawer kick pulse
      payload = EscPos.cashDrawer(
        printer.cashDrawerPin || 0,
        printer.cashDrawerPulseOn || 25,
        printer.cashDrawerPulseOff || 250,
      );
    } else {
      // 1. Render receipt content
      let renderedData: Buffer;
      if (job.contentType === "ESC_POS") {
        renderedData = Buffer.from(job.content, "binary");
      } else {
        // HTML content -> raster image conversion
        renderedData = await HtmlRasterizer.renderHtmlToEscPos(
          job.content,
          job.paperWidth,
          job.customWidthMm,
        );
      }

      // 2. Handle Cash Drawer triggering per configuration
      const chunks: Buffer[] = [];
      const needsDrawer = job.openCashDrawer || printer.openCashDrawer;

      if (needsDrawer && printer.cashDrawerOpenBeforePrint) {
        chunks.push(
          EscPos.cashDrawer(
            printer.cashDrawerPin || 0,
            printer.cashDrawerPulseOn || 25,
            printer.cashDrawerPulseOff || 250,
          ),
        );
      }

      chunks.push(renderedData);

      if (needsDrawer && !printer.cashDrawerOpenBeforePrint) {
        chunks.push(
          EscPos.cashDrawer(
            printer.cashDrawerPin || 0,
            printer.cashDrawerPulseOn || 25,
            printer.cashDrawerPulseOff || 250,
          ),
        );
      }

      payload = Buffer.concat(chunks);
    }

    // Print copies
    const copies = Math.max(1, Math.min(5, job.copies || 1));
    for (let c = 0; c < copies; c++) {
      await sendRawToPrinter(printer, payload);
    }
  }

  private async syncPendingCompletedJobs(): Promise<void> {
    const pending = this.queue.getPendingServerSyncs();
    for (const item of pending) {
      try {
        if (item.status === "COMPLETED") {
          await this.client.markComplete(item.job.id);
          this.queue.markSynced(item.job.id);
        } else if (item.status === "FAILED") {
          await this.client.markFailed(item.job.id, item.errorCode || "PRINT_FAILED", item.errorMessage);
          this.queue.markSynced(item.job.id);
        }
      } catch {
        // network still down, will retry on next heartbeat
        break;
      }
    }
  }

  private startLoopbackStatusServer(port = 4099): void {
    this.statusServer = http.createServer((req, res) => {
      // Strict loopback restriction
      const remoteAddress = req.socket.remoteAddress;
      if (remoteAddress !== "127.0.0.1" && remoteAddress !== "::1" && remoteAddress !== "::ffff:127.0.0.1") {
        res.writeHead(403);
        res.end("Forbidden: Local loopback access only");
        return;
      }

      if (req.url === "/health" || req.url === "/status") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "OK",
            version: "1.0.0",
            erpUrl: this.config.erpUrl,
            deviceId: this.config.deviceId,
            deviceName: this.config.deviceName,
            sseStatus: this.sseStatus,
            queuedJobs: this.queue.getQueuedCount(),
            lastEventAt: this.lastEventAt,
            lastFallbackPollAt: this.lastFallbackPollAt,
            uptimeSeconds: Math.floor(process.uptime()),
          }),
        );
        return;
      }

      res.writeHead(404);
      res.end("Not Found");
    });

    this.statusServer.listen(port, "127.0.0.1", () => {
      console.log(`[Agent] Local diagnostics loopback server running on http://127.0.0.1:${port}`);
    });
  }
}
