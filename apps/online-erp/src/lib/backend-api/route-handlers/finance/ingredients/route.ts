import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isResponse, money, recalculateProductsUsingIngredient, requireAdmin } from "@/lib/finance";

const schema = z.object({
  nameEn: z.string().min(2),
  nameAr: z.string().min(2),
  unit: z.string().min(1),
  purchaseCost: z.number().positive(),
  purchaseQty: z.number().positive(),
  active: z.boolean().optional(),
});

export async function GET() {
  const user = await requireAdmin();
  if (isResponse(user)) return user;
  const ingredients = await db.ingredient.findMany({ include: { products: { include: { product: { include: { translations: true } } } } }, orderBy: { nameEn: "asc" } });
  return NextResponse.json(ingredients);
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (isResponse(user)) return user;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid ingredient", details: parsed.error.flatten() }, { status: 400 });
  const unitCost = parsed.data.purchaseCost / parsed.data.purchaseQty;
  const ingredient = await db.ingredient.create({ data: { ...parsed.data, unitCost: money(unitCost) } });
  await db.auditLog.create({ data: { userId: user.userId, action: "CREATE", entityType: "Ingredient", entityId: ingredient.id, metadata: { unitCost } } });
  return NextResponse.json(ingredient, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const user = await requireAdmin();
  if (isResponse(user)) return user;
  const parsed = schema.extend({ id: z.string().min(1) }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid ingredient", details: parsed.error.flatten() }, { status: 400 });
  const { id, ...data } = parsed.data;
  const unitCost = data.purchaseCost / data.purchaseQty;
  const ingredient = await db.ingredient.update({ where: { id }, data: { ...data, unitCost: money(unitCost) } });
  await recalculateProductsUsingIngredient(id);
  await db.auditLog.create({ data: { userId: user.userId, action: "UPDATE", entityType: "Ingredient", entityId: id, metadata: { unitCost } } });
  return NextResponse.json(ingredient);
}
