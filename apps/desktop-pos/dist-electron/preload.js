"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("pos", {
    login: (username, pin) => electron_1.ipcRenderer.invoke("auth:login", username, pin),
    logout: () => electron_1.ipcRenderer.invoke("auth:logout"),
    enroll: (serverUrl, pairingCode, deviceName) => electron_1.ipcRenderer.invoke("device:enroll", serverUrl, pairingCode, deviceName),
    syncNow: () => electron_1.ipcRenderer.invoke("sync:trigger"),
    listProducts: (search) => electron_1.ipcRenderer.invoke("catalog:list", search ?? ""),
    checkout: (input) => electron_1.ipcRenderer.invoke("sales:checkout", input),
    getLocalStatus: () => electron_1.ipcRenderer.invoke("app:local-status"),
});
