const fs = require("node:fs");
const path = require("node:path");
const { app, BrowserWindow } = require("electron");

function pageSizeFor(width) {
  if (width === "A4") return "A4";
  const widthMm = width === "W58" ? 58 : width === "W80" ? 80 : Number(width) || 80;
  return { width: widthMm * 1000, height: 300000 };
}

async function getPrinters() {
  const window = new BrowserWindow({ show: false, webPreferences: { sandbox: true, contextIsolation: true } });
  try {
    return await window.webContents.getPrintersAsync();
  } finally {
    window.destroy();
  }
}

async function printHtml({ html, printerName, paperWidth = "W80", copies = 1, timeoutMs = 30000, mockMode = false, jobId = "test" }) {
  if (!html || typeof html !== "string") throw codeError("INVALID_CONTENT", "Print content is empty.");
  if (!printerName) throw codeError("PRINTER_NOT_FOUND", "Printer name is required.");
  if (mockMode) return saveMockPreview(jobId, html);
  const printers = await getPrinters();
  if (!printers.some((printer) => printer.name === printerName)) throw codeError("PRINTER_NOT_FOUND", `Printer ${printerName} was not found.`);

  return new Promise((resolve, reject) => {
    const printWindow = new BrowserWindow({ show: false, webPreferences: { javascript: false, contextIsolation: true, sandbox: true } });
    const timer = setTimeout(() => {
      printWindow.destroy();
      reject(codeError("PRINT_TIMEOUT", "Print job timed out."));
    }, timeoutMs);
    printWindow.webContents.once("did-finish-load", async () => {
      await wait(400);
      printWindow.webContents.print({ silent: true, printBackground: true, deviceName: printerName, copies, margins: { marginType: "none" }, pageSize: pageSizeFor(paperWidth) }, (success, failureReason) => {
        clearTimeout(timer);
        printWindow.destroy();
        if (!success) reject(codeError("WINDOWS_PRINT_ERROR", failureReason || "Windows print spooler rejected the job."));
        else resolve({ success: true });
      });
    });
    printWindow.webContents.once("did-fail-load", (_event, errorCode, errorDescription) => {
      clearTimeout(timer);
      printWindow.destroy();
      reject(codeError("INVALID_CONTENT", `${errorCode} ${errorDescription}`));
    });
    printWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);
  });
}

function saveMockPreview(jobId, html) {
  const dir = path.join(app.getPath("userData"), "mock-prints");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${jobId}.html`), html, "utf8");
  return { success: true, simulated: true };
}

function codeError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { getPrinters, printHtml };
