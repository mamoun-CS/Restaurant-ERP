import http from "node:http";
import https from "node:https";
import os from "node:os";
import type { AgentConfig, DetectedPrinter, PrintJobDto } from "./types.js";

export class ApiClient {
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  public updateConfig(config: AgentConfig): void {
    this.config = config;
  }

  private getBaseUrl(): string {
    return (this.config.erpUrl || "http://localhost:3000").replace(/\/+$/, "");
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.config.token) {
      headers["Authorization"] = `Bearer ${this.config.token}`;
    }
    if (this.config.deviceId) {
      headers["x-print-device-id"] = this.config.deviceId;
    }
    return headers;
  }

  public async pair(pairingCode: string, deviceName = os.hostname()): Promise<{
    deviceId: string;
    deviceCode: string;
    branchId: string;
    token: string;
  }> {
    const url = `${this.getBaseUrl()}/api/printing/pair`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pairingCode: pairingCode.trim().toUpperCase(),
        deviceName: deviceName.trim(),
        operatingSystem: `${process.platform} ${os.release()} (${os.arch()})`,
        appVersion: "1.0.0",
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.code || `Pairing failed (HTTP ${res.status})`);
    }

    return {
      deviceId: data.deviceId,
      deviceCode: data.deviceCode,
      branchId: data.branchId,
      token: data.token,
    };
  }

  public async sendHeartbeat(telemetry: {
    sseStatus?: string;
    lastEventAt?: string;
    lastFallbackPollAt?: string;
  }): Promise<{ heartbeatIntervalMs: number; fallbackPollIntervalMs: number }> {
    const url = `${this.getBaseUrl()}/api/printing/device/heartbeat`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        appVersion: "1.0.0",
        ...telemetry,
      }),
    });

    if (!res.ok) {
      throw new Error(`Heartbeat failed: HTTP ${res.status}`);
    }

    const data = await res.json().catch(() => ({}));
    return {
      heartbeatIntervalMs: data.heartbeatIntervalMs || 30000,
      fallbackPollIntervalMs: data.fallbackPollIntervalMs || 60000,
    };
  }

  public async reportPrinters(printers: DetectedPrinter[]): Promise<void> {
    const url = `${this.getBaseUrl()}/api/printing/device/printers`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ printers }),
    });

    if (!res.ok) {
      throw new Error(`Failed to report local printers: HTTP ${res.status}`);
    }
  }

  public async fetchJobs(limit = 10): Promise<PrintJobDto[]> {
    const url = `${this.getBaseUrl()}/api/printing/device/jobs?limit=${limit}`;
    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch jobs: HTTP ${res.status}`);
    }

    const data = await res.json().catch(() => ({ jobs: [] }));
    return data.jobs || [];
  }

  public async markProcessing(jobId: string): Promise<void> {
    const url = `${this.getBaseUrl()}/api/printing/device/jobs/${encodeURIComponent(jobId)}/processing`;
    await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
    });
  }

  public async markComplete(
    jobId: string,
    drawerError?: { code?: string; message?: string },
  ): Promise<void> {
    const url = `${this.getBaseUrl()}/api/printing/device/jobs/${encodeURIComponent(jobId)}/complete`;
    await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        drawerErrorCode: drawerError?.code,
        drawerErrorMessage: drawerError?.message,
      }),
    });
  }

  public async markFailed(jobId: string, errorCode: string, errorMessage?: string): Promise<void> {
    const url = `${this.getBaseUrl()}/api/printing/device/jobs/${encodeURIComponent(jobId)}/fail`;
    await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        errorCode,
        errorMessage: errorMessage?.slice(0, 600),
      }),
    });
  }

  public connectSse(
    onJob: (job: PrintJobDto) => void,
    onConnected: () => void,
    onError: (err: Error) => void,
  ): () => void {
    const urlStr = `${this.getBaseUrl()}/api/printing/device/events`;
    const urlObj = new URL(urlStr);
    const isHttps = urlObj.protocol === "https:";
    const transport = isHttps ? https : http;

    let aborted = false;
    let req: http.ClientRequest | null = null;

    const startStream = () => {
      if (aborted) return;

      const options: http.RequestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: "GET",
        headers: {
          ...this.getHeaders(),
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
      };

      req = transport.request(options, (res) => {
        if (res.statusCode !== 200) {
          onError(new Error(`SSE connection failed with HTTP ${res.statusCode}`));
          reconnect();
          return;
        }

        onConnected();
        let buffer = "";

        res.on("data", (chunk: Buffer) => {
          buffer += chunk.toString("utf8");
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const block of lines) {
            this.parseSseBlock(block, onJob);
          }
        });

        res.on("end", () => {
          if (!aborted) reconnect();
        });

        res.on("error", (err) => {
          if (!aborted) {
            onError(err);
            reconnect();
          }
        });
      });

      req.on("error", (err) => {
        if (!aborted) {
          onError(err);
          reconnect();
        }
      });

      req.end();
    };

    let reconnectTimer: NodeJS.Timeout | null = null;
    const reconnect = () => {
      if (aborted || reconnectTimer) return;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        startStream();
      }, 5000);
    };

    startStream();

    return () => {
      aborted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (req) {
        try {
          req.destroy();
        } catch {
          // ignore
        }
      }
    };
  }

  private parseSseBlock(block: string, onJob: (job: PrintJobDto) => void): void {
    const lines = block.split("\n");
    let eventName = "message";
    let dataStr = "";

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataStr = line.slice(5).trim();
      }
    }

    if (!dataStr) return;

    try {
      const data = JSON.parse(dataStr);
      if (eventName === "print-job" && data) {
        onJob(data as PrintJobDto);
      }
    } catch {
      // parse ignore
    }
  }
}
