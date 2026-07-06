import { SignJWT, jwtVerify } from "jose";

export type Session = { userId: string; name: string; email: string; role: "ADMIN" | "CASHIER"; branchId: string };
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "development-only-secret-change-in-production-32");

export async function createToken(session: Session) {
  return new SignJWT(session).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret);
}
export async function verifyToken(token?: string): Promise<Session | null> {
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, secret); return payload as unknown as Session; } catch { return null; }
}

