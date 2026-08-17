import type { PrintInvoice } from "./types";

type ReceiptOptions = {
  locale?: "en" | "ar";
  reprint?: boolean;
};

const TAX_NUMBER = "310048229";
const RESTAURANT_NAME_AR = "شيخ الكار";
const RESTAURANT_NAME_EN = "Sheikh Al Kar";
const LOGO_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(`<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="54" y="46" width="404" height="420" rx="86" fill="#F86800"/><path d="M135 128h242c22 0 40 18 40 40v128c0 31-25 56-56 56h-4c-27 0-49-22-49-49v-87H204v87c0 27-22 49-49 49h-4c-31 0-56-25-56-56V168c0-22 18-40 40-40Z" fill="#FFFFFF"/><path d="M209 174h118l-21 86c-5 21 2 43 18 58l13 12H210c28-30 41-65 39-105l-40-51Z" fill="#F86800"/><path d="M203 168h138l-12 46H216l-13-46Z" fill="#FF8A1F"/><path d="M222 223h52c3 25 0 53-9 83" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round"/><path d="M294 224c6 33 6 67 0 101M320 224c5 34 5 68 0 101M345 224c4 32 4 65 0 98" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/><path d="M209 357c-8 24-20 43-39 57h153c-15-13-24-31-26-57H209Z" fill="#FFFFFF"/></svg>`, "utf8").toString("base64")}`;

export function renderCustomerReceipt(invoice: PrintInvoice, locale: "en" | "ar" = "ar") {
  return buildInvoiceReceiptHtml(invoice, { locale });
}

export function buildInvoiceReceiptHtml(invoice: PrintInvoice, options: ReceiptOptions = {}) {
  const vm = buildInvoiceReceiptViewModel(invoice, options);
  if (!vm.items.length) throw new Error("PRINT_JOB_EMPTY_INVOICE_ITEMS");
  const dir = vm.locale === "ar" ? "rtl" : "ltr";

  const itemRows = vm.items.map((item) => `
    <tr>
      <td class="qty">${escapeHtml(String(item.quantity))}x</td>
      <td class="item-name">
        <strong>${escapeHtml(item.nameAr)}</strong>
        ${item.nameEn ? `<small class="en">${escapeHtml(item.nameEn)}</small>` : ""}
        ${item.size ? `<small>${escapeHtml(item.size)}</small>` : ""}
        ${item.addons.length ? `<small>${escapeHtml(item.addons.join(", "))}</small>` : ""}
        ${item.notes ? `<small>${escapeHtml(item.notes)}</small>` : ""}
        <small>${escapeHtml(vm.locale === "ar" ? "سعر الوحدة" : "Unit price")}: ${escapeHtml(item.unitPrice)}</small>
      </td>
      <td class="money">${escapeHtml(item.lineTotal)}</td>
    </tr>
  `).join("");

  return baseHtml("receipt", dir, `
    <main class="receipt">
      <header>
        <img class="logo" src="${LOGO_DATA_URL}" alt="Sheikh Al Kar logo">
        <h1>${escapeHtml(vm.restaurantNameAr)}</h1>
        ${vm.restaurantNameEn ? `<p class="en center">${escapeHtml(vm.restaurantNameEn)}</p>` : ""}
        ${vm.branchName ? `<p>${escapeHtml(vm.branchName)}</p>` : ""}
        ${vm.address ? `<p>${escapeHtml(vm.address)}</p>` : ""}
        ${vm.phone ? `<p dir="ltr">${escapeHtml(vm.phone)}</p>` : ""}
        ${vm.taxNumber ? `<p>${vm.locale === "ar" ? "الرقم الضريبي" : "Tax no."}: <span dir="ltr">${escapeHtml(vm.taxNumber)}</span></p>` : ""}
        ${vm.reprint ? `<p><strong>REPRINT / إعادة طباعة</strong></p>` : ""}
      </header>
      <section class="meta">
        ${line(vm.locale === "ar" ? "الفاتورة" : "Invoice", `#${vm.officialNumber}`, "invoice-number")}
        ${line(vm.locale === "ar" ? "التاريخ" : "Date", vm.date)}
        ${line(vm.locale === "ar" ? "الوقت" : "Time", vm.time)}
        ${line(vm.locale === "ar" ? "الموظف" : "Cashier", vm.employeeName)}
        ${vm.customerName ? line(vm.locale === "ar" ? "الزبون" : "Customer", vm.customerName) : ""}
        ${vm.customerPhone ? line(vm.locale === "ar" ? "هاتف الزبون" : "Customer phone", vm.customerPhone) : ""}
        ${line(vm.locale === "ar" ? "طريقة الدفع" : "Payment method", vm.paymentMethod)}
        ${line(vm.locale === "ar" ? "العملة" : "Currency", vm.currency)}
        ${line(vm.locale === "ar" ? "المدفوع" : "Paid", vm.paidAmount)}
        ${line(vm.locale === "ar" ? "طريقة التسليم" : "Delivery method", vm.deliveryMethod)}
        ${line(vm.locale === "ar" ? "نوع الطلب" : "Order type", vm.orderType)}
        ${vm.orderNotes ? line(vm.locale === "ar" ? "ملاحظات" : "Notes", vm.orderNotes) : ""}
      </section>
      <table><tbody>${itemRows}</tbody></table>
      <section class="totals">
        ${moneyLine(vm.locale === "ar" ? "المجموع" : "Subtotal", vm.subtotal)}
        ${moneyLine(vm.locale === "ar" ? "الخصم" : "Discount", vm.discount, true)}
        ${moneyLine(vm.locale === "ar" ? "التوصيل" : "Delivery charge", vm.deliveryCharge)}
        ${moneyLine(vm.locale === "ar" ? "الخدمة" : "Service charge", vm.serviceCharge)}
        ${moneyLine(vm.locale === "ar" ? "الضريبة" : "Tax", vm.tax)}
        ${moneyLine(vm.locale === "ar" ? "الإجمالي" : "Grand total", vm.grandTotal, false, "strong")}
        ${moneyLine(vm.locale === "ar" ? "المدفوع" : "Paid", vm.paidTotal)}
        ${moneyLine(vm.locale === "ar" ? "المتبقي" : "Remaining", vm.remaining)}
      </section>
      <footer>
        <strong>${vm.locale === "ar" ? "شكراً لزيارتكم" : "Thank you"}</strong>
        <p>${vm.locale === "ar" ? "الأسعار تشمل الضريبة" : "Tax included"}</p>
        ${vm.taxNumber ? `<p>${vm.locale === "ar" ? "الرقم الضريبي" : "Tax no."}: <span dir="ltr">${escapeHtml(vm.taxNumber)}</span></p>` : ""}
        ${vm.invoiceReference ? `<p class="invoice-number">${escapeHtml(vm.invoiceReference)}</p>` : ""}
      </footer>
    </main>`);
}

export function buildInvoiceReceiptViewModel(invoice: PrintInvoice, options: ReceiptOptions = {}) {
  const locale = options.locale || "ar";
  const createdAt = new Date(invoice.createdAt);
  const payments = invoice.payments || [];
  const paid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0) - Number(payment.changeAmount || 0), 0);
  const grandTotal = Number(invoice.grandTotal || invoice.totalAmount || 0);
  const currency = payments[0]?.currencyCode || "ILS";
  const kitchenItems = Array.isArray(invoice.kitchenOrder?.items) ? invoice.kitchenOrder.items as { notes?: string; productName?: string }[] : [];

  return {
    locale,
    reprint: Boolean(options.reprint),
    restaurantNameAr: RESTAURANT_NAME_AR,
    restaurantNameEn: RESTAURANT_NAME_EN,
    branchName: locale === "ar" ? invoice.branch?.nameAr || invoice.branch?.name : invoice.branch?.name || invoice.branch?.nameAr,
    address: invoice.branch?.address || "",
    phone: (invoice.branch as unknown as { phone?: string | null })?.phone || "",
    taxNumber: TAX_NUMBER,
    officialNumber: invoice.officialNumber || invoice.number,
    invoiceReference: invoice.id,
    date: isNaN(createdAt.getTime()) ? "" : createdAt.toLocaleDateString(locale === "ar" ? "ar" : "en"),
    time: isNaN(createdAt.getTime()) ? "" : createdAt.toLocaleTimeString(locale === "ar" ? "ar" : "en", { hour: "2-digit", minute: "2-digit" }),
    employeeName: invoice.cashier?.name || "-",
    customerName: invoice.customerName || "",
    customerPhone: invoice.customerPhone || "",
    paymentMethod: paymentLabel(invoice.paymentMethod, locale),
    currency,
    paidAmount: formatMoney(paid || grandTotal, currency),
    paidTotal: money(paid || grandTotal, currency),
    deliveryMethod: deliveryLabel(invoice.orderType, locale),
    orderType: deliveryLabel(invoice.orderType, locale),
    orderNotes: invoice.customerNotes || "",
    subtotal: money(Number(invoice.subtotal), currency),
    discount: money(Number(invoice.discountAmount), currency),
    deliveryCharge: money(Number((invoice as unknown as { deliveryFee?: number }).deliveryFee || 0), currency),
    serviceCharge: money(Number((invoice as unknown as { serviceCharge?: number }).serviceCharge || 0), currency),
    tax: money(Number(invoice.taxAmount), currency),
    grandTotal: money(grandTotal, currency),
    remaining: money(Math.max(0, grandTotal - paid), currency),
    items: invoice.items.map((item, index) => {
      const product = item.product as unknown as { translations?: { locale: string; name: string }[] } | null;
      const arName = product?.translations?.find((translation) => translation.locale === "ar")?.name || item.productNameSnapshot;
      const enName = product?.translations?.find((translation) => translation.locale === "en")?.name;
      const note = kitchenItems[index]?.notes || "";
      return {
        quantity: item.quantity,
        nameAr: arName,
        nameEn: enName && enName !== arName ? enName : "",
        size: item.selectedSizeSnapshot || "",
        addons: (item.addons || []).map((addon) => `${addon.nameSnapshot}${Number(addon.priceSnapshot) ? ` (${formatMoney(Number(addon.priceSnapshot), currency)})` : ""}`),
        notes: note,
        unitPrice: formatMoney(Number(item.unitPrice), currency),
        lineTotal: formatMoney(Number(item.totalPrice || Number(item.unitPrice) * item.quantity), currency),
      };
    }),
  };
}

export function baseHtml(kind: string, dir: string, body: string) {
  return `<!doctype html><html lang="${dir === "rtl" ? "ar" : "en"}" dir="${dir}"><head><meta charset="utf-8"><style>
    :root{--receipt-width:60mm}@page{size:60mm auto;margin:0}*{box-sizing:border-box}
    body.receipt-document{width:var(--receipt-width);margin:0;padding:0;background:#fff;color:#000;overflow:visible;font-family:Arial,Tahoma,"Segoe UI",sans-serif}
    .receipt{width:var(--receipt-width);min-width:var(--receipt-width);max-width:var(--receipt-width);padding:4mm;box-sizing:border-box;font-family:Arial,Tahoma,"Segoe UI",sans-serif;font-size:11px;line-height:1.35;color:#000;background:#fff;overflow:visible;height:auto;max-height:none}
    .receipt .logo{width:17mm;height:17mm;object-fit:contain;display:block;margin:0 auto 2mm}.receipt h1{font-size:17px;margin:0 0 1mm;text-align:center}.receipt p{margin:0 0 1mm}.receipt header,.receipt footer{text-align:center}
    .receipt .center{text-align:center}.receipt .en{direction:ltr}.receipt .meta,.receipt .totals{border-top:1px dashed #000;border-bottom:1px dashed #000;margin:3mm 0;padding:2mm 0}
    .receipt .row{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm;margin:1mm 0}.receipt .row span:first-child{flex:0 0 auto}.receipt .value{overflow-wrap:anywhere;word-break:break-word;text-align:end;max-width:45mm}
    .receipt .invoice-number{max-width:100%;overflow-wrap:anywhere;word-break:break-word;white-space:normal;direction:ltr;text-align:left}
    .receipt table{width:100%;border-collapse:collapse}.receipt td{padding:1.5mm 0;vertical-align:top;border-bottom:1px dotted #999}.receipt .qty{width:9mm;font-weight:bold}.receipt .item-name{overflow-wrap:anywhere;word-break:break-word}.receipt .money{text-align:end;white-space:nowrap}
    .receipt small{display:block;color:#333;margin-top:1mm}.receipt .strong{font-size:14px;font-weight:bold}.receipt footer{margin-top:4mm;font-size:10px}
  </style></head><body class="${kind} receipt-document">${body}</body></html>`;
}

function line(label: string, value: string, className = "") {
  return `<div class="row"><span>${escapeHtml(label)}</span><strong class="value ${className}">${escapeHtml(value || "-")}</strong></div>`;
}

function moneyLine(label: string, amount: { value: number; display: string }, negative = false, className = "") {
  if (!amount.value) return "";
  const display = negative ? `- ${amount.display}` : amount.display;
  return `<div class="row ${className}"><span>${escapeHtml(label)}</span><strong class="value">${escapeHtml(display)}</strong></div>`;
}

function money(value: number, currency: string) {
  return { value, display: formatMoney(value, currency) };
}

function formatMoney(value: number, currency: string) {
  return `${currency || "ILS"} ${Number(value || 0).toFixed(2)}`;
}

function paymentLabel(value: string, locale: "en" | "ar") {
  if (value === "CREDIT_CARD") return locale === "ar" ? "بطاقة / فيزا" : "Visa / Card";
  if (value === "BANK") return locale === "ar" ? "بنك" : "Bank";
  return locale === "ar" ? "نقداً" : "Cash";
}

function deliveryLabel(value: string, locale: "en" | "ar") {
  if (value === "DINE_IN") return locale === "ar" ? "داخل المطعم" : "Dine-in";
  if (value === "DELIVERY") return locale === "ar" ? "توصيل" : "Delivery";
  if (value === "TAKEAWAY") return locale === "ar" ? "سفري" : "Takeaway";
  if (value === "EMPLOYEE_ORDER") return locale === "ar" ? "طلب موظف" : "Employee order";
  if (value === "HOSPITALITY") return locale === "ar" ? "ضيافة" : "Hospitality";
  if (value === "COMPLIMENTARY") return locale === "ar" ? "مجاني" : "Complimentary";
  return locale === "ar" ? "استلام" : "Pickup";
}

export function escapeHtml(value: string) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
