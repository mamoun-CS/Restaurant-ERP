"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("pos", {
    login: (username, pin) => electron_1.ipcRenderer.invoke("auth:login", username, pin),
    logout: () => electron_1.ipcRenderer.invoke("auth:logout"),
    verifyAdmin: (username, pin) => electron_1.ipcRenderer.invoke("admin:verify", username, pin),
    getAdminCredentialState: (username) => electron_1.ipcRenderer.invoke("admin:credential-state", username),
    logoutAdmin: () => electron_1.ipcRenderer.invoke("admin:logout"),
    listRecentOrders: () => electron_1.ipcRenderer.invoke("admin:recent-orders"),
    openOnlineAdmin: () => electron_1.ipcRenderer.invoke("admin:open-online"),
    enroll: (serverUrl, pairingCode, deviceName) => electron_1.ipcRenderer.invoke("device:enroll", serverUrl, pairingCode, deviceName),
    syncNow: () => electron_1.ipcRenderer.invoke("sync:trigger"),
    openCash: (openingAmount) => electron_1.ipcRenderer.invoke("cash:open", openingAmount),
    closeCash: (countedAmount) => electron_1.ipcRenderer.invoke("cash:close", countedAmount),
    setCloudServer: (url) => electron_1.ipcRenderer.invoke("device:set-server", url),
    runDiagnostics: () => electron_1.ipcRenderer.invoke("app:diagnostics"),
    refreshCatalog: () => electron_1.ipcRenderer.invoke("catalog:refresh"),
    listPrinters: () => electron_1.ipcRenderer.invoke("printer:list"),
    selectPrinter: (name) => electron_1.ipcRenderer.invoke("printer:select", name),
    openPrinterSettings: () => electron_1.ipcRenderer.invoke("printer:windows-settings"),
    testPrinter: () => electron_1.ipcRenderer.invoke("printer:test"),
    printReceipt: () => electron_1.ipcRenderer.invoke("printer:receipt"),
    saveInvoicePdf: (receiptNumber) => electron_1.ipcRenderer.invoke("invoice:save-pdf", receiptNumber),
    listProducts: (search) => electron_1.ipcRenderer.invoke("catalog:list", search ?? ""),
    checkout: (input) => electron_1.ipcRenderer.invoke("sales:checkout", input),
    getLocalStatus: () => electron_1.ipcRenderer.invoke("app:local-status"),
});
