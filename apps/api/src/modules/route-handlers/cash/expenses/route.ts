import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { audit, getRateSnapshot } from "@/lib/cash";
import { db } from "@/lib/db";

const schema = z.object({ shiftId: z.string(), category: z.string(), amount: z.number().positive(), currencyCode: z.string(), reason: z.string().min(2), notes: z.string().optional(), receiptUrl: z.string().optional() });

export async function POST(request: Request) {
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid expense", details: parsed.error.flatten() }, { status: 400 });
  const shift = await db.cashShift.findFirst({ where: { id: parsed.data.shiftId, employeeId: user.role === "CASHIER" ? user.userId : undefined, status: "OPEN" } });
  if (!shift) return NextResponse.json({ error: "Open shift not found" }, { status: 404 });
  const rate = (await getRateSnapshot()).find((item) => item.code === parsed.data.currencyCode);
  if (!rate) return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
  const expense = await db.shiftExpense.create({ data: { shiftId: shift.id, category: parsed.data.category as never, amount: parsed.data.amount, currencyId: rate.currencyId, currencyCode: rate.code, exchangeRateToBase: rate.rateToBase, convertedAmountBase: parsed.data.amount * Number(rate.rateToBase), reason: parsed.data.reason, notes: parsed.data.notes, receiptUrl: parsed.data.receiptUrl, employeeId: user.userId } });
  await audit(user, "SHIFT_EXPENSE_RECORDED", "ShiftExpense", expense.id, { shiftId: shift.id }, null, expense, request);
  return NextResponse.json(expense, { status: 201 });
}
