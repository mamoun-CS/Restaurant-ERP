import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin, requireSession } from "@/lib/api";
import { db } from "@/lib/db";
import { createCustomerReceiptPrintJob } from "@/lib/printing/print-job-service";
import { publishPrintJobEvent } from "@/lib/printing/sse-broker";

const schema = z.object({
  mode: z.enum(["PRINT", "REPRINT"]).default("PRINT"),
  requestId: z.string().min(8).max(120).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await requireSession();
  if (user instanceof NextResponse) return user;
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ success: false, code: "INVALID_INPUT", message: "Invalid print request.", details: parsed.error.flatten() }, { status: 400 });
  }
  const { id } = await params;
  const invoice = await db.invoice.findFirst({
    where: {
      OR: [{ id }, { number: id }, { officialNumber: id }],
      cashierId: user.role === "CASHIER" ? user.userId : undefined,
    },
    include: {
      cashier: { select: { id: true, name: true } },
      branch: true,
      items: { include: { addons: true, product: { include: { translations: true } } } },
      payments: true,
      kitchenOrder: true,
    },
  });
  if (!invoice) {
    return NextResponse.json({ success: false, code: "RESOURCE_NOT_FOUND", message: "Invoice not found." }, { status: 404 });
  }
  if (!invoice.items.length) {
    return NextResponse.json({ success: false, code: "EMPTY_INVOICE_ITEMS", message: "Invoice has no printable items." }, { status: 409 });
  }

  try {
    const job = await db.$transaction(async (tx) => {
      if (parsed.data.mode === "PRINT") {
        const existing = await tx.printJob.findFirst({
          where: { invoiceId: invoice.id, jobType: "CUSTOMER_RECEIPT", originalPrintJobId: null, status: { in: ["PENDING", "SENT", "PROCESSING", "PRINTED"] } },
          include: { printerConfiguration: true },
          orderBy: { createdAt: "asc" },
        });
        if (existing) return existing;
      }
      return createCustomerReceiptPrintJob(tx, invoice, { reprint: parsed.data.mode === "REPRINT", requestedById: user.userId });
    });
    publishPrintJobEvent(job);
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        receiptType: parsed.data.mode === "REPRINT" ? "REPRINT" : "CUSTOMER_RECEIPT",
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        branchId: invoice.branchId,
        cashierId: invoice.cashierId,
        printerId: job.printerConfigurationId,
        paymentMethod: invoice.paymentMethod,
      },
      message: parsed.data.mode === "REPRINT" ? "Reprint job sent to Print Agent." : "Invoice sent to Print Agent.",
    });
  } catch (error) {
    const message = error instanceof Error && error.message === "NO_CASHIER_PRINTER_CONFIGURED"
      ? "No cashier printer is configured for this branch."
      : "Invoice could not be sent to Print Agent.";
    return NextResponse.json({ success: false, code: "PRINT_AGENT_ERROR", message }, { status: 409 });
  }
}
