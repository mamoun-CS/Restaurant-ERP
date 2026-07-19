import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken, type Session } from "@/lib/auth";
import { db } from "@/lib/db";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID_INPUT"
  | "RESOURCE_NOT_FOUND"
  | "DUPLICATE_INVOICE_REQUEST"
  | "CASH_SHIFT_ALREADY_OPEN"
  | "CASH_SHIFT_ALREADY_CLOSED"
  | "NO_OPEN_SHIFT"
  | "INVALID_PAYMENT_TOTAL"
  | "INVENTORY_UNAVAILABLE"
  | "PURCHASE_RETURN_QUANTITY_EXCEEDED"
  | "SUPPLIER_NOT_FOUND"
  | "EXPENSE_APPROVAL_REQUIRED"
  | "INVALID_CSRF_TOKEN"
  | "RATE_LIMIT_EXCEEDED"
  | "ACCOUNT_TEMPORARILY_LOCKED"
  | "INTERNAL_ERROR";

export function apiError(code: ApiErrorCode, message: string, status = 400, details: object = {}) {
  return NextResponse.json({ success: false, code, message, details }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export async function requireSession(): Promise<Session | NextResponse> {
  const session = await verifyToken((await cookies()).get("erp_session")?.value);
  if (!session) return apiError("UNAUTHORIZED", "Authentication is required.", 401);
  const user = await db.user.findUnique({ where: { id: session.userId }, select: { active: true, lockedUntil: true, sessionVersion: true } }).catch(() => null);
  if (user && (!user.active || (user.lockedUntil && user.lockedUntil > new Date()))) {
    return apiError("ACCOUNT_TEMPORARILY_LOCKED", "This account cannot be used right now.", 403);
  }
  return session;
}

export async function requireAdmin(): Promise<Session | NextResponse> {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  if (session.role !== "ADMIN") return apiError("FORBIDDEN", "Admin access is required.", 403);
  return session;
}

export async function requireCashier(): Promise<Session | NextResponse> {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  if (session.role !== "CASHIER") return apiError("FORBIDDEN", "Cashier access is required.", 403);
  return session;
}

export function assertSameOrigin(request: Request) {
  if (process.env.NODE_ENV === "test") return null;
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowedOrigins = getAllowedOrigins(url.origin);
  if (origin && !allowedOrigins.has(origin)) return apiError("INVALID_CSRF_TOKEN", "Invalid request origin.", 403);
  if (!origin && referer && !allowedOrigins.has(new URL(referer).origin)) return apiError("INVALID_CSRF_TOKEN", "Invalid request origin.", 403);
  return null;
}

function getAllowedOrigins(requestOrigin: string) {
  const origins = new Set([requestOrigin]);
  for (const value of [process.env.APP_URL, process.env.NEXT_PUBLIC_APP_URL, process.env.ALLOWED_ORIGINS]) {
    for (const origin of parseOrigins(value)) origins.add(origin);
  }
  return origins;
}

function parseOrigins(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      try {
        return new URL(origin).origin;
      } catch {
        return "";
      }
    })
    .filter(Boolean);
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return apiError("RATE_LIMIT_EXCEEDED", "Too many requests. Please try again later.", 429, { retryAfterMs: bucket.resetAt - now });
  }
  return null;
}

export function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
