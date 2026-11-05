import { SignJWT, jwtVerify } from "jose";

export type Session = { userId: string; name: string; email: string; role: "ADMIN" | "CASHIER"; branchId: string };
function getSecret() {
  const rawSecret = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && !rawSecret) throw new Error("AUTH_SECRET is required in production");
  const selectedSecret = rawSecret || "development-only-secret-change-in-production-32";
  if (selectedSecret.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters long");
  return new TextEncoder().encode(selectedSecret);
}

export async function createToken(session: Session) {
  return new SignJWT(session).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(getSecret());
}
export async function verifyToken(token?: string): Promise<Session | null> {
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, getSecret()); return payload as unknown as Session; } catch { return null; }
}
