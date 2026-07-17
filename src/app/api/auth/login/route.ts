import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, assertSameOrigin, rateLimit, requestIp } from "@/lib/api";
import { audit } from "@/lib/cash";

const schema = z.object({ email: z.email(), password: z.string().min(6) });

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;
  const ip = requestIp(request);
  const limited = rateLimit(`login:${ip}`, 10, 60_000);
  if (limited) return limited;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError("INVALID_INPUT", "Invalid credentials", 400);
  const email = parsed.data.email.toLowerCase();
  const databaseUser = await db.user.findUnique({ where:{email} }).catch(()=>null);
  const user = databaseUser;
  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    return apiError("ACCOUNT_TEMPORARILY_LOCKED", "Invalid email or password", 401);
  }
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    if (databaseUser) {
      const failedLoginCount = databaseUser.failedLoginCount + 1;
      await db.user.update({
        where: { id: databaseUser.id },
        data: {
          failedLoginCount,
          lockedUntil: failedLoginCount >= 5 ? new Date(Date.now() + 15 * 60_000) : null,
        },
      });
      await audit(null, "LOGIN_FAILED", "User", databaseUser.id, { email, ip }, null, null, request);
    }
    return apiError("UNAUTHORIZED", "Invalid email or password", 401);
  }
  if ("active" in user && !user.active) return apiError("FORBIDDEN", "Account is inactive", 403);
  const session = { userId:user.id, name:user.name, email:user.email, role:user.role, branchId:user.branchId ?? "" };
  await db.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() } });
  const token = await createToken(session);
  const response = NextResponse.json({ role: user.role, redirectTo: user.role === "ADMIN" ? "/admin" : "/cash" });
  response.cookies.set("erp_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 8, path: "/" });
  return response;
}
