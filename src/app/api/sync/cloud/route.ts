import { NextResponse } from "next/server";
import { runBidirectionalSync } from "@/lib/cloud-sync";

export async function POST() {
  const result = await runBidirectionalSync();
  return NextResponse.json(result);
}

export async function GET() {
  const result = await runBidirectionalSync();
  return NextResponse.json(result);
}
