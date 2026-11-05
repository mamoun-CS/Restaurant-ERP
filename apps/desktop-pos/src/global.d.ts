import type { CheckoutInput, ProductSummary } from "../electron/shared";

declare global {
  interface Window {
    pos: {
      login(username: string, pin: string): Promise<{name:string;expiresAt:number;canDiscount:boolean;maxDiscountPercent:number;maxDiscountMinor:number;supervisor:boolean}>;
      logout(): Promise<boolean>;
      enroll(serverUrl: string, pairingCode: string, deviceName: string): Promise<{enrolled:boolean;catalogCount:number;cashierCount:number}>;
      syncNow(): Promise<boolean>;
      listProducts(search?: string): Promise<ProductSummary[]>;
      checkout(input: CheckoutInput): Promise<{orderId:string;receiptNumber:string;totalMinor:number}>;
      getLocalStatus(): Promise<{databaseReady:boolean;catalogCount:number;cashierName:string|null;pendingCount:number;cashierCount:number;deviceEnrolled:boolean;lastSyncAt:string|null;lastSyncError:string|null}>;
    };
  }
}
export {};
