import type { CheckoutInput, ProductSummary } from "../electron/shared";

declare global {
  interface Window {
    pos: {
      login(username: string, pin: string): Promise<{name:string;expiresAt:number;canDiscount:boolean;maxDiscountPercent:number;maxDiscountMinor:number;supervisor:boolean}>;
      logout(): Promise<boolean>;
      enroll(serverUrl: string, pairingCode: string, deviceName: string): Promise<{enrolled:boolean;catalogCount:number;cashierCount:number}>;
      syncNow(): Promise<boolean>;
      refreshCatalog(): Promise<{catalogCount:number}>;
      listPrinters(): Promise<{name:string;displayName:string;description:string}[]>;
      selectPrinter(name:string|null): Promise<{selectedPrinter:string|null}>;
      openPrinterSettings(): Promise<boolean>;
      testPrinter(): Promise<{printedTo:string|null}>;
      printReceipt(): Promise<boolean>;
      saveInvoicePdf(receiptNumber:string): Promise<{saved:boolean;filePath:string|null}>;
      listProducts(search?: string): Promise<ProductSummary[]>;
      checkout(input: CheckoutInput): Promise<{orderId:string;receiptNumber:string;totalMinor:number}>;
      getLocalStatus(): Promise<{databaseReady:boolean;catalogCount:number;cashierName:string|null;pendingCount:number;cashierCount:number;deviceEnrolled:boolean;selectedPrinterName:string|null;lastSyncAt:string|null;lastSyncError:string|null;catalogHash:string;cloudCatalogHash:string|null;catalogMatchesCloud:boolean|null;catalogSyncedAt:string|null;coupons?:{code:string;type:"FIXED"|"PERCENTAGE";value:number;startsAt:string;endsAt:string;active:boolean;maxUses:number|null;usedCount:number}[]}>;
    };
  }
}
export {};
