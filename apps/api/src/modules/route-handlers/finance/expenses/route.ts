import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ExpenseCategory, ExpenseFrequency } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { isResponse, requireAdmin } from "@/lib/finance";

const schema = z.object({
  title: z.string().min(2),
  category: z.enum(ExpenseCategory),
  frequency: z.enum(ExpenseFrequency).default("ONE_TIME"),
  amount: z.number().positive(),
  expenseDate: z.string().datetime().or(z.string().date()),
  notes: z.string().optional(),
  invoiceName: z.string().max(255).optional(),
  active: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const user = await requireAdmin();
  if (isResponse(user)) return user;
  const params = request.nextUrl.searchParams;
  const expenses = await db.operatingExpense.findMany({
    where: {
      category: (params.get("category") as ExpenseCategory | null) || undefined,
      active: params.get("active") === "false" ? false : undefined,
    },
    orderBy: { expenseDate: "desc" },
    take: 200,
  });
  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (isResponse(user)) return user;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid expense", details: parsed.error.flatten() }, { status: 400 });
  const expense = await db.operatingExpense.create({ data: { ...parsed.data, expenseDate: new Date(parsed.data.expenseDate), createdById: user.userId, branchId: user.branchId } });
  await db.auditLog.create({ data: { userId: user.userId, action: "CREATE", entityType: "OperatingExpense", entityId: expense.id, metadata: { amount: parsed.data.amount, category: parsed.data.category } } });
  return NextResponse.json(expense, { status: 201 });
}
