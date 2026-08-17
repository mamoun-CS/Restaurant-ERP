const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, shell, dialog, Notification } = require("electron");
const path = require("node:path");
const { loadConfig, saveConfig, loadToken, saveToken } = require("./config");
const { getPrinters, printHtml, saveTestPrintPdf, openCashDrawer } = require("./printer");
const { connectToServer, disconnectFromServer, pairDevice, syncPrinters, getRuntimeStatus, processQueuedJob, rejectQueuedJob } = require("./websocket");
const { stats, readQueue } = require("./queue");

let settingsWindow = null;
let tray = null;
let currentConfig = null;
let currentToken = "";
let connectionStatus = { connected: false, message: "Disconnected" };
let isRefreshingPrinters = false;
let cachedPrinters = [];
let lastPrinterRefreshAt = "";
let lastShownJobMessage = "";

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
  connectToServer(currentConfig, currentToken, handleStatusChange);
}

function handleStatusChange(status) {
  connectionStatus = status;
  updateTrayMenu();
  const currentStatus = getStatus();
  settingsWindow?.webContents.send("status:update", currentStatus);
  if (status.lastJobMessage && status.lastJobMessage !== lastShownJobMessage) {
    lastShownJobMessage = status.lastJobMessage;
    showJobMessage(status.lastJobMessage);
  }
}

function showJobMessage(message) {
  settingsWindow?.webContents.send("print-result", message);
  if (Notification.isSupported()) {
    new Notification({ title: "Nova Print Agent", body: message }).show();
  }
}

async function refreshPrinters() {
  if (isRefreshingPrinters) return cachedPrinters;
  isRefreshingPrinters = true;
  settingsWindow?.webContents.send("printers:refreshing", true);
  console.log(JSON.stringify({ event: "PRINTER_REFRESH_STARTED", timestamp: new Date().toISOString() }));
  try {
    const printers = (await getPrinters()).map((printer) => ({ name: printer.name, displayName: printer.displayName || printer.name, isDefault: printer.isDefault, status: printer.status }));
    cachedPrinters = printers;
    lastPrinterRefreshAt = new Date().toISOString();
    await syncPrinters(currentConfig, currentToken, printers).catch(() => undefined);
    settingsWindow?.webContents.send("printers:update", printers);
    console.log(JSON.stringify({ event: "PRINTER_REFRESH_COMPLETED", timestamp: lastPrinterRefreshAt, count: printers.length }));
    return printers;
  } catch (error) {
    console.log(JSON.stringify({ event: "PRINTER_REFRESH_FAILED", timestamp: new Date().toISOString(), message: error.message }));
    throw error;
  } finally {
    isRefreshingPrinters = false;
    settingsWindow?.webContents.send("printers:refreshing", false);
  }
}

function getStatus() {
  return { ...connectionStatus, ...getRuntimeStatus(), config: { ...currentConfig, hasToken: Boolean(currentToken) }, queue: stats(), appVersion: app.getVersion(), platform: `${process.platform} ${require("node:os").release()}`, lastPrinterRefreshAt, isRefreshingPrinters };
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
ipcMain.handle("folder:choose", async () => {
  const result = await dialog.showOpenDialog(settingsWindow || undefined, { properties: ["openDirectory", "createDirectory"] });
  if (result.canceled || !result.filePaths.length) return { canceled: true };
  currentConfig = { ...currentConfig, outputFolder: result.filePaths[0] };
  saveConfig(currentConfig);
  settingsWindow?.webContents.send("status:update", getStatus());
  return { canceled: false, folder: result.filePaths[0] };
});
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
ipcMain.handle("queue:invoiceList", async () => readQueue().jobs.slice(-200).reverse());
ipcMain.handle("queue:invoiceDetail", async (_event, jobId) => {
  const queue = readQueue();
  const job = queue.jobs.find((item) => item.id === jobId);
  return job || null;
});
ipcMain.handle("queue:processJob", async (_event, { jobId, action }) => {
  const result = await processQueuedJob(jobId, action, currentConfig, currentToken, handleStatusChange);
  settingsWindow?.webContents.send("status:update", getStatus());
  return result;
});
ipcMain.handle("queue:rejectJob", async (_event, jobId) => {
  const result = await rejectQueuedJob(jobId, currentConfig, currentToken, handleStatusChange);
  settingsWindow?.webContents.send("status:update", getStatus());
  return result;
});
ipcMain.handle("printer:test", async (_event, options = {}) => {
  const outputMode = normalizeOutputMode(options.outputMode || currentConfig.outputMode);
  const outputFolder = options.outputFolder || currentConfig.outputFolder;
  const paperWidth = options.paperWidth || "W80";

  if (outputMode === "pdf") {
    return saveTestPrintPdf({ outputFolder, paperWidth });
  }

  const printerName = options.printerName;
  if (!printerName || typeof printerName !== "string" || !printerName.trim()) {
    throw codeError("INVALID_PRINTER_NAME", "Select a printer before running a printer test.");
  }
  const printers = await getPrinters();
  if (!printers.some((printer) => printer.name === printerName)) {
    throw codeError("PRINTER_NOT_FOUND", `Printer ${printerName} was not found on this PC.`);
  }
  return printHtml({ printerName, paperWidth, copies: 1, mockMode: currentConfig.mockMode, html: "<h1>Nova Stack</h1><p>Print Agent Test</p><hr><p>Silent printing is ready.</p>" });
});
ipcMain.handle("drawer:test", async (_event, options) => openCashDrawer({ printerName: options.printerName, cashDrawerEnabled: options.cashDrawerEnabled ?? currentConfig.cashDrawerEnabled, cashDrawerPin: options.cashDrawerPin ?? currentConfig.cashDrawerPin, cashDrawerPulseOn: options.cashDrawerPulseOn ?? currentConfig.cashDrawerPulseOn, cashDrawerPulseOff: options.cashDrawerPulseOff ?? currentConfig.cashDrawerPulseOff, mockMode: currentConfig.mockMode }));

function normalizeOutputMode(outputMode) {
  return outputMode === "pdf" ? "pdf" : "printer";
}

function codeError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
