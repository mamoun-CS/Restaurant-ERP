const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { app, BrowserWindow } = require("electron");

const activePdfWindows = new Set();

function pageSizeFor(width) {
  if (width === "A4") return "A4";
  const widthMm =
    width === "W58" ? 58 : width === "W80" ? 80 : Number(width) || 80;
  return { width: widthMm * 1000, height: 300000 };
}

async function getPrinters() {
  const window = new BrowserWindow({
    show: false,
    webPreferences: { sandbox: true, contextIsolation: true },
  });
  try {
    return await window.webContents.getPrintersAsync();
  } finally {
    window.destroy();
  }
}

async function printHtml({
  html,
  printerName,
  paperWidth = "W80",
  copies = 1,
  timeoutMs = 30000,
  mockMode = false,
  jobId = "test",
}) {
  if (!html || typeof html !== "string")
    throw codeError("INVALID_CONTENT", "Print content is empty.");
  if (!printerName || typeof printerName !== "string" || !printerName.trim())
    throw codeError(
      "INVALID_PRINTER_NAME",
      "Select a printer before running a printer test.",
    );
  if (printerName === "__NO_LOCAL_PRINTER_DETECTED__") {
    throw codeError(
      "PRINTER_NOT_FOUND",
      "No printer is connected to this PC. The invoice is visible in Invoice Queue but cannot be printed.",
    );
  }
  if (mockMode) return saveMockPreview(jobId, html);
  const printers = await getPrinters();
  if (!printers.length)
    throw codeError(
      "PRINTER_NOT_FOUND",
      "No printer is installed or connected to this PC.",
    );
  if (!printers.some((printer) => printer.name === printerName))
    throw codeError(
      "PRINTER_NOT_FOUND",
      `Printer ${printerName} was not found on this PC.`,
    );

  return new Promise((resolve, reject) => {
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        javascript: false,
        contextIsolation: true,
        sandbox: true,
      },
    });
    const timer = setTimeout(() => {
      printWindow.destroy();
      reject(codeError("PRINT_TIMEOUT", "Print job timed out."));
    }, timeoutMs);
    printWindow.webContents.once("did-finish-load", async () => {
      await wait(400);
      printWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          deviceName: printerName,
          copies,
          margins: { marginType: "none" },
          pageSize: pageSizeFor(paperWidth),
        },
        (success, failureReason) => {
          clearTimeout(timer);
          printWindow.destroy();
          if (!success)
            reject(
              codeError(
                "WINDOWS_PRINT_ERROR",
                failureReason || "Windows print spooler rejected the job.",
              ),
            );
          else resolve({ success: true });
        },
      );
    });
    printWindow.webContents.once(
      "did-fail-load",
      (_event, errorCode, errorDescription) => {
        clearTimeout(timer);
        printWindow.destroy();
        reject(
          codeError("INVALID_CONTENT", `${errorCode} ${errorDescription}`),
        );
      },
    );
    printWindow.loadURL(
      `data:text/html;charset=UTF-8,${encodeURIComponent(html)}`,
    );
  });
}

async function saveHtmlAsPdf({
  html,
  outputFolder,
  paperWidth = "W80",
  timeoutMs = 30000,
  jobId = "test",
  invoiceNumber = "",
}) {
  if (!html || typeof html !== "string")
    throw codeError("INVALID_CONTENT", "Print content is empty.");
  await ensureWritableOutputFolder(outputFolder);
  const filePath = uniquePdfPath(outputFolder, invoiceNumber || jobId);
  return savePdfToPath({ html, filePath, outputFolder, paperWidth, timeoutMs });
}

async function saveTestPrintPdf({
  outputFolder,
  paperWidth = "W80",
  timeoutMs = 30000,
}) {
  await ensureWritableOutputFolder(outputFolder);
  const filePath = uniqueTestPdfPath(outputFolder);
  return savePdfToPath({
    html: testReceiptHtml(),
    filePath,
    outputFolder,
    paperWidth,
    timeoutMs,
  });
}

