import type { PrintInvoice } from "./types";

export function renderCustomerReceipt(invoice: PrintInvoice, locale: "en" | "ar" = "ar") {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const total = Number(invoice.grandTotal || invoice.totalAmount || 0).toFixed(2);
  const rows = invoice.items.map((item) => `
    <tr>
      <td class="qty">${item.quantity}x</td>
      <td>
        <strong>${escapeHtml(item.productNameSnapshot)}</strong>
        ${item.selectedSizeSnapshot ? `<small>${escapeHtml(item.selectedSizeSnapshot)}</small>` : ""}
        ${item.addons.length ? `<small>${item.addons.map((a) => escapeHtml(a.nameSnapshot)).join(", ")}</small>` : ""}
      </td>
      <td class="money">₪ ${(Number(item.unitPrice) * item.quantity).toFixed(2)}</td>
    </tr>`).join("");
  const payments = invoice.payments.map((payment) => `${paymentLabel(payment.method, locale)} ${payment.currencyCode} ${Number(payment.amount).toFixed(2)}`).join("<br>");
  return baseHtml("receipt", dir, `
    <header>
      <h1>${locale === "ar" ? "شيخ الكار" : "Sheikh Al Kar"}</h1>
      <p>${escapeHtml(locale === "ar" ? invoice.branch.nameAr : invoice.branch.name)}${invoice.branch.address ? ` - ${escapeHtml(invoice.branch.address)}` : ""}</p>
    </header>
    <section class="meta">
      ${line(locale === "ar" ? "الفاتورة" : "Invoice", `#${invoice.number}`)}
      ${line(locale === "ar" ? "الطلب" : "Order", invoice.kitchenOrder?.orderNumber || "-")}
      ${line(locale === "ar" ? "الكاشير" : "Cashier", invoice.cashier.name)}
      ${line(locale === "ar" ? "الوقت" : "Time", new Date(invoice.createdAt).toLocaleString(locale === "ar" ? "ar" : "en"))}
    </section>
    <table>${rows}</table>
    <section class="totals">
      ${line(locale === "ar" ? "المجموع" : "Subtotal", `₪ ${Number(invoice.subtotal).toFixed(2)}`)}
      ${Number(invoice.discountAmount) ? line(locale === "ar" ? "الخصم" : "Discount", `₪ ${Number(invoice.discountAmount).toFixed(2)}`) : ""}
      ${Number(invoice.taxAmount) ? line(locale === "ar" ? "الضريبة" : "Tax", `₪ ${Number(invoice.taxAmount).toFixed(2)}`) : ""}
      ${line(locale === "ar" ? "الإجمالي" : "Total", `₪ ${total}`, "strong")}
      ${line(locale === "ar" ? "الدفع" : "Payment", payments)}
    </section>
    <footer>${locale === "ar" ? "شكراً لزيارتكم" : "Thank you"}</footer>`);
}

export function baseHtml(kind: string, dir: string, body: string) {
  return `<!doctype html><html lang="${dir === "rtl" ? "ar" : "en"}" dir="${dir}"><head><meta charset="utf-8"><style>
    @page{margin:0;size:80mm auto}*{box-sizing:border-box}html,body{width:80mm;margin:0;padding:0;background:#fff;color:#000;font-family:Arial,Tahoma,sans-serif}
    body{padding:4mm;font-size:11px;line-height:1.35}.ticket body{font-size:13px}h1{font-size:17px;margin:0 0 2mm;text-align:center}p{margin:0}header{text-align:center}
    .meta,.totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}.line{display:flex;justify-content:space-between;gap:3mm}.line strong{font-size:14px}
    table{width:100%;border-collapse:collapse}td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.qty{width:9mm;font-weight:bold}.money{text-align:end;white-space:nowrap}small{display:block;color:#333;margin-top:1mm}footer{text-align:center;margin-top:4mm;font-weight:bold}
  </style></head><body class="${kind}">${body}</body></html>`;
}

function line(label: string, value: string, className = "") {
  return `<div class="line ${className}"><span>${label}</span><strong>${value}</strong></div>`;
}

function paymentLabel(value: string, locale: "en" | "ar") {
  if (value === "CREDIT_CARD") return locale === "ar" ? "بطاقة" : "Card";
  if (value === "BANK") return locale === "ar" ? "بنك" : "Bank";
  return locale === "ar" ? "نقداً" : "Cash";
}

export function escapeHtml(value: string) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
