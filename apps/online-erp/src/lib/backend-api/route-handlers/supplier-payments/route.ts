import { z } from "zod";
import { Prisma, PurchaseInvoiceStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/cash";
import { apiError, apiSuccess, assertSameOrigin, requireAdmin } from "@/lib/api";

const Decimal = Prisma.Decimal;
const schema = z.object({
  supplierId: z.string(),
  purchaseInvoiceId: z.string().optional(),
  branchId: z.string(),
  amount: z.string().or(z.number()),
  currencyCode: z.string().default("ILS"),
  exchangeRateToBase: z.string().or(z.number()).default(1),
  source: z.enum(["CASH_REGISTER", "BANK", "EXTERNAL_CASH"]),
  method: z.enum(["CASH", "BANK_TRANSFER", "CARD", "CHEQUE", "OTHER"]),
  accountName: z.string().optional(),
  referenceNumber: z.string().optional(),
  paymentDate: z.string(),
  notes: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

function nextStatus(total: Prisma.Decimal, paid: Prisma.Decimal): PurchaseInvoiceStatus {
  if (paid.gte(total)) return "PAID";
  if (paid.gt(0)) return "PARTIALLY_PAID";
  return "UNPAID";
}

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const url = new URL(request.url);
  const payments = await db.supplierPayment.findMany({
    where: { supplierId: url.searchParams.get("supplierId") || undefined },
    include: { supplier: true, purchaseInvoice: true, branch: true },
    orderBy: { paymentDate: "desc" },
    take: 100,
  });
  return apiSuccess(payments);
}

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_INPUT", "Invalid supplier payment.", 400, parsed.error.flatten());
  const amount = new Decimal(parsed.data.amount).toDecimalPlaces(2);
  const payment = await db.$transaction(async (tx) => {
    const supplier = await tx.supplier.findFirst({ where: { id: parsed.data.supplierId, deletedAt: null } });
    if (!supplier) throw new Error("SUPPLIER_NOT_FOUND");
    let invoice = null;
    if (parsed.data.purchaseInvoiceId) {
      invoice = await tx.purchaseInvoice.findFirst({ where: { id: parsed.data.purchaseInvoiceId, supplierId: parsed.data.supplierId } });
      if (!invoice) throw new Error("PURCHASE_NOT_FOUND");
      const paidAmount = invoice.paidAmount.add(amount).toDecimalPlaces(2);
      const remainingAmount = Prisma.Decimal.max(invoice.total.sub(paidAmount), new Decimal(0)).toDecimalPlaces(2);
      await tx.purchaseInvoice.update({ where: { id: invoice.id }, data: { paidAmount, remainingAmount, status: nextStatus(invoice.total, paidAmount) } });
    }
    const created = await tx.supplierPayment.create({
      data: { ...parsed.data, amount, exchangeRateToBase: new Decimal(parsed.data.exchangeRateToBase), paymentDate: new Date(parsed.data.paymentDate), createdById: user.userId },
    });
    await tx.supplier.update({ where: { id: parsed.data.supplierId }, data: { currentBalance: { decrement: amount } } });
    return created;
  }).catch((error) => {
    if (String(error.message) === "SUPPLIER_NOT_FOUND") return null;
    throw error;
  });
  if (!payment) return apiError("SUPPLIER_NOT_FOUND", "Supplier not found.", 404);
  await audit(user, "SUPPLIER_PAYMENT_CREATED", "SupplierPayment", payment.id, null, null, payment, request);
  return apiSuccess(payment, 201);
}
