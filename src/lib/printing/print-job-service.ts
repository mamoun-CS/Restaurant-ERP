import { Prisma } from "@/generated/prisma/client";
import { renderKitchenTicket } from "./kitchen-template";
import { buildInvoiceReceiptHtml } from "./receipt-template";
import { routeKitchenItems } from "./printer-routing";
import type { PrintInvoice } from "./types";

type Tx = Prisma.TransactionClient;
type ReportedPrinter = {
  name?: string;
  displayName?: string;
  isDefault?: boolean;
};

export async function createPrintJobsForInvoice(tx: Tx, invoice: PrintInvoice) {
  const receiptHtml = createReceiptHtmlOrThrow(invoice);
  const jobs = [];
  const cashierPrinter = await tx.printerConfiguration.findFirst({
    where: { branchId: invoice.branchId, printerType: "CASHIER", enabled: true, autoPrint: true },
    orderBy: { createdAt: "asc" },
  });

  if (cashierPrinter) {
    const isCashPayment = invoice.payments?.some((payment) => payment.method === "CASH") || invoice.paymentMethod === "CASH";
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
        content: receiptHtml,
        copies: cashierPrinter.copies,
        paperWidth: cashierPrinter.paperWidth,
        customWidthMm: cashierPrinter.customWidthMm,
        maxAttempts: Number(process.env.PRINT_JOB_MAX_ATTEMPTS || 5),
        idempotencyKey: `invoice:${invoice.id}:receipt:${cashierPrinter.id}`,
        openCashDrawer: Boolean(isCashPayment && cashierPrinter.openCashDrawer),
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

export async function createCustomerReceiptPrintJob(
  tx: Tx,
  invoice: PrintInvoice,
  options: { reprint?: boolean; requestedById?: string } = {},
) {
  const cashierPrinter = await resolveCashierPrinter(tx, invoice.branchId);
  if (!cashierPrinter) throw new Error("NO_CASHIER_PRINTER_CONFIGURED");

  const original = options.reprint
    ? await tx.printJob.findFirst({
        where: { invoiceId: invoice.id, jobType: "CUSTOMER_RECEIPT" },
        orderBy: { createdAt: "asc" },
      })
    : null;
  const idempotencyKey = options.reprint
    ? `invoice:${invoice.id}:receipt:reprint:${Date.now()}`
    : `invoice:${invoice.id}:receipt:${cashierPrinter.id}`;

  const content = createReceiptHtmlOrThrow(invoice, { reprint: options.reprint });

  return tx.printJob.upsert({
    where: { idempotencyKey },
    update: {},
    create: {
      branchId: invoice.branchId,
      printDeviceId: cashierPrinter.printDeviceId,
      printerConfigurationId: cashierPrinter.id,
      invoiceId: invoice.id,
      originalPrintJobId: original?.id,
      jobType: "CUSTOMER_RECEIPT",
      contentType: "HTML",
      content,
      copies: cashierPrinter.copies,
      paperWidth: cashierPrinter.paperWidth,
      customWidthMm: cashierPrinter.customWidthMm,
      maxAttempts: Number(process.env.PRINT_JOB_MAX_ATTEMPTS || 5),
      idempotencyKey,
    },
  });
}

function createReceiptHtmlOrThrow(invoice: PrintInvoice, options: { reprint?: boolean } = {}) {
  if (!invoice) throw new Error("INVOICE_NOT_FOUND");
  if (!invoice.items?.length) throw new Error("PRINT_JOB_EMPTY_INVOICE_ITEMS");
  const content = buildInvoiceReceiptHtml(invoice, { locale: "ar", reprint: options.reprint });
  if (!content.trim()) throw new Error("PRINT_JOB_EMPTY_HTML");
  console.log({
    event: "PRINT_JOB_CONTENT_CREATED",
    invoiceId: invoice.id,
    itemCount: invoice.items.length,
    hasCustomer: Boolean(invoice.customerName || invoice.customerPhone),
    hasEmployee: Boolean(invoice.cashier),
    hasBranch: Boolean(invoice.branch),
    htmlLength: content.length,
  });
  return content;
}

async function resolveCashierPrinter(tx: Tx, branchId: string) {
  const configured = await tx.printerConfiguration.findFirst({
    where: { branchId, printerType: "CASHIER", enabled: true, autoPrint: true },
    orderBy: { createdAt: "asc" },
  });
  if (configured) return configured;

  const device = await tx.printDevice.findFirst({
    where: {
      branchId,
      status: { in: ["ONLINE", "OFFLINE"] },
      disabledAt: null,
    },
    orderBy: [{ status: "asc" }, { lastHeartbeatAt: "desc" }],
  });
  const printers = Array.isArray(device?.localPrinters)
    ? (device.localPrinters as ReportedPrinter[])
    : [];
  const reported = printers.find((printer) => printer.isDefault && printer.name) || printers.find((printer) => printer.name);
  if (!device) return null;
  const localPrinterName = reported?.name || "__NO_LOCAL_PRINTER_DETECTED__";

  return tx.printerConfiguration.create({
    data: {
      branchId,
      printDeviceId: device.id,
      printerType: "CASHIER",
      localPrinterName,
      displayName: reported?.displayName || reported?.name || "No local printer detected",
      paperWidth: "W80",
      copies: 1,
      autoPrint: true,
      enabled: true,
      openCashDrawer: false,
    },
  });
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
      openCashDrawer: false,
    },
  });
}
