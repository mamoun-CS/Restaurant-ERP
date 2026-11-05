import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = await verifyToken(request.cookies.get("erp_session")?.value);
  if ((path.startsWith("/admin") || path.startsWith("/pos") || path.startsWith("/cash") || path.startsWith("/invoice") || path.startsWith("/orders")) && !session) return NextResponse.redirect(new URL("/login", request.url));
  if (path.startsWith("/admin") && session?.role !== "ADMIN") return NextResponse.redirect(new URL("/pos", request.url));
  if ((path.startsWith("/pos") || path.startsWith("/cash") || path.startsWith("/orders")) && session?.role !== "CASHIER") return NextResponse.redirect(new URL("/admin", request.url));
  if (path === "/login" && session) return NextResponse.redirect(new URL(session.role === "ADMIN" ? "/admin" : "/cash", request.url));
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*", "/pos/:path*", "/cash/:path*", "/invoice/:path*", "/orders", "/orders/:path*", "/login"] };
