import { NextRequest, NextResponse } from "next/server";
import { getFinancialSummary, isResponse, requireAdmin } from "@/lib/finance";

export async function GET(request: NextRequest) {
  const user = await requireAdmin();
  if (isResponse(user)) return user;
  return NextResponse.json(await getFinancialSummary(request.nextUrl.searchParams));
}