async function savePdfToPath({
  html,
  filePath,
  outputFolder,
  paperWidth = "W80",
  timeoutMs = 30000,
}) {
  if (!html || typeof html !== "string") {
    throw codeError("INVALID_CONTENT", "Print content is empty.");
  }

  await ensureWritableOutputFolder(outputFolder || path.dirname(filePath));

  const tempFolder = path.join(app.getPath("temp"), "nova-print-agent");
  await fsp.mkdir(tempFolder, { recursive: true });

  const tempHtmlPath = path.join(
    tempFolder,
    `receipt-${Date.now()}-${Math.random().toString(36).slice(2)}.html`,
  );

  const finalHtml = applyPdfPageStyle(html, paperWidth);
  await fsp.writeFile(tempHtmlPath, finalHtml, "utf8");

  const pdfWindow = new BrowserWindow({
    width: 500,
    height: 900,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  activePdfWindows.add(pdfWindow);

  let timeout;

  try {
    timeout = setTimeout(() => {
      if (!pdfWindow.isDestroyed()) {
        pdfWindow.destroy();
      }
    }, timeoutMs);

    await pdfWindow.loadFile(tempHtmlPath);

    await wait(700);

    if (pdfWindow.isDestroyed() || pdfWindow.webContents.isDestroyed()) {
      throw new Error("PDF window was destroyed before PDF generation.");
    }

    const pageStatus = await pdfWindow.webContents.executeJavaScript(`
      ({
        readyState: document.readyState,
        bodyExists: Boolean(document.body),
        bodyTextLength: document.body?.innerText?.length || 0,
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight
      })
    `);

    console.log(
      JSON.stringify({
        event: "PDF_PAGE_READY",
        timestamp: new Date().toISOString(),
        ...pageStatus,
      }),
    );

    if (!pageStatus.bodyExists || pageStatus.bodyTextLength === 0) {
      throw new Error("The PDF page loaded without printable content.");
    }

    const pdfBuffer = await pdfWindow.webContents.printToPDF({
      printBackground: true,
      landscape: false,
      preferCSSPageSize: true,
    });

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("Electron returned an empty PDF buffer.");
    }

    await fsp.writeFile(filePath, pdfBuffer);

    console.log(
      JSON.stringify({
        event: "PDF_SAVED",
        timestamp: new Date().toISOString(),
        filePath,
        size: pdfBuffer.length,
      }),
    );

    return {
      success: true,
      filePath,
    };
  } catch (error) {
    logElectronPdfError(error);

    throw codeError(
      "PDF_SAVE_FAILED",
      `Failed to generate PDF: ${error?.message || "Unknown Electron error"}`,
    );
  } finally {
    clearTimeout(timeout);
    activePdfWindows.delete(pdfWindow);

    if (!pdfWindow.isDestroyed()) {
      pdfWindow.destroy();
    }

    await fsp.unlink(tempHtmlPath).catch(() => {});
  }
}

async function openCashDrawer({
  printerName,
  cashDrawerEnabled = false,
  cashDrawerPin = 0,
  cashDrawerPulseOn = 25,
  cashDrawerPulseOff = 250,
  mockMode = false,
}) {
  if (!cashDrawerEnabled)
    throw codeError(
      "CASH_DRAWER_DISABLED",
      "Cash drawer is disabled in printer settings.",
    );
  if (!printerName)
    throw codeError(
      "PRINTER_NOT_FOUND",
      "Printer name is required for cash drawer.",
    );
  if (mockMode) return { success: true, simulated: true };

  const printers = await getPrinters();
  if (!printers.some((printer) => printer.name === printerName))
    throw codeError(
      "PRINTER_NOT_FOUND",
      `Printer ${printerName} was not found.`,
    );

  const pulse = buildDrawerPulse({
    pin: cashDrawerPin,
    pulseOn: cashDrawerPulseOn,
    pulseOff: cashDrawerPulseOff,
  });
  const bytes = Array.from(pulse);

  return new Promise((resolve, reject) => {
    const drawerWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        javascript: true,
        contextIsolation: false,
        sandbox: false,
      },
    });
    const timer = setTimeout(() => {
      drawerWindow.destroy();
      reject(codeError("DRAWER_TIMEOUT", "Cash drawer command timed out."));
    }, 10000);

    drawerWindow.webContents.once("did-finish-load", async () => {
      try {
        await wait(300);
        const result = await drawerWindow.webContents
          .executeJavaScript(
            `
          (async () => {
            try {
              const buffer = new Uint8Array([${bytes.join(",")}]);
              if (navigator.serial && typeof navigator.serial.getPorts === "function") {
                const ports = await navigator.serial.getPorts();
                if (ports.length > 0) {
                  const port = ports[0];
                  await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: "none" });
                  const writer = port.writable.getWriter();
                  await writer.write(buffer);
                  await writer.close();
                  await port.close();
                  return { success: true };
                }
              }
              return { success: false, error: "NO_SERIAL_PORT" };
            } catch (e) {
              return { success: false, error: e.message };
            }
          })()
        `,
          )
          .catch(() => ({ success: false, error: "EXEC_FAILED" }));

        clearTimeout(timer);
        drawerWindow.destroy();

        if (result?.success) return resolve({ success: true });
        if (result?.error === "NO_SERIAL_PORT")
          return reject(
            codeError(
              "UNSUPPORTED_PRINTER",
              "No serial port available. Connect the printer via USB serial or enable raw printer access.",
            ),
          );
        reject(
          codeError(
            "DRAWER_COMMAND_FAILED",
            result?.error || "Failed to send cash drawer pulse command.",
          ),
        );
      } catch (error) {
        clearTimeout(timer);
        drawerWindow.destroy();
        reject(
          codeError(
            "DRAWER_COMMAND_FAILED",
            error.message || "Failed to send cash drawer pulse command.",
          ),
        );
      }
    });

    drawerWindow.webContents.once(
      "did-fail-load",
      (_event, errorCode, errorDescription) => {
        clearTimeout(timer);
        drawerWindow.destroy();
        reject(
          codeError(
            "DRAWER_COMMAND_FAILED",
            `${errorCode} ${errorDescription}`,
          ),
        );
      },
    );

    drawerWindow.loadURL(
      `data:text/html;charset=UTF-8,${encodeURIComponent("<html><body></body></html>")}`,
    );
  });
}

