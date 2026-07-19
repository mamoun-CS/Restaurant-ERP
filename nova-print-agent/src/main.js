const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, shell } = require("electron");
const path = require("node:path");
const { loadConfig, saveConfig, loadToken, saveToken } = require("./config");
const { getPrinters, printHtml } = require("./printer");
const { connectToServer, disconnectFromServer, pairDevice, syncPrinters } = require("./websocket");
const { stats, readQueue } = require("./queue");

let settingsWindow = null;
let tray = null;
let currentConfig = null;
let currentToken = "";
let connectionStatus = { connected: false, message: "Disconnected" };

function createSettingsWindow() {
  if (settingsWindow) return settingsWindow.show();
  settingsWindow = new BrowserWindow({ width: 920, height: 760, minWidth: 720, minHeight: 620, webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  settingsWindow.loadFile(path.join(__dirname, "settings.html"));
  settingsWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  settingsWindow.webContents.on("will-navigate", (event, url) => { if (!url.startsWith("file://")) event.preventDefault(); });
  settingsWindow.on("close", (event) => { if (!app.isQuitting) { event.preventDefault(); settingsWindow.hide(); } });
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, "..", "assets", "tray.png"));
  tray = new Tray(icon.isEmpty() ? nativeImage.createFromDataURL("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGklEQVR42mNk+M9Qz0AEYBxVSF+FowwMABJxAhH2g0NAAAAAAElFTkSuQmCC") : icon);
  tray.setToolTip("Nova Print Agent");
  updateTrayMenu();
}

function updateTrayMenu() {
  if (!tray) return;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: `Status: ${connectionStatus.message}`, enabled: false },
    { type: "separator" },
    { label: "Open Nova Print Agent", click: createSettingsWindow },
    { label: "Refresh Printers", click: refreshPrinters },
    { label: "Reconnect", click: reconnect },
    { label: currentConfig?.paused ? "Resume Printing" : "Pause Printing", click: () => { currentConfig.paused = !currentConfig.paused; saveConfig(currentConfig); updateTrayMenu(); } },
    { label: "Open Logs", click: () => shell.openPath(app.getPath("userData")) },
    { type: "separator" },
    { label: "Exit", click: () => { app.isQuitting = true; disconnectFromServer(); app.quit(); } },
  ]));
}

function reconnect() {
  currentConfig = loadConfig();
  currentToken = loadToken();
  app.setLoginItemSettings({ openAtLogin: Boolean(currentConfig.startWithWindows) });
  connectToServer(currentConfig, currentToken, (status) => { connectionStatus = status; updateTrayMenu(); settingsWindow?.webContents.send("status:update", getStatus()); });
}

async function refreshPrinters() {
  const printers = (await getPrinters()).map((printer) => ({ name: printer.name, displayName: printer.displayName || printer.name, isDefault: printer.isDefault, status: printer.status }));
  await syncPrinters(currentConfig, currentToken, printers).catch(() => undefined);
  settingsWindow?.webContents.send("printers:update", printers);
  return printers;
}

function getStatus() {
  return { ...connectionStatus, config: { ...currentConfig, hasToken: Boolean(currentToken) }, queue: stats(), appVersion: app.getVersion(), platform: `${process.platform} ${require("node:os").release()}` };
}

app.whenReady().then(() => {
  currentConfig = loadConfig();
  currentToken = loadToken();
  app.setLoginItemSettings({ openAtLogin: Boolean(currentConfig.startWithWindows) });
  createTray();
  createSettingsWindow();
  reconnect();
  refreshPrinters().catch(() => undefined);
});

app.on("window-all-closed", (event) => event.preventDefault());
app.on("before-quit", () => { app.isQuitting = true; });

ipcMain.handle("config:get", async () => getStatus());
ipcMain.handle("config:save", async (_event, config) => { currentConfig = { ...currentConfig, ...config }; saveConfig(currentConfig); reconnect(); return { success: true }; });
ipcMain.handle("device:pair", async (_event, { pairingCode, config }) => {
  currentConfig = { ...currentConfig, ...config };
  const paired = await pairDevice(currentConfig, pairingCode);
  currentConfig = { ...currentConfig, deviceId: paired.deviceId, deviceCode: paired.deviceCode, branchId: paired.branchId };
  saveToken(paired.token);
  saveConfig(currentConfig);
  reconnect();
  return { success: true, deviceId: paired.deviceId, deviceCode: paired.deviceCode };
});
ipcMain.handle("printers:list", refreshPrinters);
ipcMain.handle("queue:list", async () => readQueue().jobs.slice(-100).reverse());
ipcMain.handle("printer:test", async (_event, options) => printHtml({ printerName: options.printerName, paperWidth: options.paperWidth || "W80", copies: 1, mockMode: currentConfig.mockMode, html: "<h1>Nova Stack</h1><p>Print Agent Test</p><hr><p>Silent printing is ready.</p>" }));
