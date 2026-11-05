import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/auth/session
 *
 * Lightweight session check endpoint used by:
 * - sync-service.ts pingServer() to probe server reachability
 * - Any client that needs to verify the current session is still valid
 *
 * Returns 200 with basic session info if authenticated,
 * or 401 if no valid session exists.
 * Either way, a successful HTTP response proves the server is reachable.
 */
export async function GET() {
  const token = (await cookies()).get("erp_session")?.value;
  const session = await verifyToken(token);

  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 },
    );
  }

  return NextResponse.json({
    authenticated: true,
    userId: session.userId,
    name: session.name,
    role: session.role,
    branchId: session.branchId,
  });
}