function buildDrawerPulse({ pin = 0, pulseOn = 25, pulseOff = 250 }) {
  const pulseOnMs = Math.min(
    255,
    Math.max(1, Number.isFinite(Number(pulseOn)) ? Number(pulseOn) : 25),
  );
  const pulseOffMs = Math.min(
    255,
    Math.max(1, Number.isFinite(Number(pulseOff)) ? Number(pulseOff) : 250),
  );
  return Buffer.from([
    0x1b,
    0x70,
    Math.min(255, Math.max(0, Number(pin) || 0)),
    pulseOnMs,
    pulseOffMs,
  ]);
}

function saveMockPreview(jobId, html) {
  const dir = path.join(app.getPath("userData"), "mock-prints");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${jobId}.html`), html, "utf8");
  return { success: true, simulated: true };
}

function uniquePdfPath(outputFolder, invoiceNumber) {
  const now = new Date();
  const date = formatDatePart(now);
  const time = formatTimePart(now);
  const safeInvoiceNumber = sanitizeFilePart(invoiceNumber || "unknown");
  const baseName = `invoice-${safeInvoiceNumber}-${date}-${time}`;
  let filePath = path.join(outputFolder, `${baseName}.pdf`);
  let suffix = 2;
  while (fs.existsSync(filePath)) {
    filePath = path.join(outputFolder, `${baseName}-${suffix}.pdf`);
    suffix += 1;
  }
  return filePath;
}

function uniqueTestPdfPath(outputFolder) {
  const timestamp = `${formatDatePart(new Date())}-${formatTimePart(new Date())}`;
  let filePath = path.join(outputFolder, `test-print-${timestamp}.pdf`);
  let suffix = 2;
  while (fs.existsSync(filePath)) {
    filePath = path.join(outputFolder, `test-print-${timestamp}-${suffix}.pdf`);
    suffix += 1;
  }
  return filePath;
}

async function ensureWritableOutputFolder(outputFolder) {
  if (
    !outputFolder ||
    typeof outputFolder !== "string" ||
    !outputFolder.trim()
  ) {
    throw codeError(
      "PDF_OUTPUT_FOLDER_REQUIRED",
      "Choose an output folder before saving print jobs as PDF.",
    );
  }
  try {
    await fsp.mkdir(outputFolder, { recursive: true });
    const stat = await fsp.stat(outputFolder);
    if (!stat.isDirectory())
      throw new Error("Selected output path is not a folder.");
    await fsp.access(outputFolder, fs.constants.W_OK);
  } catch (error) {
    const wrapped = codeError(
      "PDF_OUTPUT_FOLDER_NOT_WRITABLE",
      error.message || "Selected output folder is not writable.",
    );
    wrapped.originalError = error;
    throw wrapped;
  }
}

function testReceiptHtml() {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>
    @page{margin:0;size:80mm 200mm}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,"Segoe UI",sans-serif}
    body{padding:4mm;font-size:11px;line-height:1.35}.receipt{direction:rtl}.en{direction:ltr;text-align:left}.ar{direction:rtl;text-align:right}
    h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}.meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}
    .line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}
    .qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}
  </style></head><body><main class="receipt"><header><h1>نوفا ستاك</h1><p class="en">Nova Stack Print Agent Test</p></header><section class="meta"><div class="line"><span>الفاتورة / Invoice</span><strong>#TEST</strong></div><div class="line"><span>الوقت / Time</span><strong>${escapeHtml(new Date().toLocaleString("en"))}</strong></div></section><table><tr><td class="qty">1x</td><td><strong>عنصر اختبار</strong><small class="en">PDF output check</small></td><td class="money">₪ 0.00</td></tr></table><section class="totals"><div class="line"><span>الإجمالي / Total</span><strong>₪ 0.00</strong></div></section><footer>تم حفظ ملف PDF بنجاح / PDF save is ready</footer></main></body></html>`;
}

