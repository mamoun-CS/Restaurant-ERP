"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("pos", {
    login: (username, pin) => electron_1.ipcRenderer.invoke("auth:login", username, pin),
    logout: () => electron_1.ipcRenderer.invoke("auth:logout"),
    enroll: (serverUrl, pairingCode, deviceName) => electron_1.ipcRenderer.invoke("device:enroll", serverUrl, pairingCode, deviceName),
    syncNow: () => electron_1.ipcRenderer.invoke("sync:trigger"),
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
