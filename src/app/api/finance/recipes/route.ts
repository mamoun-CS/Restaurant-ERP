import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isResponse, recalculateProductCost, requireAdmin } from "@/lib/finance";

const schema = z.object({
  productId: z.string().min(1),
  ingredients: z.array(z.object({ ingredientId: z.string().min(1), quantityUsed: z.number().positive() })),
});

export async function GET(request: NextRequest) {
  const user = await requireAdmin();
  if (isResponse(user)) return user;
  const productId = request.nextUrl.searchParams.get("productId") || undefined;
  const recipes = await db.productIngredient.findMany({ where: { productId }, include: { ingredient: true, product: { include: { translations: true } } }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json(recipes);
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (isResponse(user)) return user;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid recipe", details: parsed.error.flatten() }, { status: 400 });
  await db.productIngredient.deleteMany({ where: { productId: parsed.data.productId } });
  await db.productIngredient.createMany({ data: parsed.data.ingredients.map((item) => ({ productId: parsed.data.productId, ingredientId: item.ingredientId, quantityUsed: item.quantityUsed })) });
  const currentCost = await recalculateProductCost(parsed.data.productId);
  await db.auditLog.create({ data: { userId: user.userId, action: "UPDATE_RECIPE", entityType: "Product", entityId: parsed.data.productId, metadata: { currentCost } } });
  return NextResponse.json({ productId: parsed.data.productId, currentCost });
}
