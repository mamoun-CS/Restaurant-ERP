import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/cash";
import { apiError, apiSuccess, assertSameOrigin, requireAdmin } from "@/lib/api";

const schema = z.object({
  nameEn: z.string().min(2).optional(),
  nameAr: z.string().min(2).optional(),
  active: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  cashierLimit: z.string().or(z.number()).optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_INPUT", "Invalid expense category.", 400, parsed.error.flatten());
  const before = await db.expenseCategoryMaster.findFirst({ where: { id, deletedAt: null } });
  if (!before) return apiError("RESOURCE_NOT_FOUND", "Expense category not found.", 404);
  const updated = await db.expenseCategoryMaster.update({
    where: { id },
    data: { ...parsed.data, cashierLimit: parsed.data.cashierLimit === undefined ? undefined : new Prisma.Decimal(parsed.data.cashierLimit).toDecimalPlaces(2) },
  });
  await audit(user, "EXPENSE_CATEGORY_UPDATED", "ExpenseCategory", id, null, before, updated, request);
  return apiSuccess(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const { id } = await params;
  const before = await db.expenseCategoryMaster.findFirst({ where: { id, deletedAt: null } });
  if (!before) return apiError("RESOURCE_NOT_FOUND", "Expense category not found.", 404);
  const updated = await db.expenseCategoryMaster.update({ where: { id }, data: { active: false, deletedAt: new Date(), deletedBy: user.userId } });
  await audit(user, "EXPENSE_CATEGORY_DISABLED", "ExpenseCategory", id, null, before, updated, request);
  return apiSuccess(updated);
}
