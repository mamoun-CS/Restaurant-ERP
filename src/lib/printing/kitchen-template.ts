import { baseHtml, escapeHtml } from "./receipt-template";

export type KitchenTicketItem = {
  productName: string;
  quantity: number;
  size?: string | null;
  addons?: { name?: string; nameSnapshot?: string }[];
  notes?: string | null;
};

export function renderKitchenTicket(input: {
  orderNumber: string;
  orderType: string;
  cashierName: string;
  notes?: string | null;
  items: KitchenTicketItem[];
  locale?: "en" | "ar";
}) {
  const locale = input.locale || "ar";
  const rows = input.items.map((item) => `
    <section class="kitchen-item">
      <div class="line strong"><span class="qty">${item.quantity}x</span><strong>${escapeHtml(item.productName)}</strong></div>
      ${item.size ? `<p>${escapeHtml(item.size)}</p>` : ""}
      ${item.addons?.length ? `<p>${item.addons.map((a) => escapeHtml(a.name || a.nameSnapshot || "")).filter(Boolean).join(", ")}</p>` : ""}
      ${item.notes ? `<p class="note">${escapeHtml(item.notes)}</p>` : ""}
    </section>`).join("");
  return baseHtml("ticket", locale === "ar" ? "rtl" : "ltr", `
    <header><h1>${locale === "ar" ? "تذكرة مطبخ" : "Kitchen Ticket"}</h1></header>
    <section class="meta">
      <div class="line strong"><span>${locale === "ar" ? "الطلب" : "Order"}</span><strong>${escapeHtml(input.orderNumber)}</strong></div>
      <div class="line"><span>${locale === "ar" ? "النوع" : "Type"}</span><strong>${escapeHtml(input.orderType)}</strong></div>
      <div class="line"><span>${locale === "ar" ? "الكاشير" : "Cashier"}</span><strong>${escapeHtml(input.cashierName)}</strong></div>
      <div class="line"><span>${locale === "ar" ? "الوقت" : "Time"}</span><strong>${new Date().toLocaleString(locale === "ar" ? "ar" : "en")}</strong></div>
    </section>
    ${rows}
    ${input.notes ? `<footer>${escapeHtml(input.notes)}</footer>` : ""}`);
}
