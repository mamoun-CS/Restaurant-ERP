const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("printAgent", {
  getStatus: () => ipcRenderer.invoke("config:get"),
  saveConfig: (config) => ipcRenderer.invoke("config:save", config),
  chooseOutputFolder: () => ipcRenderer.invoke("folder:choose"),
  pairDevice: (payload) => ipcRenderer.invoke("device:pair", payload),
  getPrinters: () => ipcRenderer.invoke("printers:list"),
  getQueue: () => ipcRenderer.invoke("queue:list"),
  getInvoiceQueue: () => ipcRenderer.invoke("queue:invoiceList"),
  getInvoiceDetail: (jobId) => ipcRenderer.invoke("queue:invoiceDetail", jobId),
  processQueueJob: (jobId, action) => ipcRenderer.invoke("queue:processJob", { jobId, action }),
  rejectQueueJob: (jobId) => ipcRenderer.invoke("queue:rejectJob", jobId),
  testPrinter: (options) => ipcRenderer.invoke("printer:test", options),
  testCashDrawer: (options) => ipcRenderer.invoke("drawer:test", options),
  onStatus: (callback) => ipcRenderer.on("status:update", (_event, status) => callback(status)),
  onPrinters: (callback) => ipcRenderer.on("printers:update", (_event, printers) => callback(printers)),
  onPrintersRefreshing: (callback) => ipcRenderer.on("printers:refreshing", (_event, refreshing) => callback(refreshing)),
  onInvoiceQueue: (callback) => ipcRenderer.on("queue:update", (_event, jobs) => callback(jobs)),
  onPrintResult: (callback) => ipcRenderer.on("print-result", (_event, message) => callback(message)),
});
