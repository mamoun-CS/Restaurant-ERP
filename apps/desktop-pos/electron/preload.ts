import { contextBridge, ipcRenderer } from "electron";
import type { CheckoutInput, ProductSummary } from "./shared";

contextBridge.exposeInMainWorld("pos", {
  login: (username: string, pin: string) => ipcRenderer.invoke("auth:login", username, pin) as Promise<{name:string;expiresAt:number}>,
  logout: () => ipcRenderer.invoke("auth:logout") as Promise<boolean>,
  verifyAdmin: (username:string,pin:string) => ipcRenderer.invoke("admin:verify",username,pin) as Promise<{name:string;expiresAt:number}>,
  getAdminCredentialState: (username:string) => ipcRenderer.invoke("admin:credential-state",username) as Promise<"missing"|"inactive"|"not-admin"|"expired"|"locked"|"ready">,
  logoutAdmin: () => ipcRenderer.invoke("admin:logout") as Promise<boolean>,
  listRecentOrders: () => ipcRenderer.invoke("admin:recent-orders") as Promise<{id:string;createdAt:string;totalMinor:number;receiptNumber:string;cashierName:string;orderType:string;customerName:string|null;syncStatus:string}[]>,
  openOnlineAdmin: () => ipcRenderer.invoke("admin:open-online") as Promise<boolean>,
  enroll: (serverUrl: string, pairingCode: string, deviceName: string) => ipcRenderer.invoke("device:enroll", serverUrl, pairingCode, deviceName) as Promise<{enrolled:boolean;catalogCount:number;cashierCount:number}>,
  syncNow: () => ipcRenderer.invoke("sync:trigger") as Promise<boolean>,
  openCash: (openingAmount:number) => ipcRenderer.invoke("cash:open",openingAmount),
  closeCash: (countedAmount:number) => ipcRenderer.invoke("cash:close",countedAmount),
  setCloudServer: (url:string) => ipcRenderer.invoke("device:set-server",url) as Promise<{connected:boolean;serverUrl:string}>,
  runDiagnostics: () => ipcRenderer.invoke("app:diagnostics") as Promise<{id:string;status:"ok"|"warning"|"error";detail:string;action:"pair"|"connection"|"catalog"|"sync"|"printer"|null;issues?:{receiptNumber:string;status:string;attemptCount:number;nextAttemptAt:string;errorMessage:string|null;createdAt:string;totalMinor:number;currencyCode:string}[]}[]>,
  refreshCatalog: () => ipcRenderer.invoke("catalog:refresh") as Promise<{catalogCount:number}>,
  listPrinters: () => ipcRenderer.invoke("printer:list") as Promise<{name:string;displayName:string;description:string}[]>,
  selectPrinter: (name:string|null) => ipcRenderer.invoke("printer:select",name) as Promise<{selectedPrinter:string|null}>,
  openPrinterSettings: () => ipcRenderer.invoke("printer:windows-settings") as Promise<boolean>,
  testPrinter: () => ipcRenderer.invoke("printer:test") as Promise<{printedTo:string|null}>,
  printReceipt: () => ipcRenderer.invoke("printer:receipt") as Promise<boolean>,
  saveInvoicePdf: (receiptNumber:string) => ipcRenderer.invoke("invoice:save-pdf",receiptNumber) as Promise<{saved:boolean;filePath:string|null}>,
  listProducts: (search?: string) => ipcRenderer.invoke("catalog:list", search ?? "") as Promise<ProductSummary[]>,
  checkout: (input: CheckoutInput) => ipcRenderer.invoke("sales:checkout", input) as Promise<{orderId:string;receiptNumber:string;totalMinor:number}>,
  getLocalStatus: () => ipcRenderer.invoke("app:local-status") as Promise<{databaseReady:boolean;catalogCount:number;cashierName:string|null;pendingCount:number;cashierCount:number;deviceEnrolled:boolean;deviceId:string|null;branchName:string|null;registerName:string|null;selectedPrinterName:string|null;lastSyncAt:string|null;lastSyncError:string|null;catalogHash:string;cloudCatalogHash:string|null;catalogMatchesCloud:boolean|null;catalogSyncedAt:string|null;cloudUrl:string|null;openCashSession:{id:string;openedAt:string;openingMinor:number;expectedMinor:number;registerCloudId:string|null}|null;coupons?:{code:string;type:"FIXED"|"PERCENTAGE";value:number;startsAt:string;endsAt:string;active:boolean;maxUses:number|null;usedCount:number}[]}>,
});
