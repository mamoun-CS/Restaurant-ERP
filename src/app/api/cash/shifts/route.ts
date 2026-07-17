import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = await verifyToken((await cookies()).get("erp_session")?.value);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const query = request.nextUrl.searchParams;
  const shifts = await db.cashShift.findMany({
    where: {
      employeeId: user.role === "CASHIER" ? user.userId : query.get("employeeId") || undefined,
      branchId: query.get("branchId") || undefined,
      registerId: query.get("registerId") || undefined,
      status: query.get("status") as never || undefined,
      openedAt: query.get("from") ? { gte: new Date(query.get("from")!) } : undefined,
    },
    include: {
      branch: true,
      register: true,
      employee: { select: { id: true, name: true, email: true } },
      reports: { orderBy: { generatedAt: "desc" }, take: 1 },
      discrepancies: true,
    },
    orderBy: { openedAt: "desc" },
    take: 100,
  });
  return NextResponse.json(shifts);
}
