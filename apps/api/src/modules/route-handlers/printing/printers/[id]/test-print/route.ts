import { NextResponse } from "next/server";
import { assertSameOrigin, requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";
import { publishPrintJobEvent } from "@/lib/printing/sse-broker";
import { baseHtml, escapeHtml, resolvePaperWidthCss } from "@/lib/printing/receipt-template";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await requireAdmin();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const printer = await db.printerConfiguration.findUnique({
    where: { id },
    include: { branch: true, printDevice: true },
  });

  if (!printer) {
    return NextResponse.json({ success: false, code: "PRINTER_NOT_FOUND", message: "Printer not found." }, { status: 404 });
  }

  const now = new Date();
  const widthCss = resolvePaperWidthCss(printer.paperWidth, printer.customWidthMm);
  const testHtml = baseHtml("test-receipt", "rtl", `
    <main class="receipt">
      <header>
        <h1>شيخ الكار</h1>
        <p class="en center">Sheikh Al Kar - ERP</p>
        <p><strong>طباعة تجريبية / TEST PRINT</strong></p>
      </header>
      <section class="meta">
        <div class="row"><span>الطابعة / Printer</span><strong class="value">${escapeHtml(printer.displayName)}</strong></div>
        <div class="row"><span>النوع / Type</span><strong class="value">${escapeHtml(printer.printerType)}</strong></div>
        <div class="row"><span>الاتصال / Connection</span><strong class="value">${escapeHtml(printer.connectionType)}${printer.connectionType === "LAN" && printer.ipAddress ? ` (${printer.ipAddress}:${printer.port})` : ""}</strong></div>
        <div class="row"><span>اسم ويندوز / Spooler</span><strong class="value">${escapeHtml(printer.localPrinterName)}</strong></div>
        <div class="row"><span>عرض الورق / Width</span><strong class="value">${escapeHtml(printer.paperWidth)} (${widthCss})</strong></div>
        <div class="row"><span>الجهاز / Device</span><strong class="value">${escapeHtml(printer.printDevice.name)}</strong></div>
        <div class="row"><span>التاريخ / Date</span><strong class="value" dir="ltr">${now.toLocaleString("ar-PS")}</strong></div>
      </section>
      <section style="margin: 4mm 0; text-align: center; font-size: 11px;">
        <p>✓ تم اختبار محاذاة النص العربي بنجاح</p>
        <p class="en">✓ English rasterization verified successfully</p>
        <p style="font-family: monospace; font-size: 13px; font-weight: bold; margin-top: 2mm; letter-spacing: 2px;">*TEST-OK-2026*</p>
      </section>
      <footer>
        <strong>نظام شيخ الكار لإدارة المطاعم</strong>
        <p>نهاية الفحص التجريبي - قص الورق</p>
      </footer>
    </main>
  `, widthCss);

  const job = await db.printJob.create({
    data: {
      branchId: printer.branchId,
      printDeviceId: printer.printDeviceId,
      printerConfigurationId: printer.id,
      jobType: "TEST_PRINT",
      contentType: "HTML",
      content: testHtml,
      copies: 1,
      paperWidth: printer.paperWidth,
      customWidthMm: printer.customWidthMm,
      maxAttempts: 2,
      idempotencyKey: `test-print:${printer.id}:${Date.now()}`,
      openCashDrawer: false,
    },
  });

  publishPrintJobEvent(job);

  return NextResponse.json({ success: true, jobId: job.id, message: "Test print job dispatched successfully." });
}
