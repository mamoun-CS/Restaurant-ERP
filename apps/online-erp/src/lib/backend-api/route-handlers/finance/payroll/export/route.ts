import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { isResponse, requireAdmin, toNumber } from "@/lib/finance";

export async function GET(request: NextRequest) {
  const user = await requireAdmin();
  if (isResponse(user)) return user;
  const month = request.nextUrl.searchParams.get("month") || new Date().toISOString().slice(0, 7);
  const format = request.nextUrl.searchParams.get("format") === "pdf" ? "pdf" : "xlsx";
  const locale = request.nextUrl.searchParams.get("locale") === "ar" ? "ar" : "en";
  const rows = await db.payrollRecord.findMany({ where: { payrollMonth: new Date(`${month}-01T00:00:00Z`) }, include: { employee: true }, orderBy: { employee: { name: "asc" } } });
  const headings = locale === "ar" ? ["الموظف", "الراتب الأساسي", "الإضافي", "المكافآت", "الخصومات", "السلف", "صافي الراتب", "الحالة", "تاريخ الدفع"] : ["Employee", "Base salary", "Overtime", "Bonuses", "Deductions", "Advances", "Net salary", "Status", "Payment date"];
  const values = rows.map(row => [row.employee.name, toNumber(row.baseSalary), toNumber(row.overtime), toNumber(row.bonuses), toNumber(row.deductions), toNumber(row.advances), toNumber(row.netSalary), row.status, row.paymentDate?.toISOString().slice(0, 10) || ""]);
  if (format === "xlsx") {
    const sheet = XLSX.utils.aoa_to_sheet([headings, ...values]);
    sheet["!cols"] = headings.map((_, i) => ({ wch: i === 0 ? 24 : 16 }));
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, locale === "ar" ? "الرواتب" : "Payroll");
    const output = XLSX.write(book, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(output, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="payroll-${month}.xlsx"` } });
  }
  const pdf = await PDFDocument.create(); const page = pdf.addPage([842, 595]); const font = await pdf.embedFont(StandardFonts.Helvetica); const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  page.drawText(locale === "ar" ? `Payroll ${month}` : `Monthly Payroll — ${month}`, { x: 36, y: 555, size: 18, font: bold, color: rgb(.08,.24,.21) });
  const printableHeadings = locale === "ar" ? ["Employee", "Base", "Overtime", "Bonuses", "Deductions", "Advances", "Net", "Status", "Date"] : headings;
  printableHeadings.forEach((h, i) => page.drawText(h, { x: 36 + i * 84, y: 520, size: 8, font: bold }));
  values.slice(0, 24).forEach((row, ri) => row.forEach((value, i) => page.drawText(String(value).slice(0, 15), { x: 36 + i * 84, y: 500 - ri * 19, size: 8, font })));
  const output = await pdf.save();
  return new NextResponse(Buffer.from(output), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="payroll-${month}.pdf"` } });
}
