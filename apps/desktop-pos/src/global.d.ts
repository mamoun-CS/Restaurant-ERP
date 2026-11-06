import type { CheckoutInput, ProductSummary } from "../electron/shared";

declare global {
  interface Window {
    pos: {
      login(username: string, pin: string): Promise<{name:string;expiresAt:number;canDiscount:boolean;maxDiscountPercent:number;maxDiscountMinor:number;supervisor:boolean}>;
      logout(): Promise<boolean>;
      verifyAdmin(username:string,pin:string): Promise<{name:string;expiresAt:number}>;
      getAdminCredentialState(username:string): Promise<"missing"|"inactive"|"not-admin"|"expired"|"locked"|"ready">;
      logoutAdmin(): Promise<boolean>;
      listRecentOrders(): Promise<{id:string;createdAt:string;totalMinor:number;receiptNumber:string;cashierName:string;orderType:string;customerName:string|null;syncStatus:string}[]>;
      openOnlineAdmin(): Promise<boolean>;
      enroll(serverUrl: string, pairingCode: string, deviceName: string): Promise<{enrolled:boolean;catalogCount:number;cashierCount:number}>;
      syncNow(): Promise<boolean>;
      openCash(openingAmount:number): Promise<{id:string;openedAt:string;openingMinor:number;expectedMinor:number;registerCloudId:string|null}>;
      closeCash(countedAmount:number): Promise<{id:string;closedAt:string;openingMinor:number;expectedMinor:number;closingMinor:number;differenceMinor:number}>;
      setCloudServer(url:string): Promise<{connected:boolean;serverUrl:string}>;
      runDiagnostics(): Promise<{id:string;status:"ok"|"warning"|"error";detail:string;action:"pair"|"connection"|"catalog"|"sync"|"printer"|null;issues?:{receiptNumber:string;status:string;attemptCount:number;nextAttemptAt:string;errorMessage:string|null;createdAt:string;totalMinor:number;currencyCode:string}[]}[]>;
      refreshCatalog(): Promise<{catalogCount:number}>;
      listPrinters(): Promise<{name:string;displayName:string;description:string}[]>;
      selectPrinter(name:string|null): Promise<{selectedPrinter:string|null}>;
      openPrinterSettings(): Promise<boolean>;
      testPrinter(): Promise<{printedTo:string|null}>;
      printReceipt(): Promise<boolean>;
      saveInvoicePdf(receiptNumber:string): Promise<{saved:boolean;filePath:string|null}>;
      listProducts(search?: string): Promise<ProductSummary[]>;
      checkout(input: CheckoutInput): Promise<{orderId:string;receiptNumber:string;totalMinor:number}>;
      getLocalStatus(): Promise<{databaseReady:boolean;catalogCount:number;cashierName:string|null;pendingCount:number;cashierCount:number;deviceEnrolled:boolean;deviceId:string|null;branchName:string|null;registerName:string|null;selectedPrinterName:string|null;lastSyncAt:string|null;lastSyncError:string|null;catalogHash:string;cloudCatalogHash:string|null;catalogMatchesCloud:boolean|null;catalogSyncedAt:string|null;cloudUrl:string|null;openCashSession:{id:string;openedAt:string;openingMinor:number;expectedMinor:number;registerCloudId:string|null}|null;coupons?:{code:string;type:"FIXED"|"PERCENTAGE";value:number;startsAt:string;endsAt:string;active:boolean;maxUses:number|null;usedCount:number}[]}>;
    };
  }
}
export {};
