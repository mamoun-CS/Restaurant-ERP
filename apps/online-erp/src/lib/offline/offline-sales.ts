import { localDb } from "./db";
import type {
  OfflineSale,
  OfflineSaleItem,
  OfflinePayment,
  SyncQueueEntry,
} from "./types";

export type CreateSaleInput = {
  items: OfflineSaleItem[];
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "PICKUP";
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNotes?: string;
  paymentMethod: "CASH" | "CREDIT_CARD" | "BANK";
  payments?: OfflinePayment[];
  shiftId?: string;
  registerId?: string;
  cashierId?: string;
  cashierName?: string;
  branchId?: string;
  deviceId?: string;
  existingId?: string; // in case of re-checkout with pre-assigned ID
};

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined" || !window.localStorage) {
    return "terminal-server";
  }
  let deviceId = localStorage.getItem("pos_device_id");
  if (!deviceId) {
    deviceId = `dev-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)}`;
    try {
      localStorage.setItem("pos_device_id", deviceId);
    } catch {
      // storage unavailable
    }
  }
  return deviceId;
}

export function calculateSaleTotals(items: OfflineSaleItem[]) {
  const subtotal = items.reduce((sum, item) => {
    const addonsTotal = (item.addons || []).reduce((a, b) => a + (Number(b.price) || 0), 0);
    const itemUnitPrice = Number(item.unitPrice) || 0;
    return sum + (itemUnitPrice + addonsTotal) * item.quantity;
  }, 0);

  // Existing restaurant business rule: orders >= 30 ILS receive 10% discount
  const discountAmount = subtotal >= 30 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const taxAmount = 0; // Tax is already included in menu prices per restaurant tax policy
  const totalAmount = Math.max(0, Math.round((subtotal - discountAmount + taxAmount) * 100) / 100);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount,
    taxAmount,
    totalAmount,
    grandTotal: totalAmount,
  };
}

export async function saveSaleLocally(input: CreateSaleInput): Promise<OfflineSale> {
  if (!localDb) {
    throw new Error("Local database is not available in this browser environment.");
  }

  if (!input.items || input.items.length === 0) {
    throw new Error("Cannot save an empty sale. At least one item is required.");
  }

  for (const item of input.items) {
    if (!item.quantity || item.quantity <= 0) {
      throw new Error(`Invalid item quantity for ${item.productName}`);
    }
  }

  const { subtotal, discountAmount, taxAmount, totalAmount, grandTotal } =
    calculateSaleTotals(input.items);

  const saleId = input.existingId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sale-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  const clientTransactionId = saleId;
  const idempotencyKey = saleId;
  const shortCode = saleId.replace(/-/g, "").slice(0, 8).toUpperCase();
  const temporaryNumber = `OFFLINE-${shortCode}`;
  const now = new Date().toISOString();

  // Try to load cached shift / cashier if not provided
  const metadata = await localDb.getAppMetadata().catch(() => null);
  const shiftId = input.shiftId || metadata?.currentShift?.id;
  const registerId = input.registerId || metadata?.currentShift?.registerId;
  const cashierId = input.cashierId || metadata?.cashier?.userId;
  const cashierName = input.cashierName || metadata?.cashier?.name || "Cashier";
  const branchId = input.branchId || metadata?.branch?.id;

  const defaultPayments: OfflinePayment[] = [
    {
      method: input.paymentMethod,
      currencyCode: "ILS",
      amount: totalAmount,
      changeAmount: 0,
      ...(input.paymentMethod === "CREDIT_CARD"
        ? { cardType: "VISA", transactionReference: `POS-${Date.now()}` }
        : {}),
    },
  ];

  const payments = input.payments && input.payments.length > 0 ? input.payments : defaultPayments;
  const deviceId = input.deviceId || getOrCreateDeviceId();

  const sale: OfflineSale = {
    id: saleId,
    clientTransactionId,
    idempotencyKey,
    temporaryNumber,
    officialNumber: undefined,
    deviceId,
    branchId,
    registerId,
    shiftId,
    cashierId,
    cashierName,
    orderType: input.orderType,
    customerName: input.customerName?.trim() || undefined,
    customerPhone: input.customerPhone?.trim() || undefined,
    customerAddress: input.customerAddress?.trim() || undefined,
    customerNotes: input.customerNotes?.trim() || undefined,
    items: input.items,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    grandTotal,
    paymentMethod: input.paymentMethod,
    payments,
    createdAt: now,
    syncStatus: "PENDING",
    syncAttempts: 0,
    lastSyncAttemptAt: null,
    syncError: null,
    syncedAt: null,
    printStatus: "NOT_PRINTED",
    printedAt: null,
    printError: null,
  };

  const queueEntry: SyncQueueEntry = {
    saleId: sale.id,
    status: "PENDING",
    attempts: 0,
    nextRetryAt: Date.now(),
    lastError: null,
    createdAt: now,
    updatedAt: now,
  };

  // Atomic Dexie transaction saving sale + sync queue entry together
  await localDb.transaction("rw", [localDb.sales, localDb.syncQueue], async () => {
    const existingQueue = await localDb.syncQueue.where("saleId").equals(sale.id).first();
    await localDb.sales.put(sale);
    if (existingQueue?.id) {
      await localDb.syncQueue.update(existingQueue.id, queueEntry);
    } else {
      await localDb.syncQueue.add(queueEntry);
    }
  });

  return sale;
}

export async function markSalePrinted(saleId: string, error?: string): Promise<void> {
  if (!localDb) return;

  await localDb.sales.update(saleId, {
    printStatus: error ? "FAILED" : "PRINTED",
    printedAt: error ? undefined : new Date().toISOString(),
    printError: error || null,
  });
}

export async function getSaleById(saleId: string): Promise<OfflineSale | undefined> {
  if (!localDb) return undefined;
  return localDb.sales.get(saleId);
}

export async function getSaleByNumberOrId(identifier: string): Promise<OfflineSale | undefined> {
  if (!localDb) return undefined;
  // Try ID directly
  let sale = await localDb.sales.get(identifier);
  if (sale) return sale;

  // Try officialNumber or temporaryNumber
  sale = await localDb.sales.where("officialNumber").equals(identifier).first();
  if (sale) return sale;

  return localDb.sales.where("temporaryNumber").equals(identifier).first();
}

export async function getAllPendingSales(): Promise<OfflineSale[]> {
  if (!localDb) return [];
  return localDb.sales
    .where("syncStatus")
    .anyOf(["PENDING", "SYNCING", "FAILED"])
    .reverse()
    .sortBy("createdAt");
}

export async function getRecentLocalSales(limit = 20): Promise<OfflineSale[]> {
  if (!localDb) return [];
  return localDb.sales.orderBy("createdAt").reverse().limit(limit).toArray();
}
