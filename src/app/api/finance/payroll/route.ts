import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isResponse, requireAdmin, toNumber, money } from "@/lib/finance";
import { z } from "zod";
const update = z.object({
  id: z.string(),
  baseSalary: z.number().nonnegative(),
  overtime: z.number().nonnegative(),
  bonuses: z.number().nonnegative(),
  deductions: z.number().nonnegative(),
  advances: z.number().nonnegative(),
  status: z.enum(["UNPAID", "PARTIALLY_PAID", "PAID"]),
  amountPaid: z.number().nonnegative().optional(),
  paymentDate: z.string().date().nullable().optional(),
});
const create = z.object({
  employeeId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  baseSalary: z.number().nonnegative(),
  overtime: z.number().nonnegative(),
  bonuses: z.number().nonnegative(),
  deductions: z.number().nonnegative(),
  advances: z.number().nonnegative(),
});
function range(month: string) {
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1),
  );
  return { gte: start, lt: end };
}
export async function GET(r: NextRequest) {
  const u = await requireAdmin();
  if (isResponse(u)) return u;
  const month =
    r.nextUrl.searchParams.get("month") || new Date().toISOString().slice(0, 7);
  const rows = await db.payrollRecord.findMany({
    where: { payrollMonth: range(month) },
    include: { employee: { select: { id: true, name: true, email: true } } },
    orderBy: { employee: { name: "asc" } },
  });
  return NextResponse.json(rows);
}
export async function POST(r: NextRequest) {
  const u = await requireAdmin();
  if (isResponse(u)) return u;
  const p = create.safeParse(await r.json());
  if (!p.success)
    return NextResponse.json({ error: "Invalid payroll" }, { status: 400 });
  const d = p.data;
  const payrollMonth = new Date(`${d.month}-01T00:00:00Z`);
  const netSalary = money(
    d.baseSalary + d.overtime + d.bonuses - d.deductions - d.advances,
  );
  const row = await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: d.employeeId },
      data: { baseSalary: d.baseSalary },
    });
    return tx.payrollRecord.upsert({
      where: {
        employeeId_payrollMonth: { employeeId: d.employeeId, payrollMonth },
      },
      create: {
        employeeId: d.employeeId,
        payrollMonth,
        baseSalary: d.baseSalary,
        overtime: d.overtime,
        bonuses: d.bonuses,
        deductions: d.deductions,
        advances: d.advances,
        netSalary,
      },
      update: {
        baseSalary: d.baseSalary,
        overtime: d.overtime,
        bonuses: d.bonuses,
        deductions: d.deductions,
        advances: d.advances,
        netSalary,
      },
    });
  });
  return NextResponse.json(row);
}
export async function PATCH(r: NextRequest) {
  const u = await requireAdmin();
  if (isResponse(u)) return u;
  const p = update.safeParse(await r.json());
  if (!p.success)
    return NextResponse.json({ error: "Invalid payroll" }, { status: 400 });
  const d = p.data;
  const net = money(
    d.baseSalary + d.overtime + d.bonuses - d.deductions - d.advances,
  );
  const row = await db.$transaction(async (tx) => {
    const saved = await tx.payrollRecord.update({
      where: { id: d.id },
      data: {
        ...d,
        netSalary: net,
        paymentDate: d.paymentDate ? new Date(d.paymentDate) : null,
      },
    });
    if (d.status === "PAID")
      await tx.operatingExpense.upsert({
        where: { payrollRecordId: saved.id },
        create: {
          title: `Salary — ${saved.payrollMonth.toISOString().slice(0, 7)}`,
          category: "SALARIES",
          frequency: "MONTHLY",
          amount: saved.netSalary,
          expenseDate: saved.paymentDate || new Date(),
          createdById: u.userId,
          branchId: u.branchId,
          payrollRecordId: saved.id,
        },
        update: {
          amount: saved.netSalary,
          expenseDate: saved.paymentDate || new Date(),
        },
      });
    return saved;
  });
  return NextResponse.json(row);
}
