import Dexie, { type Table } from "dexie";
import type {
  OfflineSale,
  SyncQueueEntry,
  LocalProduct,
  LocalCategory,
  AppConfigMetadata,
} from "./types";

export class PosOfflineDatabase extends Dexie {
  sales!: Table<OfflineSale, string>;
  syncQueue!: Table<SyncQueueEntry, number>;
  products!: Table<LocalProduct, string>;
  categories!: Table<LocalCategory, string>;
  config!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super("RestaurantPosOfflineDB");

    this.version(1).stores({
      sales: "id, clientTransactionId, temporaryNumber, officialNumber, syncStatus, printStatus, createdAt, shiftId",
      syncQueue: "++id, saleId, status, nextRetryAt, createdAt",
      products: "id, category, active",
      categories: "id, sortOrder",
      config: "key",
    });
  }

  async getConfig<T = unknown>(key: string): Promise<T | null> {
    const item = await this.config.get(key);
    return item ? (item.value as T) : null;
  }

  async setConfig(key: string, value: unknown): Promise<void> {
    await this.config.put({ key, value });
  }

  async getAppMetadata(): Promise<AppConfigMetadata> {
    const branch = await this.getConfig<AppConfigMetadata["branch"]>("branch");
    const cashier = await this.getConfig<AppConfigMetadata["cashier"]>("cashier");
    const currentShift = await this.getConfig<AppConfigMetadata["currentShift"]>("currentShift");
    const rates = await this.getConfig<AppConfigMetadata["rates"]>("rates");
    const lastProductSyncAt = await this.getConfig<string>("lastProductSyncAt");

    return {
      branch: branch || undefined,
      cashier: cashier || undefined,
      currentShift: currentShift || undefined,
      rates: rates || undefined,
      lastProductSyncAt: lastProductSyncAt || undefined,
    };
  }
}

// Singleton database instance
export const localDb = typeof window !== "undefined" ? new PosOfflineDatabase() : (null as unknown as PosOfflineDatabase);
