import { contextBridge, ipcRenderer } from "electron";
import type { CheckoutInput, ProductSummary } from "./shared";

contextBridge.exposeInMainWorld("pos", {
  login: (username: string, pin: string) => ipcRenderer.invoke("auth:login", username, pin) as Promise<{name:string;expiresAt:number}>,
  logout: () => ipcRenderer.invoke("auth:logout") as Promise<boolean>,
  enroll: (serverUrl: string, pairingCode: string, deviceName: string) => ipcRenderer.invoke("device:enroll", serverUrl, pairingCode, deviceName) as Promise<{enrolled:boolean;catalogCount:number;cashierCount:number}>,
  syncNow: () => ipcRenderer.invoke("sync:trigger") as Promise<boolean>,
  listProducts: (search?: string) => ipcRenderer.invoke("catalog:list", search ?? "") as Promise<ProductSummary[]>,
  checkout: (input: CheckoutInput) => ipcRenderer.invoke("sales:checkout", input) as Promise<{orderId:string;receiptNumber:string;totalMinor:number}>,
  getLocalStatus: () => ipcRenderer.invoke("app:local-status") as Promise<{databaseReady:boolean;catalogCount:number;cashierName:string|null;pendingCount:number;cashierCount:number;deviceEnrolled:boolean;lastSyncAt:string|null;lastSyncError:string|null}>,
});
