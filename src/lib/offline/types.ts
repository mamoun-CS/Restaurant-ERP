export type OfflineSyncStatus = "PENDING" | "SYNCING" | "SYNCED" | "FAILED";
export type OfflinePrintStatus = "NOT_PRINTED" | "PRINTED" | "FAILED";

export type OfflineCartAddon = {
  name: string;
  price: number;
};

export type OfflineSaleItem = {
  productId: string;
  categoryId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  selectedSize?: string;
  addons: OfflineCartAddon[];
  notes?: string;
};

export type OfflinePayment = {
  method: "CASH" | "CREDIT_CARD" | "BANK";
  currencyCode: string;
  amount: number;
  changeAmount?: number;
  provider?: string;
  cardType?: string;
  bankName?: string;
  transactionReference?: string;
  lastFourDigits?: string;
  posTerminalNumber?: string;
};

export type OfflineSale = {
  id: string; // clientTransactionId / UUID
  clientTransactionId: string;
  idempotencyKey: string;
  temporaryNumber: string;
  officialNumber?: string;
  deviceId?: string;
  branchId?: string;
  registerId?: string;
  shiftId?: string;
  cashierId?: string;
  cashierName?: string;
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "PICKUP";
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNotes?: string;
  items: OfflineSaleItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  grandTotal: number;
  paymentMethod: "CASH" | "CREDIT_CARD" | "BANK";
  payments: OfflinePayment[];
  createdAt: string; // ISO string
  syncStatus: OfflineSyncStatus;
  syncAttempts: number;
  lastSyncAttemptAt?: string | null;
  syncError?: string | null;
  syncedAt?: string | null;
  printStatus: OfflinePrintStatus;
  printedAt?: string | null;
  printError?: string | null;
  serverInvoiceId?: string;
};

export type SyncQueueEntry = {
  id?: number;
  saleId: string; // references OfflineSale.id
  status: OfflineSyncStatus;
  attempts: number;
  nextRetryAt: number; // timestamp in ms
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LocalProduct = {
  id: string;
  sku?: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price: number;
  category: string;
  categoryAr?: string;
  emoji?: string;
  color?: string;
  active: boolean;
  sizes: { nameEn: string; nameAr: string; delta: number }[];
  addons: { nameEn: string; nameAr: string; price: number }[];
  updatedAt?: string;
};

export type LocalCategory = {
  id: string;
  nameEn: string;
  nameAr: string;
  sortOrder: number;
};

export type AppConfigMetadata = {
  branch?: {
    id: string;
    code: string;
    name: string;
    nameAr: string;
    address?: string | null;
    phone?: string | null;
  };
  cashier?: {
    userId: string;
    name: string;
    email: string;
    role: string;
    branchId: string;
  };
  currentShift?: {
    id: string;
    shiftNumber: string;
    registerId: string;
    registerNumber?: string;
    status: string;
    openedAt: string;
  };
  rates?: {
    currencyId: string;
    code: string;
    name: string;
    rateToBase: number;
  }[];
  lastProductSyncAt?: string;
};

export type SyncServiceState = {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncTime: string | null;
  lastError: string | null;
};
