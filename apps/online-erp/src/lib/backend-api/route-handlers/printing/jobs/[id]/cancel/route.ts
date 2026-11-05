import { NextResponse } from "next/server";
import { assertSameOrigin, requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request); if (csrfError) return csrfError;
  const user = await requireAdmin(); if (user instanceof NextResponse) return user;
  const { id } = await params;
  return NextResponse.json(await db.printJob.update({ where: { id }, data: { status: "CANCELLED", cancelledAt: new Date() } }));
}
