import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin, requireAdmin } from "@/lib/api";
import { audit } from "@/lib/cash";
import { db } from "@/lib/db";

const schema = z.object({ name: z.string().min(2).optional(), disabled: z.boolean().optional() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request); if (csrfError) return csrfError;
  const user = await requireAdmin(); if (user instanceof NextResponse) return user;
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ success: false }, { status: 400 });
  const { id } = await params;
  const device = await db.printDevice.update({ where: { id }, data: { name: parsed.data.name, status: parsed.data.disabled === true ? "DISABLED" : parsed.data.disabled === false ? "OFFLINE" : undefined, disabledAt: parsed.data.disabled === true ? new Date() : parsed.data.disabled === false ? null : undefined } });
  await audit(user, "PRINT_DEVICE_UPDATED", "PrintDevice", id, parsed.data, null, null, request);
  const { tokenHash: _tokenHash, ...safe } = device;
  return NextResponse.json(safe);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = assertSameOrigin(request); if (csrfError) return csrfError;
  const user = await requireAdmin(); if (user instanceof NextResponse) return user;
  const { id } = await params;
  await db.printDevice.delete({ where: { id } });
  await audit(user, "PRINT_DEVICE_DELETED", "PrintDevice", id, {}, null, null, request);
  return NextResponse.json({ success: true });
}
