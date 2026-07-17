import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/cash";
import { apiError, apiSuccess, assertSameOrigin, requireAdmin } from "@/lib/api";

const Decimal = Prisma.Decimal;
const itemSchema = z.object({ purchaseInvoiceItemId: z.string(), quantity: z.string().or(z.number()), unitCost: z.string().or(z.number()), reason: z.string().optional() });
const schema = z.object({
  supplierId: z.string(),
  purchaseInvoiceId: z.string(),
  reason: z.string().min(1),
  returnDate: z.string(),
  refundMethod: z.enum(["CASH", "BANK_TRANSFER", "CARD", "CHEQUE", "OTHER"]),
  refundAmount: z.string().or(z.number()).default(0),
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "COMPLETED", "REJECTED", "CANCELLED"]).default("PENDING_APPROVAL"),
  items: z.array(itemSchema).min(1),
});

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const url = new URL(request.url);
  const rows = await db.purchaseReturn.findMany({
    where: { supplierId: url.searchParams.get("supplierId") || undefined, purchaseInvoiceId: url.searchParams.get("purchaseInvoiceId") || undefined },
    include: { supplier: true, purchaseInvoice: true, items: true },
    orderBy: { returnDate: "desc" },
  });
  return apiSuccess(rows);
}

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_INPUT", "Invalid purchase return.", 400, parsed.error.flatten());
  const data = parsed.data;
  try {
    const created = await db.$transaction(async (tx) => {
      const invoice = await tx.purchaseInvoice.findFirst({ where: { id: data.purchaseInvoiceId, supplierId: data.supplierId }, include: { items: true } });
      if (!invoice) throw new Error("NOT_FOUND");
      for (const row of data.items) {
        const original = invoice.items.find((item) => item.id === row.purchaseInvoiceItemId);
        if (!original) throw new Error("NOT_FOUND");
        if (new Decimal(row.quantity).gt(original.quantity.sub(original.returnedQuantity))) throw new Error("QTY_EXCEEDED");
      }
      const purchaseReturn = await tx.purchaseReturn.create({
        data: {
          supplierId: data.supplierId,
          purchaseInvoiceId: data.purchaseInvoiceId,
          reason: data.reason,
          returnDate: new Date(data.returnDate),
          refundMethod: data.refundMethod,
          refundAmount: new Decimal(data.refundAmount).toDecimalPlaces(2),
          status: data.status,
          createdById: user.userId,
          items: { create: data.items.map((item) => ({ purchaseInvoiceItemId: item.purchaseInvoiceItemId, quantity: new Decimal(item.quantity), unitCost: new Decimal(item.unitCost), reason: item.reason })) },
        },
        include: { items: true },
      });
      if (data.status === "COMPLETED") {
        let refundTotal = new Decimal(0);
        for (const row of purchaseReturn.items) {
          refundTotal = refundTotal.add(row.quantity.mul(row.unitCost));
          const original = invoice.items.find((item) => item.id === row.purchaseInvoiceItemId)!;
          await tx.purchaseInvoiceItem.update({ where: { id: original.id }, data: { returnedQuantity: { increment: row.quantity } } });
          if (original.productId) {
            await tx.inventoryMovement.create({ data: { productId: original.productId, branchId: invoice.branchId, quantity: row.quantity.neg(), unit: original.unit, movementType: "PURCHASE_RETURN_OUT", referenceType: "PurchaseReturn", referenceId: purchaseReturn.id, createdById: user.userId } });
          }
        }
        await tx.supplier.update({ where: { id: data.supplierId }, data: { currentBalance: { decrement: refundTotal.toDecimalPlaces(2) } } });
        await tx.purchaseInvoice.update({ where: { id: invoice.id }, data: { status: "PARTIALLY_RETURNED" } });
      }
      return purchaseReturn;
    });
    await audit(user, "PURCHASE_RETURN_CREATED", "PurchaseReturn", created.id, null, null, created, request);
    return apiSuccess(created, 201);
  } catch (error) {
    if (String((error as Error).message) === "QTY_EXCEEDED") return apiError("PURCHASE_RETURN_QUANTITY_EXCEEDED", "Returned quantity exceeds the available purchased quantity.", 409);
    return apiError("RESOURCE_NOT_FOUND", "Purchase invoice or item not found.", 404);
  }
}
