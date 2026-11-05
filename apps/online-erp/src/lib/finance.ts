import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { verifyToken, type Session } from "@/lib/auth";
import { db } from "@/lib/db";

export type AdminSession = Session & { role: "ADMIN" };

export async function requireAdmin(): Promise<AdminSession | NextResponse> {
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return user as AdminSession;
}

export function isResponse(value: AdminSession | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

export function toNumber(value: Prisma.Decimal | number | string | null | undefined) {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value);
}

export function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function parseRange(searchParams: URLSearchParams) {
  const now = new Date();
  const fallbackFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : fallbackFrom;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : now;
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

export async function recalculateProductCost(productId: string) {
  const recipe = await db.productIngredient.findMany({ where: { productId }, include: { ingredient: true } });
  const cost = recipe.reduce((sum, item) => sum + toNumber(item.quantityUsed) * toNumber(item.ingredient.unitCost), 0);
  await db.product.update({ where: { id: productId }, data: { currentCost: money(cost) } });
  return money(cost);
}

export async function recalculateProductsUsingIngredient(ingredientId: string) {
  const links = await db.productIngredient.findMany({ where: { ingredientId }, select: { productId: true } });
  const productIds = [...new Set(links.map((x) => x.productId))];
  await Promise.all(productIds.map((productId) => recalculateProductCost(productId)));
}

export async function getFinancialSummary(searchParams: URLSearchParams) {
  const { from, to } = parseRange(searchParams);
  const invoiceWhere: Prisma.InvoiceWhereInput = { createdAt: { gte: from, lte: to }, status: { in: ["PAID", "COMPLETED"] } };
  const expenseWhere = { expenseDate: { gte: from, lte: to }, active: true };
  const [invoices, expenses, products] = await Promise.all([
    db.invoice.findMany({
      where: invoiceWhere,
      include: {
        cashier: { select: { id: true, name: true } },
        items: { include: { category: true, product: { include: { translations: true, category: true } } } },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.operatingExpense.findMany({ where: expenseWhere, orderBy: { expenseDate: "desc" } }),
    db.product.findMany({ include: { translations: true, category: true, ingredients: { include: { ingredient: true } } } }),
  ]);

  const invoiceRevenue = (invoice: { grandTotal?: Prisma.Decimal | number | string | null; totalAmount?: Prisma.Decimal | number | string | null }) => {
    const grandTotal = toNumber(invoice.grandTotal);
    return grandTotal > 0 ? grandTotal : toNumber(invoice.totalAmount);
  };
  const revenue = money(invoices.reduce((sum, invoice) => sum + invoiceRevenue(invoice), 0));
  const cogs = money(invoices.reduce((sum, invoice) => sum + invoice.items.reduce((itemSum, item) => itemSum + toNumber(item.totalCostSnapshot), 0), 0));
  const grossProfit = money(revenue - cogs);
  const operatingExpenses = money(expenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0));
  const netProfit = money(grossProfit - operatingExpenses);

  const byProduct = new Map<string, { name: string; quantity: number; revenue: number; cogs: number; grossProfit: number }>();
  const byCategory = new Map<string, { name: string; revenue: number; cogs: number; grossProfit: number }>();
  const byEmployee = new Map<string, { name: string; revenue: number; cogs: number; grossProfit: number }>();
  const byDay = new Map<string, { period: string; revenue: number; cogs: number; grossProfit: number; netProfit: number }>();

  for (const invoice of invoices) {
    const day = invoice.createdAt.toISOString().slice(0, 10);
    const dayRow = byDay.get(day) || { period: day, revenue: 0, cogs: 0, grossProfit: 0, netProfit: 0 };
    const employeeRow = byEmployee.get(invoice.cashierId) || { name: invoice.cashier.name, revenue: 0, cogs: 0, grossProfit: 0 };
    const totalItemRevenue = invoice.items.reduce((sum, item) => sum + toNumber(item.totalPrice), 0);
    const invoiceTotal = invoiceRevenue(invoice);
    for (const item of invoice.items) {
      const itemBaseRevenue = toNumber(item.totalPrice);
      const itemRevenue = totalItemRevenue > 0 ? itemBaseRevenue * (invoiceTotal / totalItemRevenue) : itemBaseRevenue;
      const itemCost = toNumber(item.totalCostSnapshot);
      const productKey = item.productId || item.productNameSnapshot;
      const productName = item.product?.translations.find((x) => x.locale === "en")?.name || item.productNameSnapshot;
      const categoryKey = item.categoryId || "uncategorized";
      const categoryName = item.category?.nameEn || item.product?.category.nameEn || "Uncategorized";
      const productRow = byProduct.get(productKey) || { name: productName, quantity: 0, revenue: 0, cogs: 0, grossProfit: 0 };
      const categoryRow = byCategory.get(categoryKey) || { name: categoryName, revenue: 0, cogs: 0, grossProfit: 0 };
      productRow.quantity += item.quantity;
      productRow.revenue += itemRevenue;
      productRow.cogs += itemCost;
      productRow.grossProfit += itemRevenue - itemCost;
      categoryRow.revenue += itemRevenue;
      categoryRow.cogs += itemCost;
      categoryRow.grossProfit += itemRevenue - itemCost;
      employeeRow.revenue += itemRevenue;
      employeeRow.cogs += itemCost;
      employeeRow.grossProfit += itemRevenue - itemCost;
      dayRow.revenue += itemRevenue;
      dayRow.cogs += itemCost;
      byProduct.set(productKey, productRow);
      byCategory.set(categoryKey, categoryRow);
    }
    byEmployee.set(invoice.cashierId, employeeRow);
    byDay.set(day, dayRow);
  }

  for (const expense of expenses) {
    const day = expense.expenseDate.toISOString().slice(0, 10);
    const dayRow = byDay.get(day) || { period: day, revenue: 0, cogs: 0, grossProfit: 0, netProfit: 0 };
    dayRow.netProfit -= toNumber(expense.amount);
    byDay.set(day, dayRow);
  }

  for (const row of byDay.values()) {
    row.revenue = money(row.revenue);
    row.cogs = money(row.cogs);
    row.grossProfit = money(row.revenue - row.cogs);
    if (row.netProfit <= 0) row.netProfit = money(row.grossProfit + row.netProfit);
  }

  return {
    range: { from: from.toISOString(), to: to.toISOString() },
    totals: { revenue, cogs, grossProfit, operatingExpenses, netProfit },
    expenses: expenses.map((expense) => ({ ...expense, amount: toNumber(expense.amount) })),
    products: products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.translations.find((x) => x.locale === "en")?.name || product.sku,
      category: product.category.nameEn,
      price: toNumber(product.price),
      currentCost: toNumber(product.currentCost),
      recipeCost: money(product.ingredients.reduce((sum, item) => sum + toNumber(item.quantityUsed) * toNumber(item.ingredient.unitCost), 0)),
      ingredients: product.ingredients.length,
    })),
    byProduct: [...byProduct.values()].map((row) => ({ ...row, revenue: money(row.revenue), cogs: money(row.cogs), grossProfit: money(row.grossProfit) })).sort((a, b) => b.revenue - a.revenue),
    byCategory: [...byCategory.values()].map((row) => ({ ...row, revenue: money(row.revenue), cogs: money(row.cogs), grossProfit: money(row.grossProfit) })).sort((a, b) => b.grossProfit - a.grossProfit),
    byEmployee: [...byEmployee.values()].map((row) => ({ ...row, revenue: money(row.revenue), cogs: money(row.cogs), grossProfit: money(row.grossProfit) })).sort((a, b) => b.revenue - a.revenue),
    byDay: [...byDay.values()].sort((a, b) => a.period.localeCompare(b.period)),
  };
}
