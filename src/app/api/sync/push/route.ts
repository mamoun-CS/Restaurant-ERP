import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getRateSnapshot } from "@/lib/cash";
import { authenticatePosDevice, verifyOfflinePolicyToken } from "@/lib/pos-device-auth";
import { rateLimit, requestIp } from "@/lib/api";

const optionSchema = z.object({ name: z.string().min(1).max(100), priceMinor: z.number().int().nonnegative() });
const itemSchema = z.object({ productId: z.string().min(1), productName: z.string().min(1).max(200), quantity: z.number().int().positive().max(10000), unitPriceMinor: z.number().int().nonnegative(), options: z.array(optionSchema).max(30).default([]) });
const paymentSchema = z.object({ method: z.literal("CASH"), currencyCode: z.literal("ILS"), amountMinor: z.number().int().positive(), processorReference: z.string().max(120).optional() });
const orderSchema = z.object({
  id: z.string().uuid(), idempotencyKey: z.string().uuid(), cashierId: z.string().min(1), createdAt: z.string().datetime(),
  currencyCode: z.literal("ILS"), subtotalMinor: z.number().int().nonnegative(), discountMinor: z.number().int().nonnegative(),
  taxMinor: z.number().int().nonnegative(), totalMinor: z.number().int().nonnegative(),
  discountReason: z.string().max(250).optional(), cashierPolicyToken: z.string().min(20).max(4096),
  supervisorId: z.string().optional(), supervisorPolicyToken: z.string().min(20).max(4096).optional(),
  items: z.array(itemSchema).min(1).max(200), payments: z.array(paymentSchema).min(1).max(10),
});
const payloadSchema = z.object({ orders: z.array(orderSchema).min(1).max(50) });
const money = (minor: number) => (minor / 100).toFixed(2);
const createdAtSkewed = (value: string) => {
  const timestamp = Date.parse(value);
  return !Number.isFinite(timestamp) || timestamp > Date.now() + 5 * 60_000 || timestamp < Date.now() - 180 * 24 * 60 * 60_000;
};

