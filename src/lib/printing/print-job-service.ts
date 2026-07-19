import type { Prisma } from "@/generated/prisma/client";
import { renderKitchenTicket } from "./kitchen-template";
import { renderCustomerReceipt } from "./receipt-template";
import { routeKitchenItems } from "./printer-routing";
import type { PrintInvoice } from "./types";

type Tx = Prisma.TransactionClient;

export async function createPrintJobsForInvoice(tx: Tx, invoice: PrintInvoice) {
  const jobs = [];
  const cashierPrinter = await tx.printerConfiguration.findFirst({
    where: { branchId: invoice.branchId, printerType: "CASHIER", enabled: true, autoPrint: true },
    orderBy: { createdAt: "asc" },
  });

  if (cashierPrinter) {
    jobs.push(await tx.printJob.upsert({
      where: { idempotencyKey: `invoice:${invoice.id}:receipt:${cashierPrinter.id}` },
      update: {},
      create: {
        branchId: invoice.branchId,
        printDeviceId: cashierPrinter.printDeviceId,
        printerConfigurationId: cashierPrinter.id,
        invoiceId: invoice.id,
        jobType: "CUSTOMER_RECEIPT",
        contentType: "HTML",
        content: renderCustomerReceipt(invoice),
        copies: cashierPrinter.copies,
        paperWidth: cashierPrinter.paperWidth,
        customWidthMm: cashierPrinter.customWidthMm,
        maxAttempts: Number(process.env.PRINT_JOB_MAX_ATTEMPTS || 5),
        idempotencyKey: `invoice:${invoice.id}:receipt:${cashierPrinter.id}`,
      },
    }));
  }

  const routed = await routeKitchenItems(tx, invoice.branchId, invoice.items);
  for (const group of routed) {
    jobs.push(await tx.printJob.upsert({
      where: { idempotencyKey: `invoice:${invoice.id}:ticket:${group.printer.id}` },
      update: {},
      create: {
        branchId: invoice.branchId,
        printDeviceId: group.printer.printDeviceId,
        printerConfigurationId: group.printer.id,
        invoiceId: invoice.id,
        kitchenOrderId: invoice.kitchenOrder?.id,
        jobType: group.printer.printerType === "BAR" ? "BAR_TICKET" : "KITCHEN_TICKET",
        contentType: "HTML",
        content: renderKitchenTicket({
          orderNumber: invoice.kitchenOrder?.orderNumber || invoice.number,
          orderType: invoice.orderType,
          cashierName: invoice.cashier.name,
          notes: invoice.customerNotes,
          items: group.items.map((item) => ({
            productName: item.productNameSnapshot,
            quantity: item.quantity,
            size: item.selectedSizeSnapshot,
            addons: item.addons,
          })),
        }),
        copies: group.printer.copies,
        paperWidth: group.printer.paperWidth,
        customWidthMm: group.printer.customWidthMm,
        maxAttempts: Number(process.env.PRINT_JOB_MAX_ATTEMPTS || 5),
        idempotencyKey: `invoice:${invoice.id}:ticket:${group.printer.id}`,
      },
    }));
  }

  return jobs;
}

export async function reprintJob(tx: Tx, jobId: string) {
  const original = await tx.printJob.findUniqueOrThrow({ where: { id: jobId } });
  return tx.printJob.create({
    data: {
      branchId: original.branchId,
      printDeviceId: original.printDeviceId,
      printerConfigurationId: original.printerConfigurationId,
      invoiceId: original.invoiceId,
      kitchenOrderId: original.kitchenOrderId,
      originalPrintJobId: original.id,
      jobType: original.jobType,
      contentType: original.contentType,
      content: original.content,
      copies: original.copies,
      paperWidth: original.paperWidth,
      customWidthMm: original.customWidthMm,
      maxAttempts: original.maxAttempts,
      idempotencyKey: `reprint:${original.id}:${Date.now()}`,
    },
  });
}
