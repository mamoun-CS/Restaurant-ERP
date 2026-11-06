import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";

function getJwtSecret() {
  const secretValue = process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? "" : "development-only-secret-change-in-production-32");
  if (secretValue.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters long");
  return new TextEncoder().encode(secretValue);
}

export function hashPosSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function issueDeviceRefreshSecret() {
  return randomBytes(32).toString("base64url");
}

export async function issueDeviceAccessToken(device: { id: string; branchId: string }) {
  return new SignJWT({ type: "pos_device", branchId: device.branchId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(device.id)
    .setIssuer("restaurant-erp")
    .setAudience("restaurant-pos")
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getJwtSecret());
}

export type OfflinePolicy = {
  deviceId: string; userId: string; branchId: string; policyVersion: number;
  canDiscount: boolean; maxDiscountPercent: number; maxDiscountMinor: number; supervisor: boolean;
};

export async function issueOfflinePolicyToken(policy: OfflinePolicy, expiresAt: Date | null) {
  const token = new SignJWT({ type: "offline_pos_policy", ...policy })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(policy.userId)
    .setIssuer("restaurant-erp")
    .setAudience("restaurant-pos-policy")
    .setIssuedAt();
  if (expiresAt) token.setExpirationTime(Math.floor(expiresAt.getTime() / 1000));
  return token.sign(getJwtSecret());
}

export async function verifyOfflinePolicyToken(token: string, at: Date): Promise<OfflinePolicy | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { issuer: "restaurant-erp", audience: "restaurant-pos-policy", currentDate: at });
    if (payload.type !== "offline_pos_policy" || typeof payload.deviceId !== "string" || typeof payload.userId !== "string" ||
      typeof payload.branchId !== "string" || typeof payload.policyVersion !== "number" || typeof payload.canDiscount !== "boolean" ||
      typeof payload.supervisor !== "boolean" || typeof payload.maxDiscountPercent !== "number" || typeof payload.maxDiscountMinor !== "number") return null;
    return { deviceId: payload.deviceId, userId: payload.userId, branchId: payload.branchId, policyVersion: payload.policyVersion,
      canDiscount: payload.canDiscount, supervisor: payload.supervisor, maxDiscountPercent: payload.maxDiscountPercent, maxDiscountMinor: payload.maxDiscountMinor };
  } catch {
    return null;
  }
}

export async function authenticatePosDevice(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { issuer: "restaurant-erp", audience: "restaurant-pos" });
    if (payload.type !== "pos_device" || typeof payload.sub !== "string" || typeof payload.branchId !== "string") return null;
    const device = await db.posDevice.findUnique({ where: { id: payload.sub }, select: { id: true, branchId: true, registerId: true, active: true, revokedAt: true } });
    if (!device || !device.active || device.revokedAt || device.branchId !== payload.branchId) return null;
    void db.posDevice.update({ where: { id: device.id }, data: { lastHeartbeatAt: new Date() } }).catch(() => {});
    return device;
  } catch {
    return null;
  }
}

export function secureHashMatches(candidate: string, storedHex: string) {
  const expected = Buffer.from(storedHex, "hex");
  const actual = Buffer.from(hashPosSecret(candidate), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
