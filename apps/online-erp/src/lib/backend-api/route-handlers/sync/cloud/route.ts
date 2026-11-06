import { NextResponse } from "next/server";
import { runBidirectionalSync } from "@/lib/cloud-sync";
import { requireAdmin } from "@/lib/api";

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  if (request.headers.get("origin") && new URL(request.headers.get("origin")!).origin !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const result = await runBidirectionalSync();
  return NextResponse.json(result);
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
}
