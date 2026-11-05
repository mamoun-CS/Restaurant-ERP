import { NextResponse } from "next/server";
import { assertSameOrigin, requireSession } from "@/lib/api";
import { db } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request); if (csrfError) return csrfError;
  const user = await requireSession(); if (user instanceof NextResponse) return user;
  const { id } = await params;
  const job = await db.printJob.findUnique({ where: { id }, include: { invoice: true } });
  if (!job || (user.role === "CASHIER" && job.invoice?.cashierId !== user.userId)) return NextResponse.json({ success: false, code: "RESOURCE_NOT_FOUND" }, { status: 404 });
  return NextResponse.json(await db.printJob.update({ where: { id }, data: { status: "PENDING", errorCode: null, errorMessage: null, failedAt: null, cancelledAt: null } }));
}
