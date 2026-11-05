import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { audit, getRateSnapshot } from "@/lib/cash";
import { db } from "@/lib/db";

const schema = z.object({ shiftId: z.string(), originalInvoiceNumber: z.string(), returnedItems: z.array(z.unknown()).default([]), amount: z.number().positive(), currencyCode: z.string(), refundMethod: z.enum(["CASH", "CREDIT_CARD", "BANK"]), reason: z.string().min(2) });

export async function POST(request: Request) {
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (user?.role !== "CASHIER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid return", details: parsed.error.flatten() }, { status: 400 });
  const shift = await db.cashShift.findFirst({ where: { id: parsed.data.shiftId, employeeId: user.userId, status: "OPEN" } });
  if (!shift) return NextResponse.json({ error: "Open shift not found" }, { status: 404 });
  const rate = (await getRateSnapshot()).find((item) => item.code === parsed.data.currencyCode);
  if (!rate) return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
  const shiftReturn = await db.shiftReturn.create({ data: { shiftId: shift.id, originalInvoiceNumber: parsed.data.originalInvoiceNumber, returnNumber: `RET-${Date.now().toString().slice(-8)}`, returnedItems: parsed.data.returnedItems as object, amount: parsed.data.amount, currencyId: rate.currencyId, currencyCode: rate.code, exchangeRateToBase: rate.rateToBase, convertedAmountBase: parsed.data.amount * Number(rate.rateToBase), refundMethod: parsed.data.refundMethod, reason: parsed.data.reason, employeeId: user.userId } });
  await audit(user, "SHIFT_RETURN_PROCESSED", "ShiftReturn", shiftReturn.id, { shiftId: shift.id }, null, shiftReturn, request);
  return NextResponse.json(shiftReturn, { status: 201 });
}
