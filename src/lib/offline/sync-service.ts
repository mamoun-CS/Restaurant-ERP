import { localDb } from "./db";
import type { OfflineSale, SyncServiceState } from "./types";

type Listener = (state: SyncServiceState) => void;

class SyncService {
  private isSyncing = false;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<Listener> = new Set();
  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  private lastSyncTime: string | null = null;
  private lastError: string | null = null;
  private initialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.bindWindowEvents();
    }
  }

  private bindWindowEvents() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.notifyListeners();
      // Auto-trigger sync when connection returns
      void this.triggerSync();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.notifyListeners();
    });

    // Check on visibility change (cashier comes back to tab)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void this.checkConnectionAndSync();
      }
    });
  }

  public init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    // Periodic sync attempt every 20 seconds while app is active
    this.syncTimer = setInterval(() => {
      void this.checkConnectionAndSync();
    }, 20000);

    // Initial check
    void this.checkConnectionAndSync();

    // Cleanup old synced sales from IndexedDB (older than 7 days)
    // to prevent unbounded storage growth on the cashier device
    void this.cleanupOldSyncedSales();
  }

  private async cleanupOldSyncedSales() {
    if (!localDb) return;
    try {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const oldSynced = await localDb.sales
        .where("syncStatus")
        .equals("SYNCED")
        .filter((sale) => sale.createdAt < cutoff)
        .toArray();

      if (oldSynced.length > 0) {
        const ids = oldSynced.map((s) => s.id);
        await localDb.sales.bulkDelete(ids);
      }
    } catch (err) {
      console.warn("Cleanup of old synced sales failed (non-fatal)", err);
    }
  }

  public destroy() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    this.listeners.clear();
    this.initialized = false;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    void this.getState().then(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async getState(): Promise<SyncServiceState> {
    if (!localDb) {
      return {
        isOnline: this.isOnline,
        isSyncing: false,
        pendingCount: 0,
        failedCount: 0,
        lastSyncTime: this.lastSyncTime,
        lastError: this.lastError,
      };
    }

    const pending = await localDb.sales
      .where("syncStatus")
      .anyOf(["PENDING", "SYNCING"])
      .count()
      .catch(() => 0);

    const failed = await localDb.sales
      .where("syncStatus")
      .equals("FAILED")
      .count()
      .catch(() => 0);

    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: pending,
      failedCount: failed,
      lastSyncTime: this.lastSyncTime,
      lastError: this.lastError,
    };
  }

  private async notifyListeners() {
    const state = await this.getState();
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (err) {
        console.error("Sync listener error", err);
      }
    }
  }

  public async checkConnectionAndSync(): Promise<void> {
    // Probe actual server reachability, not merely navigator.onLine
    const serverReachable = await this.pingServer();
    this.isOnline = serverReachable;
    await this.notifyListeners();

    if (serverReachable) {
      await this.triggerSync();
    }
  }

  private async pingServer(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch("/api/auth/session", {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      }).catch(() => null);
      clearTimeout(timeoutId);

      // Even if session is 401, the server is reachable!
      return Boolean(res && (res.status === 200 || res.status === 401 || res.status === 403));
    } catch {
      return false;
    }
  }

  public async triggerSync(): Promise<void> {
    if (this.isSyncing || !localDb) return;
    this.isSyncing = true;
    await this.notifyListeners();

    try {
      // Find all pending queue items in FIFO order
      const queueItems = await localDb.syncQueue
        .where("status")
        .anyOf(["PENDING", "FAILED"])
        .sortBy("createdAt");

      const now = Date.now();

      for (const item of queueItems) {
        // Check backoff timer unless manually triggered
        if (item.nextRetryAt && item.nextRetryAt > now) {
          continue;
        }

        const sale = await localDb.sales.get(item.saleId);
        if (!sale) {
          // Remove orphaned queue entry
          if (item.id) await localDb.syncQueue.delete(item.id);
          continue;
        }

        // Already synced? Clean up
        if (sale.syncStatus === "SYNCED") {
          if (item.id) await localDb.syncQueue.delete(item.id);
          continue;
        }

        const success = await this.syncSingleSale(sale, item.id);
        if (!success) {
          // If a network interruption occurred, halt queue to maintain FIFO order
          break;
        }
      }
    } catch (err) {
      console.error("Synchronization cycle encountered error", err);
      this.lastError = err instanceof Error ? err.message : "Sync error";
    } finally {
      this.isSyncing = false;
      await this.notifyListeners();
    }
  }

  private async syncSingleSale(sale: OfflineSale, queueId?: number): Promise<boolean> {
    if (!localDb) return false;

    // Mark as SYNCING locally
    await localDb.sales.update(sale.id, {
      syncStatus: "SYNCING",
      syncAttempts: (sale.syncAttempts || 0) + 1,
      lastSyncAttemptAt: new Date().toISOString(),
    });
    if (queueId) {
      await localDb.syncQueue.update(queueId, {
        status: "SYNCING",
        attempts: (sale.syncAttempts || 0) + 1,
        updatedAt: new Date().toISOString(),
      });
    }
    await this.notifyListeners();

    try {
      const payload = {
        orderType: sale.orderType,
        clientTransactionId: sale.clientTransactionId,
        idempotencyKey: sale.idempotencyKey,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        customerAddress: sale.customerAddress,
        customerNotes: sale.customerNotes,
        shiftId: sale.shiftId,
        registerId: sale.registerId,
        createdAt: sale.createdAt,
        items: sale.items.map((x) => ({
          productId: x.productId,
          categoryId: x.categoryId,
          productName: x.productName,
          quantity: x.quantity,
          unitPrice: x.unitPrice,
          selectedSize: x.selectedSize,
          addons: x.addons || [],
          notes: x.notes,
        })),
        discountAmount: sale.discountAmount,
        taxAmount: sale.taxAmount,
        payments: sale.payments,
      };

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 1. Success response (200 OK or 201 Created)
      if (response.ok) {
        const serverInvoice = await response.json();
        const officialNumber = serverInvoice.number || serverInvoice.officialNumber || sale.temporaryNumber;
        const nowIso = new Date().toISOString();

        await localDb.transaction("rw", [localDb.sales, localDb.syncQueue], async () => {
          await localDb.sales.update(sale.id, {
            syncStatus: "SYNCED",
            officialNumber,
            serverInvoiceId: serverInvoice.id,
            syncedAt: nowIso,
            syncError: null,
          });
          if (queueId) {
            await localDb.syncQueue.delete(queueId);
          }
        });

        this.lastSyncTime = nowIso;
        this.lastError = null;
        this.isOnline = true;
        return true;
      }

      // 2. Authentication or Authorization failure (401 / 403)
      if (response.status === 401 || response.status === 403) {
        const msg = "Cashier session expired. Sale safely saved locally; log in to resume syncing.";
        this.lastError = msg;
        // Keep in queue, do NOT discard, schedule retry
        await this.handleRetryableError(sale, queueId, msg, 60000);
        return false;
      }

      // 3. Shift closed or requires cash register opening (409)
      if (response.status === 409) {
        const errorJson = await response.json().catch(() => null);
        const msg = errorJson?.message || "Cash shift must be open to finalize sales.";
        this.lastError = msg;
        await this.handleRetryableError(sale, queueId, msg, 15000);
        return false;
      }

      // 4. Client validation error (400)
      if (response.status === 400) {
        const errorJson = await response.json().catch(() => null);
        const msg = errorJson?.message || "Sale validation failed on server.";
        this.lastError = msg;
        await localDb.sales.update(sale.id, {
          syncStatus: "FAILED",
          syncError: msg,
        });
        if (queueId) {
          await localDb.syncQueue.update(queueId, {
            status: "FAILED",
            lastError: msg,
            updatedAt: new Date().toISOString(),
          });
        }
        return false;
      }

      // 5. Server errors (500, 502, 503, 504) -> retryable with backoff
      const errorText = await response.text().catch(() => "Server error");
      const msg = `Server returned ${response.status}: ${errorText.slice(0, 100)}`;
      this.lastError = msg;
      await this.handleRetryableError(sale, queueId, msg);
      return false;
    } catch (networkError) {
      // Network disconnected during fetch
      this.isOnline = false;
      const msg = networkError instanceof Error ? networkError.message : "Network request failed";
      this.lastError = msg;
      await this.handleRetryableError(sale, queueId, msg);
      return false;
    }
  }

  private async handleRetryableError(
    sale: OfflineSale,
    queueId: number | undefined,
    errorMessage: string,
    forcedDelayMs?: number,
  ) {
    if (!localDb) return;

    const attempts = (sale.syncAttempts || 1);
    // Bounded exponential backoff with jitter: min 2s, max 60s
    const baseBackoff = Math.min(60000, 2000 * Math.pow(1.8, Math.min(attempts, 6)));
    const jitter = Math.random() * 2000;
    const delay = forcedDelayMs || (baseBackoff + jitter);
    const nextRetryAt = Date.now() + delay;

    await localDb.sales.update(sale.id, {
      syncStatus: "PENDING",
      syncError: errorMessage,
    });

    if (queueId) {
      await localDb.syncQueue.update(queueId, {
        status: "PENDING",
        nextRetryAt,
        lastError: errorMessage,
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

// Global Singleton
export const syncService = typeof window !== "undefined" ? new SyncService() : (null as unknown as SyncService);
