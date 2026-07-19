const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("printAgent", {
  getStatus: () => ipcRenderer.invoke("config:get"),
  saveConfig: (config) => ipcRenderer.invoke("config:save", config),
  pairDevice: (payload) => ipcRenderer.invoke("device:pair", payload),
  getPrinters: () => ipcRenderer.invoke("printers:list"),
  getQueue: () => ipcRenderer.invoke("queue:list"),
  testPrinter: (options) => ipcRenderer.invoke("printer:test", options),
  onStatus: (callback) => ipcRenderer.on("status:update", (_event, status) => callback(status)),
  onPrinters: (callback) => ipcRenderer.on("printers:update", (_event, printers) => callback(printers)),
});
