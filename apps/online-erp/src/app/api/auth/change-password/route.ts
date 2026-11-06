import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, assertSameOrigin, apiError } from "@/lib/api";
import { db } from "@/lib/db";

const schema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).max(128) });

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_INPUT", "New password must be at least 8 characters.", 400);
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) return apiError("UNAUTHORIZED", "Current password is incorrect.", 401);
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.user.update({ where: { id: user.id }, data: { passwordHash, forcePasswordChange: false, sessionVersion: { increment: 1 } } });
  const response = NextResponse.json({ success: true });
  response.cookies.delete("erp_session");
  return response;
}
