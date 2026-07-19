import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

const TOKEN_PREFIX = "npa_";

export function hashPrintSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export function createPairingCode() {
  return randomBytes(5).toString("base64url").toUpperCase();
}

export function createDeviceToken() {
  return `${TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;
}

export function safeCompareHash(input: string, expectedHash: string) {
  const actual = Buffer.from(hashPrintSecret(input), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function authenticatePrintDevice(request: Request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const deviceId = request.headers.get("x-print-device-id") || "";
  if (!token || !deviceId) return null;
  const device = await db.printDevice.findUnique({ where: { id: deviceId }, include: { branch: true } });
  if (!device || device.status === "DISABLED" || device.disabledAt) return null;
  if (!safeCompareHash(token, device.tokenHash)) return null;
  return device;
}
