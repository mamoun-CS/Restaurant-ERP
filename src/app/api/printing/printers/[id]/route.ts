import { NextResponse } from "next/server";
import { assertSameOrigin, requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";
import { printerSchema } from "@/lib/printing/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request); if (csrfError) return csrfError;
  const user = await requireAdmin(); if (user instanceof NextResponse) return user;
  const parsed = printerSchema.partial().safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ success: false, details: parsed.error.flatten() }, { status: 400 });
  const { id } = await params;
  return NextResponse.json(await db.printerConfiguration.update({ where: { id }, data: parsed.data }));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request); if (csrfError) return csrfError;
  const user = await requireAdmin(); if (user instanceof NextResponse) return user;
  const { id } = await params;
  await db.printerConfiguration.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
