import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isResponse, requireAdmin, toNumber } from "@/lib/finance";
const schema = z.object({
  action: z.enum(["generate", "approve", "pay"]),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});
function start(m: string) {
  return new Date(`${m}-01T00:00:00.000Z`);
}
export async function POST(r: NextRequest) {
  const u = await requireAdmin();
  if (isResponse(u)) return u;
  const p = schema.safeParse(await r.json());
  if (!p.success)
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const month = start(p.data.month);
  if (p.data.action === "generate") {
    const staff = await db.user.findMany({
      where: { role: "CASHIER", active: true },
    });
    await db.$transaction(
      staff.map((e) =>
        db.payrollRecord.upsert({
          where: {
            employeeId_payrollMonth: { employeeId: e.id, payrollMonth: month },
          },
          create: {
            employeeId: e.id,
            payrollMonth: month,
            baseSalary: e.baseSalary,
            netSalary: e.baseSalary,
          },
          update: {},
        }),
      ),
    );
    return NextResponse.json({ count: staff.length });
  }
  if (p.data.action === "approve") {
    const result = await db.payrollRecord.updateMany({
      where: { payrollMonth: month },
      data: { approved: true },
    });
    return NextResponse.json(result);
  }
  const rows = await db.payrollRecord.findMany({
    where: { payrollMonth: month },
    include: { employee: true },
  });
  await db.$transaction(async (tx) => {
    for (const row of rows) {
      await tx.payrollRecord.update({
        where: { id: row.id },
        data: {
          status: "PAID",
          amountPaid: row.netSalary,
          paymentDate: new Date(),
          approved: true,
        },
      });
      await tx.operatingExpense.upsert({
        where: { payrollRecordId: row.id },
        create: {
          title: `Employee salary — ${row.employee.name}`,
          category: "SALARIES",
          frequency: "MONTHLY",
          amount: row.netSalary,
          expenseDate: new Date(),
          createdById: u.userId,
          branchId: u.branchId,
          payrollRecordId: row.id,
        },
        update: { amount: row.netSalary },
      });
    }
  });
  return NextResponse.json({ count: rows.length });
}
