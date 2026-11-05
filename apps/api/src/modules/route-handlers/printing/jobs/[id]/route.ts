import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  if (user instanceof NextResponse) return user;
  const { id } = await params;
  const job = await db.printJob.findFirst({
    where: {
      id,
      invoice: user.role === "CASHIER" ? { cashierId: user.userId } : undefined,
    },
    include: {
      invoice: { select: { id: true, number: true, cashierId: true, branchId: true, paymentMethod: true } },
      printerConfiguration: { select: { id: true, displayName: true, localPrinterName: true } },
      printDevice: { select: { id: true, name: true, status: true, lastHeartbeatAt: true } },
    },
  });
  if (!job) {
    return NextResponse.json({ success: false, code: "RESOURCE_NOT_FOUND", message: "Print job not found." }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    job: {
      id: job.id,
      status: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      errorCode: job.errorCode,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      sentAt: job.sentAt,
      processingAt: job.processingAt,
      printedAt: job.printedAt,
      failedAt: job.failedAt,
      invoiceId: job.invoiceId,
      invoiceNumber: job.invoice?.number,
      branchId: job.invoice?.branchId || job.branchId,
      cashierId: job.invoice?.cashierId,
      printerId: job.printerConfigurationId,
      printerName: job.printerConfiguration?.displayName || job.printerConfiguration?.localPrinterName,
      deviceName: job.printDevice?.name,
      deviceStatus: job.printDevice?.status,
      paymentMethod: job.invoice?.paymentMethod,
      receiptType: job.originalPrintJobId ? "REPRINT" : job.jobType,
    },
  });
}
