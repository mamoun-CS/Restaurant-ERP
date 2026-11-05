import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/cash";
import { apiError, apiSuccess, assertSameOrigin, requireAdmin } from "@/lib/api";

const schema = z.object({
  nameEn: z.string().min(2),
  nameAr: z.string().min(2),
  active: z.boolean().default(true),
  requiresApproval: z.boolean().default(false),
  cashierLimit: z.string().or(z.number()).default(0),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  return apiSuccess(await db.expenseCategoryMaster.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }] }));
}

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const user = await requireAdmin();
  if (user instanceof Response) return user;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_INPUT", "Invalid expense category.", 400, parsed.error.flatten());
  const created = await db.expenseCategoryMaster.create({ data: { ...parsed.data, cashierLimit: new Prisma.Decimal(parsed.data.cashierLimit).toDecimalPlaces(2) } });
  await audit(user, "EXPENSE_CATEGORY_CREATED", "ExpenseCategory", created.id, null, null, created, request);
  return apiSuccess(created, 201);
}
