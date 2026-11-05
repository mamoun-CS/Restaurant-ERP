import { contextBridge, ipcRenderer } from "electron";
import type { CheckoutInput, ProductSummary } from "./shared";

contextBridge.exposeInMainWorld("pos", {
  login: (username: string, pin: string) => ipcRenderer.invoke("auth:login", username, pin) as Promise<{name:string;expiresAt:number}>,
  logout: () => ipcRenderer.invoke("auth:logout") as Promise<boolean>,
  enroll: (serverUrl: string, pairingCode: string, deviceName: string) => ipcRenderer.invoke("device:enroll", serverUrl, pairingCode, deviceName) as Promise<{enrolled:boolean;catalogCount:number;cashierCount:number}>,
  syncNow: () => ipcRenderer.invoke("sync:trigger") as Promise<boolean>,
  refreshCatalog: () => ipcRenderer.invoke("catalog:refresh") as Promise<{catalogCount:number}>,
  listPrinters: () => ipcRenderer.invoke("printer:list") as Promise<{name:string;displayName:string;description:string}[]>,
  selectPrinter: (name:string|null) => ipcRenderer.invoke("printer:select",name) as Promise<{selectedPrinter:string|null}>,
  openPrinterSettings: () => ipcRenderer.invoke("printer:windows-settings") as Promise<boolean>,
  testPrinter: () => ipcRenderer.invoke("printer:test") as Promise<{printedTo:string|null}>,
  printReceipt: () => ipcRenderer.invoke("printer:receipt") as Promise<boolean>,
  saveInvoicePdf: (receiptNumber:string) => ipcRenderer.invoke("invoice:save-pdf",receiptNumber) as Promise<{saved:boolean;filePath:string|null}>,
  listProducts: (search?: string) => ipcRenderer.invoke("catalog:list", search ?? "") as Promise<ProductSummary[]>,
  checkout: (input: CheckoutInput) => ipcRenderer.invoke("sales:checkout", input) as Promise<{orderId:string;receiptNumber:string;totalMinor:number}>,
  getLocalStatus: () => ipcRenderer.invoke("app:local-status") as Promise<{databaseReady:boolean;catalogCount:number;cashierName:string|null;pendingCount:number;cashierCount:number;deviceEnrolled:boolean;selectedPrinterName:string|null;lastSyncAt:string|null;lastSyncError:string|null;catalogHash:string;cloudCatalogHash:string|null;catalogMatchesCloud:boolean|null;catalogSyncedAt:string|null}>,
});
