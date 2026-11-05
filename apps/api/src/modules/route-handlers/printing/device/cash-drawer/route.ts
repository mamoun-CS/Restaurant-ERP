import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";
import { cashDrawerTestSchema } from "@/lib/printing/validation";
import { rateLimit, requestIp } from "@/lib/api";
import { audit } from "@/lib/cash";
import { publishPrintJobEvent } from "@/lib/printing/sse-broker";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const limited = rateLimit(`cash-drawer:${requestIp(request)}`, 10, 60_000);
  if (limited) return limited;

  const parsed = cashDrawerTestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, code: "INVALID_INPUT", message: "Invalid request.", details: parsed.error.flatten() }, { status: 400 });

  const { printerId } = parsed.data;

  const printerConfig = await db.printerConfiguration.findFirst({
    where: { id: printerId },
    include: { branch: true, printDevice: true },
  });

  if (!printerConfig) return NextResponse.json({ success: false, code: "PRINTER_NOT_FOUND", message: "Printer not found." }, { status: 404 });

  if (!printerConfig.openCashDrawer) return NextResponse.json({ success: false, code: "CASH_DRAWER_DISABLED", message: "Cash drawer is not enabled for this printer." }, { status: 400 });

  const job = await db.printJob.create({
    data: {
      branchId: printerConfig.branchId,
      printDeviceId: printerConfig.printDeviceId,
      printerConfigurationId: printerConfig.id,
      jobType: "OPEN_CASH_DRAWER",
      contentType: "ESC_POS",
      content: "",
      copies: 1,
      paperWidth: printerConfig.paperWidth,
      maxAttempts: 1,
      idempotencyKey: `drawer-test:${printerConfig.printDeviceId}:${printerConfig.id}:${Date.now()}`,
      openCashDrawer: true,
    },
  });
  publishPrintJobEvent(job);

  await audit(admin, "CASH_DRAWER_TEST", "PrintJob", job.id, {
    branchId: printerConfig.branchId,
    deviceId: printerConfig.printDeviceId,
    printerId: printerConfig.id,
    printerName: printerConfig.displayName,
  }, null, { jobId: job.id, command: "OPEN_CASH_DRAWER" }, request);

  return NextResponse.json({ success: true, jobId: job.id, command: "OPEN_CASH_DRAWER", printerId: printerConfig.id }, { status: 201 });
}
