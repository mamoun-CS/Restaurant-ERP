import { NextRequest, NextResponse } from "next/server";
import { getFinancialSummary, isResponse, requireAdmin } from "@/lib/finance";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
}

function simplePdf(text: string) {
  const safe = text.replace(/[()\\]/g, "\\$&").slice(0, 1800);
  const stream = `BT /F1 12 Tf 50 760 Td (${safe}) Tj ET`;
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];
  const body = objects.join("\n");
  return Buffer.from(`%PDF-1.4\n${body}\ntrailer << /Root 1 0 R >>\n%%EOF`);
}

export async function GET(request: NextRequest) {
  const user = await requireAdmin();
  if (isResponse(user)) return user;
  const summary = await getFinancialSummary(request.nextUrl.searchParams);
  const type = request.nextUrl.searchParams.get("type") || "profit";
  const format = request.nextUrl.searchParams.get("format") || "json";
  const rows =
    type === "expenses" ? summary.expenses :
    type === "product-costs" ? summary.products :
    type === "profit-by-category" ? summary.byCategory :
    type === "profit-by-employee" ? summary.byEmployee :
    type === "profit-by-period" ? summary.byDay :
    summary.byProduct;

  if (format === "csv" || format === "xlsx") {
    return new NextResponse(toCsv(rows as Record<string, unknown>[]), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="finance-${type}.csv"`,
      },
    });
  }

  if (format === "pdf") {
    const pdf = simplePdf(`Sheikh Al Kar Financial Report ${type} Revenue ${summary.totals.revenue} Gross Profit ${summary.totals.grossProfit} Expenses ${summary.totals.operatingExpenses} Net Profit ${summary.totals.netProfit}`);
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="finance-${type}.pdf"`,
      },
    });
  }

  return NextResponse.json({ type, totals: summary.totals, rows });
}
