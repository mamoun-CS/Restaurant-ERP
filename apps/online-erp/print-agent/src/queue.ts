import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { PrintJobDto } from "./types.js";

function getDataDir(): string {
  if (process.platform === "win32") {
    const appData = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
    return path.join(appData, "restaurant-erp-print-agent");
  }
  return path.join(os.homedir(), ".config", "restaurant-erp-print-agent");
}

export interface QueuedJob {
  job: PrintJobDto;
  addedAt: number;
  status: "QUEUED" | "PRINTING" | "COMPLETED" | "FAILED";
  attempts: number;
  lastAttemptAt?: number;
  errorCode?: string;
  errorMessage?: string;
  syncedToServer: boolean;
}

export class LocalJobQueue {
  private queueFile: string;
  private printedKeysFile: string;
  private jobs: Map<string, QueuedJob> = new Map();
  private printedKeys: Set<string> = new Set();

  constructor(customDir?: string) {
    const dir = customDir || getDataDir();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
    this.queueFile = path.join(dir, "queue.json");
    this.printedKeysFile = path.join(dir, "printed-jobs.json");
    this.load();
  }

  private load(): void {
    if (fs.existsSync(this.queueFile)) {
      try {
        const raw = fs.readFileSync(this.queueFile, "utf8");
        const list: QueuedJob[] = JSON.parse(raw);
        for (const item of list) {
          // If a job was left in "PRINTING" state when agent died, reset to "QUEUED"
          if (item.status === "PRINTING") {
            item.status = "QUEUED";
          }
          this.jobs.set(item.job.id, item);
        }
      } catch {
        // queue recovery
      }
    }

    if (fs.existsSync(this.printedKeysFile)) {
      try {
        const raw = fs.readFileSync(this.printedKeysFile, "utf8");
        const list: string[] = JSON.parse(raw);
        for (const key of list) {
          this.printedKeys.add(key);
        }
      } catch {
        // recovery
      }
    }
  }

  private persist(): void {
    try {
      const list = Array.from(this.jobs.values());
      fs.writeFileSync(this.queueFile, JSON.stringify(list, null, 2), "utf8");

      // Keep last 1,000 printed keys to manage memory
      const keysArray = Array.from(this.printedKeys).slice(-1000);
      fs.writeFileSync(this.printedKeysFile, JSON.stringify(keysArray, null, 2), "utf8");
    } catch {
      // storage error
    }
  }

  public isAlreadyPrinted(idempotencyKey: string): boolean {
    return this.printedKeys.has(idempotencyKey);
  }

  public markKeyPrinted(idempotencyKey: string): void {
    this.printedKeys.add(idempotencyKey);
    this.persist();
  }

  public enqueue(job: PrintJobDto): boolean {
    if (this.isAlreadyPrinted(job.idempotencyKey)) {
      return false; // Idempotency protection: never print twice
    }

    for (const item of this.jobs.values()) {
      if (item.job.idempotencyKey === job.idempotencyKey) {
        return false;
      }
    }

    if (!this.jobs.has(job.id)) {
      this.jobs.set(job.id, {
        job,
        addedAt: Date.now(),
        status: "QUEUED",
        attempts: job.attempts || 0,
        syncedToServer: false,
      });
      this.persist();
      return true;
    }
    return false;
  }

  public getNextJob(): QueuedJob | null {
    for (const item of this.jobs.values()) {
      if (item.status === "QUEUED") {
        return item;
      }
    }
    return null;
  }

  public markPrinting(jobId: string): void {
    const item = this.jobs.get(jobId);
    if (item) {
      item.status = "PRINTING";
      item.attempts += 1;
      item.lastAttemptAt = Date.now();
      this.persist();
    }
  }

  public markCompleted(jobId: string, idempotencyKey: string): void {
    const item = this.jobs.get(jobId);
    if (item) {
      item.status = "COMPLETED";
      this.markKeyPrinted(idempotencyKey);
      this.persist();
    }
  }

  public markFailed(jobId: string, errorCode: string, errorMessage?: string): void {
    const item = this.jobs.get(jobId);
    if (item) {
      item.status = "FAILED";
      item.errorCode = errorCode;
      item.errorMessage = errorMessage;
      this.persist();
    }
  }

  public markSynced(jobId: string): void {
    const item = this.jobs.get(jobId);
    if (item) {
      item.syncedToServer = true;
      if (item.status === "COMPLETED") {
        this.jobs.delete(jobId); // Clean up finished & synced jobs
      }
      this.persist();
    }
  }

  public getPendingServerSyncs(): QueuedJob[] {
    return Array.from(this.jobs.values()).filter(
      (j) => !j.syncedToServer && (j.status === "COMPLETED" || j.status === "FAILED"),
    );
  }

  public getQueuedCount(): number {
    let count = 0;
    for (const item of this.jobs.values()) {
      if (item.status === "QUEUED" || item.status === "PRINTING") count++;
    }
    return count;
  }
}
