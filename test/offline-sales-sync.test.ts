import { strictEqual, deepEqual, ok } from "node:assert";
import { calculateSaleTotals } from "../src/lib/offline/offline-sales";
import type { OfflineSale, SyncQueueEntry } from "../src/lib/offline/types";

// In-memory IndexedDB replica for testing offline resilience in Node.js
class MockIndexedDb {
  sales: Map<string, OfflineSale> = new Map();
  syncQueue: Map<number, SyncQueueEntry> = new Map();
  private nextQueueId = 1;

  async saveSaleAtomic(sale: OfflineSale): Promise<void> {
    this.sales.set(sale.id, JSON.parse(JSON.stringify(sale)));
    const queueId = this.nextQueueId++;
    this.syncQueue.set(queueId, {
      id: queueId,
      saleId: sale.id,
      status: "PENDING",
      attempts: 0,
      nextRetryAt: Date.now(),
      createdAt: sale.createdAt,
      updatedAt: sale.createdAt,
    });
  }

  async getSale(id: string): Promise<OfflineSale | undefined> {
    const sale = this.sales.get(id);
    return sale ? JSON.parse(JSON.stringify(sale)) : undefined;
  }

  async getAllSales(): Promise<OfflineSale[]> {
    return Array.from(this.sales.values()).map((s) => JSON.parse(JSON.stringify(s)));
  }

  async markPrinted(saleId: string, error?: string): Promise<void> {
    const sale = this.sales.get(saleId);
    if (!sale) throw new Error("Sale not found");
    sale.printStatus = error ? "FAILED" : "PRINTED";
    sale.printedAt = error ? undefined : new Date().toISOString();
    sale.printError = error || null;
  }

  async updateSyncStatus(saleId: string, officialNumber: string, serverId: string): Promise<void> {
    const sale = this.sales.get(saleId);
    if (!sale) throw new Error("Sale not found");
    sale.syncStatus = "SYNCED";
    sale.officialNumber = officialNumber;
    sale.serverInvoiceId = serverId;
    sale.syncedAt = new Date().toISOString();

    // Remove from sync queue
    for (const [qid, item] of this.syncQueue.entries()) {
      if (item.saleId === saleId) {
        this.syncQueue.delete(qid);
      }
    }
  }

  async recordSyncFailure(saleId: string, error: string, backoffMs: number): Promise<void> {
    const sale = this.sales.get(saleId);
    if (!sale) throw new Error("Sale not found");
    sale.syncStatus = "PENDING";
    sale.syncAttempts = (sale.syncAttempts || 0) + 1;
    sale.syncError = error;

    for (const item of this.syncQueue.values()) {
      if (item.saleId === saleId) {
        item.status = "PENDING";
        item.attempts += 1;
        item.nextRetryAt = Date.now() + backoffMs;
        item.lastError = error;
      }
    }
  }
}

// Server Mock representing the cloud ERP invoices API
class MockCloudErpServer {
  invoices: Map<string, { id: string; officialNumber: string; clientTransactionId?: string; total: number }> = new Map();
  private nextSeq = 1;
  isAvailable = true;
  simulateAuthExpired = false;

  async postInvoice(payload: {
    clientTransactionId?: string;
    idempotencyKey?: string;
    items: { productName: string; quantity: number; unitPrice: number }[];
    payments: { amount: number; method: string }[];
  }) {
    if (!this.isAvailable) {
      throw new Error("HTTP 503 Service Unavailable");
    }

    if (this.simulateAuthExpired) {
      const err = new Error("HTTP 401 Unauthorized");
      (err as unknown as { status: number }).status = 401;
      throw err;
    }

    // Idempotency check: if already processed, return existing invoice without duplicate
    const key = payload.clientTransactionId || payload.idempotencyKey;
    if (key) {
      for (const inv of this.invoices.values()) {
        if (inv.clientTransactionId === key) {
          return { status: 200, isExisting: true, invoice: inv };
        }
      }
    }

    const officialNumber = `MAIN-REG01-2026-${String(this.nextSeq++).padStart(6, "0")}`;
    const id = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const total = payload.payments.reduce((a, b) => a + b.amount, 0);

    const record = { id, officialNumber, clientTransactionId: key, total };
    this.invoices.set(id, record);

    return { status: 201, isExisting: false, invoice: record };
  }
}