function pdfOptionsFor(paperWidth) {
  const width =
    paperWidth === "W58" ? 58000 : paperWidth === "A4" ? 210000 : 80000;
  const height = paperWidth === "A4" ? 297000 : 200000;
  return {
    printBackground: true,
    landscape: false,
    pageSize: { width, height },
    margins: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  };
}
function applyPdfPageStyle(html, paperWidth = "W80") {
  const pageSize =
    paperWidth === "W58"
      ? "58mm 200mm"
      : paperWidth === "A4"
        ? "A4"
        : "80mm 200mm";

  const documentWidth =
    paperWidth === "W58"
      ? "58mm"
      : paperWidth === "A4"
        ? "210mm"
        : "80mm";

  const pdfStyle = `
    <style id="nova-pdf-page-style">
      @page {
        size: ${pageSize};
        margin: 0;
      }

      html,
      body {
        margin: 0 !important;
        padding: 0 !important;
        width: ${documentWidth};
        background: #ffffff;
      }

      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    </style>
  `;

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${pdfStyle}</head>`);
  }

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  ${pdfStyle}
</head>
<body>
  ${html}
</body>
</html>`;
}
function logElectronPdfError(error) {
  console.error(
    JSON.stringify({
      event: "PDF_GENERATION_FAILED",
      timestamp: new Date().toISOString(),
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
    }),
  );
}

function originalErrorDetails(error) {
  const parts = [];
  if (error?.message) parts.push(error.message);
  if (error?.stack) parts.push(error.stack);
  return parts.join("\n") || "Could not save PDF.";
}

function formatDatePart(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatTimePart(date) {
  return [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join("-");
}

function sanitizeFilePart(value) {
  return (
    String(value || "unknown")
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "unknown"
  );
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (match) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[match],
  );
}

function codeError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  getPrinters,
  printHtml,
  saveHtmlAsPdf,
  saveTestPrintPdf,
  openCashDrawer,
  buildDrawerPulse,
  uniquePdfPath,
  uniqueTestPdfPath,
};
