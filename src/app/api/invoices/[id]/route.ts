import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { audit, getRateSnapshot } from "@/lib/cash";
import { db } from "@/lib/db";
import { PaymentMethod } from "@/generated/prisma/client";
import { apiError, assertSameOrigin } from "@/lib/api";

const paymentSchema = z.object({
  method: z.enum(["CASH", "CREDIT_CARD", "BANK"]),
  currencyCode: z.string(),
  amount: z.number().positive(),
  changeAmount: z.number().nonnegative().default(0),
  cardType: z.string().optional(),
  transactionReference: z.string().optional(),
});

const schema = z.object({
  orderType: z.enum(["DINE_IN", "TAKEAWAY", "PICKUP", "DELIVERY", "EMPLOYEE_ORDER", "HOSPITALITY", "COMPLIMENTARY"]).default("PICKUP"),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  customerNotes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().optional(),
    productName: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
    selectedSize: z.string().optional(),
    addons: z.array(z.object({ name: z.string(), price: z.number().nonnegative() })).default([]),
    notes: z.string().optional(),
  })).min(1),
  discountAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  payments: z.array(paymentSchema).min(1),
});

async function findInvoice(id: string, cashierId?: string) {
  return db.invoice.findFirst({
    where: {
      OR: [{ id }, { number: id }, { officialNumber: id }],
      cashierId,
    },
    include: {
      cashier: { select: { id: true, name: true } },
      branch: true,
      items: { include: { addons: true } },
      payment: true,
      payments: true,
      kitchenOrder: true,
    },
  });
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (!user) return apiError("UNAUTHORIZED", "Unauthorized", 401);
  const { id } = await params;
  const invoice = await findInvoice(id, user.role === "CASHIER" ? user.userId : undefined);
  if (!invoice) return apiError("RESOURCE_NOT_FOUND", "Order not found.", 404);
  return NextResponse.json(invoice);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (user?.role !== "CASHIER") return apiError("FORBIDDEN", "Forbidden", 403);
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_INPUT", "Invalid order update.", 400, parsed.error.flatten());
  const before = await findInvoice(id, user.userId);
  if (!before) return apiError("RESOURCE_NOT_FOUND", "Order not found.", 404);
  const ageMs = Date.now() - before.createdAt.getTime();
  if (ageMs > 5 * 60 * 1000 || before.kitchenOrder?.status === "PREPARING") {
    return apiError("FORBIDDEN", "This order can no longer be edited.", 403);
  }

  const subtotal = parsed.data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = Math.max(0, subtotal - parsed.data.discountAmount + parsed.data.taxAmount);
  const rates = await getRateSnapshot();
  const productIds = parsed.data.items.map((item) => item.productId).filter((value): value is string => Boolean(value));
  const products = await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, categoryId: true, currentCost: true } });
  const productById = new Map(products.map((product) => [product.id, product]));

  const updated = await db.$transaction(async (tx) => {
    await tx.invoiceItem.deleteMany({ where: { invoiceId: before.id } });
    await tx.invoicePayment.deleteMany({ where: { invoiceId: before.id } });
    await tx.payment.deleteMany({ where: { invoiceId: before.id } });
    const invoice = await tx.invoice.update({
      where: { id: before.id },
      data: {
        subtotal,
        discountAmount: parsed.data.discountAmount,
        taxAmount: parsed.data.taxAmount,
        totalAmount: total,
        grandTotal: total,
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        customerAddress: parsed.data.customerAddress,
        customerNotes: parsed.data.customerNotes,
        paymentMethod: parsed.data.payments[0].method as PaymentMethod,
        orderType: parsed.data.orderType,
        items: {
          create: parsed.data.items.map((item) => {
            const product = item.productId ? productById.get(item.productId) : undefined;
            const unitCost = product ? Number(product.currentCost) : 0;
            return {
              productId: product?.id,
              categoryId: product?.categoryId,
              productNameSnapshot: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              selectedSizeSnapshot: item.selectedSize,
              totalPrice: item.unitPrice * item.quantity,
              unitCostSnapshot: unitCost,
              totalCostSnapshot: unitCost * item.quantity,
              addons: { create: item.addons.map((addon) => ({ nameSnapshot: addon.name, priceSnapshot: addon.price })) },
            };
          }),
        },
        payment: { create: { method: parsed.data.payments[0].method as PaymentMethod, amount: total } },
      },
      include: { items: { include: { addons: true } }, payment: true, payments: true, kitchenOrder: true },
    });
    for (const payment of parsed.data.payments) {
      const rate = rates.find((item) => item.code === payment.currencyCode);
      if (!rate) throw new Error(`Unsupported currency ${payment.currencyCode}`);
      await tx.invoicePayment.create({
        data: {
          invoiceId: before.id,
          shiftId: before.shiftId,
          method: payment.method as PaymentMethod,
          currencyId: rate.currencyId,
          currencyCode: rate.code,
          amount: payment.amount,
          exchangeRateToBase: rate.rateToBase,
          convertedAmountBase: payment.amount * Number(rate.rateToBase),
          changeAmount: payment.changeAmount,
          cardType: payment.cardType,
          transactionReference: payment.transactionReference,
          transactionAt: new Date(),
        },
      });
    }
    if (before.kitchenOrder) {
      await tx.kitchenOrder.update({
        where: { invoiceId: before.id },
        data: {
          orderType: parsed.data.orderType,
          notes: parsed.data.customerNotes,
          items: parsed.data.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            size: item.selectedSize,
            addons: item.addons,
            notes: item.notes,
          })),
        },
      });
    }
    return invoice;
  });
  await audit(user, "INVOICE_UPDATED", "Invoice", before.id, { originalTotal: before.totalAmount.toString(), editedTotal: total.toFixed(2), difference: (total - Number(before.totalAmount)).toFixed(2) }, before, updated, request);
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (user?.role !== "CASHIER") return apiError("FORBIDDEN", "Forbidden", 403);
  const { id } = await params;
  const invoice = await findInvoice(id, user.userId);
  if (!invoice) return apiError("RESOURCE_NOT_FOUND", "Order not found.", 404);
  await db.$transaction(async (tx) => {
    await tx.invoice.delete({ where: { id: invoice.id } });
  });
  await audit(user, "INVOICE_DELETED", "Invoice", invoice.id, { number: invoice.number }, invoice, null, request);
  return NextResponse.json({ success: true });
}