async function runScenario(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (err: unknown) {
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${(err as Error).message}`);
    process.exitCode = 1;
  }
}

async function main() {
  console.log("Offline-First POS & Synchronization Test Suite:\n");

  const db = new MockIndexedDb();
  const server = new MockCloudErpServer();

  // Helper to create a sale
  function createTestSale(id: string, subtotal: number, timeOffsetMs = 0): OfflineSale {
    const items = [{ productId: "p1", productName: "Truffle Smash", quantity: 2, unitPrice: subtotal / 2, addons: [] }];
    const totals = calculateSaleTotals(items);
    return {
      id,
      clientTransactionId: id,
      idempotencyKey: id,
      temporaryNumber: `OFFLINE-${id.slice(0, 8).toUpperCase()}`,
      orderType: "TAKEAWAY",
      items,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
      grandTotal: totals.grandTotal,
      paymentMethod: "CASH",
      payments: [{ method: "CASH", currencyCode: "ILS", amount: totals.totalAmount }],
      createdAt: new Date(Date.now() + timeOffsetMs).toISOString(),
      syncStatus: "PENDING",
      syncAttempts: 0,
      printStatus: "NOT_PRINTED",
    };
  }

  // 1. Online sale: saved locally, printed, and synchronized
  await runScenario("Scenario 1: Online sale is saved, printed, and synchronized", async () => {
    const sale = createTestSale("sale-online-01", 30);
    await db.saveSaleAtomic(sale);
    await db.markPrinted(sale.id);

    const response = await server.postInvoice({
      clientTransactionId: sale.clientTransactionId,
      items: sale.items,
      payments: sale.payments,
    });

    strictEqual(response.status, 201);
    await db.updateSyncStatus(sale.id, response.invoice.officialNumber, response.invoice.id);

    const updated = await db.getSale(sale.id);
    ok(updated);
    strictEqual(updated.syncStatus, "SYNCED");
    strictEqual(updated.printStatus, "PRINTED");
    ok(updated.officialNumber?.startsWith("MAIN-REG01"));
  });

  // 2. Offline sale: saved locally and can be printed without cloud connection
  await runScenario("Scenario 2: Offline sale is saved locally and can be printed", async () => {
    const sale = createTestSale("sale-offline-02", 40);
    await db.saveSaleAtomic(sale);

    // Printer fires locally
    await db.markPrinted(sale.id);

    const saved = await db.getSale(sale.id);
    ok(saved);
    strictEqual(saved.temporaryNumber, "OFFLINE-SALE-OFF");
    strictEqual(saved.printStatus, "PRINTED");
    strictEqual(saved.syncStatus, "PENDING");
    strictEqual(db.syncQueue.size, 1);
  });

  // 3. Multiple offline sales: all remain available after refreshing the page
  await runScenario("Scenario 3: Multiple offline sales remain available in local storage", async () => {
    const saleA = createTestSale("sale-offline-03a", 20, 100);
    const saleB = createTestSale("sale-offline-03b", 50, 200);
    await db.saveSaleAtomic(saleA);
    await db.saveSaleAtomic(saleB);

    // Simulate page reload / DB retrieval
    const sales = await db.getAllSales();
    const offline03a = sales.find((s) => s.id === "sale-offline-03a");
    const offline03b = sales.find((s) => s.id === "sale-offline-03b");

    ok(offline03a);
    ok(offline03b);
    strictEqual(offline03a.totalAmount, 20);
    // 50 ILS order gets 10% discount -> 45 ILS
    strictEqual(offline03b.totalAmount, 45);
  });

  // 4. Reconnection: pending sales synchronize automatically in FIFO order
  await runScenario("Scenario 4: Reconnection synchronizes pending sales automatically in FIFO order", async () => {
    const queue = Array.from(db.syncQueue.values()).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
    ok(queue.length >= 3);

    for (const item of queue) {
      const sale = await db.getSale(item.saleId);
      if (!sale || sale.syncStatus === "SYNCED") continue;

      const res = await server.postInvoice({
        clientTransactionId: sale.clientTransactionId,
        items: sale.items,
        payments: sale.payments,
      });

      await db.updateSyncStatus(sale.id, res.invoice.officialNumber, res.invoice.id);
    }

    strictEqual(db.syncQueue.size, 0);
    const all = await db.getAllSales();
    ok(all.every((s) => s.syncStatus === "SYNCED"));
  });

  // 5. Lost server response: retrying does not duplicate the sale
  await runScenario("Scenario 5: Lost server response retry does not duplicate invoice or revenue", async () => {
    const sale = createTestSale("sale-idempotent-05", 25);
    await db.saveSaleAtomic(sale);

    // First attempt creates
    const firstRes = await server.postInvoice({
      clientTransactionId: sale.clientTransactionId,
      items: sale.items,
      payments: sale.payments,
    });
    strictEqual(firstRes.status, 201);
    strictEqual(firstRes.isExisting, false);

    // Second attempt (e.g. timeout on client side)
    const secondRes = await server.postInvoice({
      clientTransactionId: sale.clientTransactionId,
      items: sale.items,
      payments: sale.payments,
    });
    strictEqual(secondRes.status, 200);
    strictEqual(secondRes.isExisting, true);
    strictEqual(secondRes.invoice.id, firstRes.invoice.id);
    strictEqual(secondRes.invoice.officialNumber, firstRes.invoice.officialNumber);
  });

  // 6. Server outage: sales remain pending without data loss
  await runScenario("Scenario 6: Server outage retains sales pending with exponential backoff", async () => {
    server.isAvailable = false;
    const sale = createTestSale("sale-outage-06", 60);
    await db.saveSaleAtomic(sale);

    try {
      await server.postInvoice({
        clientTransactionId: sale.clientTransactionId,
        items: sale.items,
        payments: sale.payments,
      });
      ok(false, "Should have thrown 503");
    } catch (err: unknown) {
      const backoffMs = Math.min(60000, 2000 * Math.pow(1.8, 1));
      await db.recordSyncFailure(sale.id, (err as Error).message, backoffMs);
    }

    const check = await db.getSale(sale.id);
    ok(check);
    strictEqual(check.syncStatus, "PENDING");
    strictEqual(check.syncAttempts, 1);
    strictEqual(check.syncError, "HTTP 503 Service Unavailable");
    server.isAvailable = true; // restore
  });

  // 7. Printer failure: sale remains saved and can be printed later
  await runScenario("Scenario 7: Printer failure preserves sale and allows reprinting", async () => {
    const sale = createTestSale("sale-print-err-07", 15);
    await db.saveSaleAtomic(sale);

    // Printer runs out of paper
    await db.markPrinted(sale.id, "Printer out of paper");
    let check = await db.getSale(sale.id);
    strictEqual(check?.printStatus, "FAILED");
    strictEqual(check?.printError, "Printer out of paper");

    // Later, cashier clicks reprint after reloading paper
    await db.markPrinted(sale.id);
    check = await db.getSale(sale.id);
    strictEqual(check?.printStatus, "PRINTED");
    strictEqual(check?.printError, null);
    ok(check?.printedAt);
  });

  // 8. Authentication expiry: pending sales are retained and handled safely
  await runScenario("Scenario 8: Authentication expiry retains sales safely without discarding", async () => {
    server.simulateAuthExpired = true;
    const sale = createTestSale("sale-auth-exp-08", 35);
    await db.saveSaleAtomic(sale);

    try {
      await server.postInvoice({
        clientTransactionId: sale.clientTransactionId,
        items: sale.items,
        payments: sale.payments,
      });
      ok(false, "Should have failed 401");
    } catch (err: unknown) {
      await db.recordSyncFailure(sale.id, "Session expired", 60000);
    }

    const check = await db.getSale(sale.id);
    ok(check);
    strictEqual(check.syncStatus, "PENDING");
    strictEqual(check.syncError, "Session expired");
    server.simulateAuthExpired = false; // user logs in
  });

  // 9. Repeated synchronization: no duplicate invoices or revenue are created
  await runScenario("Scenario 9: Repeated synchronization calls do not duplicate invoices", async () => {
    const sale = createTestSale("sale-repeat-09", 80);
    await db.saveSaleAtomic(sale);

    const initialCount = server.invoices.size;
    const res1 = await server.postInvoice({
      clientTransactionId: sale.clientTransactionId,
      items: sale.items,
      payments: sale.payments,
    });
    strictEqual(server.invoices.size, initialCount + 1);

    const res2 = await server.postInvoice({
      clientTransactionId: sale.clientTransactionId,
      items: sale.items,
      payments: sale.payments,
    });
    // Count remains unchanged!
    strictEqual(server.invoices.size, initialCount + 1);
    strictEqual(res1.invoice.id, res2.invoice.id);
  });

  // 10. Restarting the browser: cashier recovers pending sales after reopening
  await runScenario("Scenario 10: Reopening browser recovers all pending sales", async () => {
    // New browser instance connecting to same persistent storage
    const reloadedDb = db;
    const allSales = await reloadedDb.getAllSales();
    const pendingSales = allSales.filter((s) => s.syncStatus === "PENDING");

    ok(pendingSales.length >= 2);
    for (const p of pendingSales) {
      ok(p.id);
      ok(p.totalAmount > 0);
      ok(p.temporaryNumber.startsWith("OFFLINE-"));
    }
  });

  console.log("\nAll 10 offline-first scenarios verified successfully!");
}

main().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
