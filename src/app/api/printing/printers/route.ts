import { NextResponse } from "next/server";
import { assertSameOrigin, requireAdmin } from "@/lib/api";
import { db } from "@/lib/db";
import { printerSchema } from "@/lib/printing/validation";

export async function GET() {
  const user = await requireAdmin(); if (user instanceof NextResponse) return user;
  return NextResponse.json(await db.printerConfiguration.findMany({ include: { branch: true, printDevice: { select: { id: true, name: true, localPrinters: true } } }, orderBy: { createdAt: "desc" } }));
}

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request); if (csrfError) return csrfError;
  const user = await requireAdmin(); if (user instanceof NextResponse) return user;
  const parsed = printerSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ success: false, details: parsed.error.flatten() }, { status: 400 });
  return NextResponse.json(await db.printerConfiguration.create({ data: parsed.data }), { status: 201 });
}
