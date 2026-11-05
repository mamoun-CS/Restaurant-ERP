import { z } from "zod";
import { Prisma, PurchaseInvoiceStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/cash";
import { apiError, apiSuccess, assertSameOrigin, requireAdmin } from "@/lib/api";

const Decimal = Prisma.Decimal;
const itemSchema = z.object({
  productId: z.string().optional(),
  itemName: z.string().min(1),
  quantity: z.string().or(z.number()),
  unit: z.string().min(1),
  unitPurchasePrice: z.string().or(z.number()),
  discount: z.string().or(z.number()).default(0),
  tax: z.string().or(z.number()).default(0),
  batchNumber: z.string().optional(),
  expirationDate: z.string().optional(),
});
const schema = z.object({
  officialNumber: z.string().min(1),
  supplierId: z.string(),
  branchId: z.string(),
  purchaseDate: z.string(),
  dueDate: z.string().optional(),
  currencyCode: z.string().default("ILS"),
  exchangeRateToBase: z.string().or(z.number()).default(1),
  additionalCosts: z.string().or(z.number()).default(0),
  discount: z.string().or(z.number()).default(0),
  tax: z.string().or(z.number()).default(0),
  notes: z.string().optional(),
  attachmentUrl: z.string().optional(),
  confirm: z.boolean().default(false),
  items: z.array(itemSchema).min(1),
});

function money(value: string | number) {
  return new Decimal(value || 0).toDecimalPlaces(2);
}

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const url = new URL(request.url);
  const purchases = await db.purchaseInvoice.findMany({
    where: {
      supplierId: url.searchParams.get("supplierId") || undefined,
      branchId: url.searchParams.get("branchId") || undefined,
      status: (url.searchParams.get("status") as PurchaseInvoiceStatus | null) || undefined,
    },
    include: { supplier: true, branch: true, items: true, payments: true },
    orderBy: { purchaseDate: "desc" },
    take: 100,
  });
  return apiSuccess(purchases);
}

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_INPUT", "Invalid purchase invoice.", 400, parsed.error.flatten());
  const data = parsed.data;
  const supplier = await db.supplier.findFirst({ where: { id: data.supplierId, deletedAt: null, active: true } });
  if (!supplier) return apiError("SUPPLIER_NOT_FOUND", "Supplier not found.", 404);
  const subtotal = data.items.reduce((sum, item) => sum.add(new Decimal(item.quantity).mul(item.unitPurchasePrice)), new Decimal(0)).toDecimalPlaces(2);
  const total = subtotal.sub(money(data.discount)).add(money(data.tax)).add(money(data.additionalCosts)).toDecimalPlaces(2);
  const purchase = await db.$transaction(async (tx) => {
    const created = await tx.purchaseInvoice.create({
      data: {
        internalNumber: `PIN-${Date.now()}`,
        officialNumber: data.officialNumber,
        supplierId: data.supplierId,
        branchId: data.branchId,
        purchaseDate: new Date(data.purchaseDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        currencyCode: data.currencyCode,
        exchangeRateToBase: new Decimal(data.exchangeRateToBase),
        subtotal,
        discount: money(data.discount),
        tax: money(data.tax),
        additionalCosts: money(data.additionalCosts),
        total,
        remainingAmount: total,
        status: data.confirm ? "UNPAID" : "DRAFT",
        notes: data.notes,
        attachmentUrl: data.attachmentUrl,
        createdById: user.userId,
        items: {
          create: data.items.map((item) => {
            const lineTotal = new Decimal(item.quantity).mul(item.unitPurchasePrice).sub(item.discount).add(item.tax).toDecimalPlaces(2);
            return {
              productId: item.productId,
              itemNameSnapshot: item.itemName,
              quantity: new Decimal(item.quantity),
              unit: item.unit,
              unitPurchasePrice: new Decimal(item.unitPurchasePrice),
              discount: money(item.discount),
              tax: money(item.tax),
              total: lineTotal,
              batchNumber: item.batchNumber,
              expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
            };
          }),
        },
      },
      include: { items: true },
    });
    if (data.confirm) {
      await tx.supplier.update({ where: { id: data.supplierId }, data: { currentBalance: { increment: total } } });
      for (const item of created.items) {
        if (!item.productId) continue;
        await tx.product.update({ where: { id: item.productId }, data: { currentCost: item.unitPurchasePrice.toDecimalPlaces(2) } });
        await tx.purchasePriceHistory.create({ data: { productId: item.productId, purchaseInvoiceId: created.id, unitCost: item.unitPurchasePrice, currencyCode: data.currencyCode, exchangeRateToBase: new Decimal(data.exchangeRateToBase) } });
        await tx.inventoryMovement.create({ data: { productId: item.productId, branchId: data.branchId, quantity: item.quantity, unit: item.unit, movementType: "PURCHASE_IN", referenceType: "PurchaseInvoice", referenceId: created.id, createdById: user.userId } });
      }
    }
    return created;
  });
  await audit(user, "PURCHASE_CREATED", "PurchaseInvoice", purchase.id, { confirm: data.confirm }, null, purchase, request);
  return apiSuccess(purchase, 201);
}