export async function POST(request: Request) {
  const limited = rateLimit(`pos-sync:${requestIp(request)}`, 60, 60_000);
  if (limited) return limited;
  const device = await authenticatePosDevice(request);
  if (!device) return NextResponse.json({ error: "A valid POS device token is required." }, { status: 401 });
  if (!device.registerId) return NextResponse.json({ error: "This terminal has no assigned cash register." }, { status: 409 });
  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid sync batch.", details: parsed.error.flatten() }, { status: 400 });
  const acknowledgements: { clientTransactionId: string; invoiceId?: string; officialNumber?: string; error?: string; permanent?: boolean }[] = [];
  const rates = await getRateSnapshot();
  const rate = rates.find((entry) => entry.code === "ILS");
  if (!rate) return NextResponse.json({ error: "ILS currency is not configured." }, { status: 503 });

  for (const order of parsed.data.orders) {
    try {
      const existing = await db.invoice.findFirst({ where: { OR: [{ idempotencyKey: order.idempotencyKey }, { clientTransactionId: order.id }] }, select: { id: true, number: true } });
      if (existing) {
        acknowledgements.push({ clientTransactionId: order.id, invoiceId: existing.id, officialNumber: existing.number });
        continue;
      }
      if (order.taxMinor !== 0) throw Object.assign(new Error("Unprovisioned tax policy."), { permanent: true });
      const itemSubtotal = order.items.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor, 0);
      const paymentTotal = order.payments.reduce((sum, payment) => sum + payment.amountMinor, 0);
      if (!Number.isSafeInteger(itemSubtotal) || itemSubtotal !== order.subtotalMinor || order.totalMinor !== order.subtotalMinor - order.discountMinor + order.taxMinor || paymentTotal !== order.totalMinor) throw Object.assign(new Error("Order totals do not reconcile."), { permanent: true });
      if (createdAtSkewed(order.createdAt)) throw Object.assign(new Error("Sale timestamp is outside the allowed offline window."), { permanent: true });
      const cashierPolicy = await verifyOfflinePolicyToken(order.cashierPolicyToken, new Date(order.createdAt));
      if (!cashierPolicy || cashierPolicy.deviceId !== device.id || cashierPolicy.userId !== order.cashierId || cashierPolicy.branchId !== device.branchId) throw Object.assign(new Error("Cashier policy token is invalid for this sale."), { permanent: true });
      const cashierLimit = cashierPolicy.canDiscount ? Math.min(Math.floor(order.subtotalMinor * cashierPolicy.maxDiscountPercent / 100), cashierPolicy.maxDiscountMinor) : 0;
      let supervisorPolicy: Awaited<ReturnType<typeof verifyOfflinePolicyToken>> = null;
      if (order.discountMinor > cashierLimit) {
        if (!order.supervisorId || !order.supervisorPolicyToken || !order.discountReason?.trim()) throw Object.assign(new Error("This discount requires a supervisor and a reason."), { permanent: true });
        supervisorPolicy = await verifyOfflinePolicyToken(order.supervisorPolicyToken, new Date(order.createdAt));
        if (!supervisorPolicy?.supervisor || supervisorPolicy.userId !== order.supervisorId || supervisorPolicy.deviceId !== device.id || supervisorPolicy.branchId !== device.branchId) throw Object.assign(new Error("Supervisor policy token is invalid for this sale."), { permanent: true });
      } else if (order.discountMinor > 0 && !order.discountReason?.trim()) throw Object.assign(new Error("A discount reason is required."), { permanent: true });
      const [cashierAssignment, products] = await Promise.all([
        db.posDeviceCashier.findFirst({ where: { deviceId: device.id, userId: order.cashierId, active: true, user: { active: true, role: "CASHIER", deletedAt: null } }, include: { user: true } }),
        db.product.findMany({ where: { id: { in: [...new Set(order.items.map((item) => item.productId))] } }, select: { id: true, categoryId: true, currentCost: true, requiresPreparation: true } }),
      ]);
      if (!cashierAssignment || cashierAssignment.user.branchId !== device.branchId) throw Object.assign(new Error("Cashier is not authorized for this device."), { permanent: true });
      const productById = new Map(products.map((product) => [product.id, product]));
      if (order.items.some((item) => !productById.has(item.productId))) throw Object.assign(new Error("Order includes a product that is unknown to the server."), { permanent: true });
      const createdAt = new Date(order.createdAt);
      const invoice = await db.$transaction(async (tx) => {
        const year = createdAt.getFullYear();
        const sequence = await tx.invoiceSequence.upsert({ where: { branchId_registerId_year: { branchId: device.branchId, registerId: device.registerId!, year } }, create: { branchId: device.branchId, registerId: device.registerId!, year, lastNumber: 1 }, update: { lastNumber: { increment: 1 } } });
        const [branch, register] = await Promise.all([tx.branch.findUniqueOrThrow({ where: { id: device.branchId } }), tx.cashRegister.findUniqueOrThrow({ where: { id: device.registerId! } })]);
        const official = `${branch.code}-${register.number}-${year}-${String(sequence.lastNumber).padStart(6, "0")}`;
        const created = await tx.invoice.create({ data: {
          createdAt, number: official, officialNumber: official, idempotencyKey: order.idempotencyKey, clientTransactionId: order.id,
          subtotal: money(order.subtotalMinor), discountAmount: money(order.discountMinor), taxAmount: money(order.taxMinor),
          totalAmount: money(order.totalMinor), grandTotal: money(order.totalMinor), paymentMethod: "CASH", cashierId: order.cashierId,
          branchId: device.branchId, status: "PAID", orderType: "PICKUP",
          items: { create: order.items.map((item) => {
            const product = productById.get(item.productId)!;
            const unitPrice = money(item.unitPriceMinor);
            return { productId: product.id, categoryId: product.categoryId, productNameSnapshot: item.productName, quantity: item.quantity,
              unitPrice, totalPrice: money(item.unitPriceMinor * item.quantity), unitCostSnapshot: product.currentCost,
              totalCostSnapshot: Number(product.currentCost) * item.quantity,
              addons: { create: item.options.map((option) => ({ nameSnapshot: option.name, priceSnapshot: money(option.priceMinor) })) },
            };
          }) },
          payment: { create: { method: "CASH", amount: money(order.totalMinor) } },
          payments: { create: order.payments.map((payment) => ({ method: "CASH", currencyId: rate.currencyId, currencyCode: "ILS", amount: money(payment.amountMinor), exchangeRateToBase: rate.rateToBase, convertedAmountBase: money(payment.amountMinor * Number(rate.rateToBase)), transactionReference: payment.processorReference, transactionAt: createdAt })) },
        } });
        for (const item of order.items) {
          await tx.inventoryMovement.create({ data: { productId: item.productId, branchId: device.branchId, quantity: -item.quantity, unit: "unit", movementType: "SALE", referenceType: "Invoice", referenceId: created.id, createdById: order.cashierId, createdAt } });
        }
        if (order.items.some((item) => productById.get(item.productId)?.requiresPreparation)) {
          await tx.kitchenOrder.create({ data: { orderNumber: `KO-${randomUUID().slice(0, 8).toUpperCase()}`, invoiceId: created.id, branchId: device.branchId, cashierName: cashierAssignment.user.name, orderType: "PICKUP", items: order.items.map((item) => ({ productName: item.productName, quantity: item.quantity, options: item.options })) as Prisma.InputJsonValue } });
        }
        await tx.auditLog.create({ data: { userId: order.cashierId, branchId: device.branchId, action: "OFFLINE_INVOICE_SYNCED", entityType: "Invoice", entityId: created.id, metadata: { deviceId: device.id, clientTransactionId: order.id, discountMinor: order.discountMinor, discountReason: order.discountReason ?? null, supervisorId: supervisorPolicy ? order.supervisorId : null, policyVersion: cashierPolicy.policyVersion } } });
        return { id: created.id, number: created.number };
      }, { isolationLevel: "Serializable" });
      acknowledgements.push({ clientTransactionId: order.id, invoiceId: invoice.id, officialNumber: invoice.number });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Order sync failed.";
      const existing = await db.invoice.findFirst({ where: { OR: [{ idempotencyKey: order.idempotencyKey }, { clientTransactionId: order.id }] }, select: { id: true, number: true } }).catch(() => null);
      if (existing) acknowledgements.push({ clientTransactionId: order.id, invoiceId: existing.id, officialNumber: existing.number });
      else acknowledgements.push({ clientTransactionId: order.id, error: message, permanent: Boolean((error as { permanent?: boolean }).permanent) });
    }
  }
  await db.posDevice.update({ where: { id: device.id }, data: { lastSyncAt: new Date(), lastSyncError: acknowledgements.some((item) => item.error) ? "One or more orders need attention." : null } });
  return NextResponse.json({ acknowledgements });
}
