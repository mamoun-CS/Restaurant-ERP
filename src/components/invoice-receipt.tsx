"use client";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Globe2, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/components/language-provider";

type Invoice = {
  number: string;
  createdAt: string;
  subtotal: string | number;
  discountAmount: string | number;
  taxAmount: string | number;
  totalAmount: string | number;
  grandTotal: string | number;
  customerName?: string | null;
  customerNotes?: string | null;
  orderType: string;
  paymentMethod: string;
  cashier?: { name: string };
  items: { productNameSnapshot: string; quantity: number; unitPrice: string | number; selectedSizeSnapshot?: string | null; addons?: { nameSnapshot: string; priceSnapshot: string | number }[] }[];
};

export default function InvoiceReceipt({ number }: { number: string }) {
  const { t, locale, setLocale } = useLanguage();
  const [data, setData] = useState<Invoice | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/invoices/${encodeURIComponent(number)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.message || payload?.error || "Invoice not found");
        setData(payload);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Invoice not found"));
  }, [number]);
  return (
    <main className="min-h-screen bg-background">
      <header className="no-print h-18 bg-surface border-b border-border px-4 sm:px-8 flex items-center">
        <Link href="/pos" className="btn-secondary flex items-center gap-2"><ArrowLeft size={17} className="rtl:rotate-180" /><span className="hidden sm:inline">{t("backToPos")}</span></Link>
        <div className="ms-auto flex gap-2"><button onClick={() => setLocale(locale === "en" ? "ar" : "en")} className="btn-secondary flex gap-2 items-center"><Globe2 size={17} />{t("language")}</button><button onClick={() => window.print()} className="btn-primary flex gap-2 items-center"><Printer size={17} />{t("print")}</button></div>
      </header>
      <div className="max-w-3xl mx-auto p-4 sm:p-10">
        <div className="no-print text-center mb-6">
          <CheckCircle2 size={42} className="text-success mx-auto" />
          <h1 className="text-2xl font-bold mt-3">{data ? "Payment completed" : error || "Loading..."}</h1>
          <p className="text-muted mt-1">Invoice #{number}</p>
        </div>
        {data && (
          <article className="receipt-print bg-white border border-border shadow-xl rounded-sm w-full max-w-[380px] mx-auto p-7 text-sm">
            <div className="text-center"><BrandLogo variant="icon" className="mx-auto size-14" /><h2 dir="rtl" className="font-bold text-xl mt-3">شيخ الكار</h2><p className="text-muted text-xs mt-1">Ramallah · +970 59 123 4567</p></div>
            <div className="border-y border-dashed border-border py-4 my-5 text-xs space-y-1.5">
              <div className="flex justify-between"><span>{t("invoice")}</span><b>#{data.number}</b></div>
              <div className="flex justify-between"><span>{t("date")}</span><span>{new Date(data.createdAt).toLocaleString(locale === "ar" ? "ar" : "en", { dateStyle: "medium", timeStyle: "short" })}</span></div>
              <div className="flex justify-between"><span>{t("employee")}</span><span>{data.cashier?.name || "-"}</span></div>
              {data.customerName && <div className="flex justify-between"><span>{locale === "ar" ? "الزبون" : "Customer"}</span><span>{data.customerName}</span></div>}
              <div className="flex justify-between"><span>{t("payment")}</span><span>{paymentLabel(data.paymentMethod, locale)}</span></div>
              <div className="flex justify-between"><span>{t("deliveryMethod")}</span><span>{deliveryLabel(data.orderType, locale)}</span></div>
              {data.customerNotes && <div className="flex justify-between gap-3"><span>{t("orderNotes")}</span><span className="text-end">{data.customerNotes}</span></div>}
            </div>
            <div className="space-y-4">{data.items.map((item, index) => <div key={index} className="flex gap-3"><span>{item.quantity}×</span><div className="flex-1"><b>{item.productNameSnapshot}</b>{item.selectedSizeSnapshot && <small className="block text-muted">{item.selectedSizeSnapshot}</small>}{Boolean(item.addons?.length) && <small className="block text-muted">{item.addons?.map((addon) => addon.nameSnapshot).join(", ")}</small>}</div><span>₪ {(Number(item.unitPrice) * item.quantity).toFixed(2)}</span></div>)}</div>
            <div className="border-t border-dashed border-border mt-5 pt-4 space-y-2">
              <div className="flex justify-between text-muted"><span>{t("subtotal")}</span><span>₪ {Number(data.subtotal).toFixed(2)}</span></div>
              {Number(data.discountAmount) > 0 && <div className="flex justify-between text-success"><span>{t("discount")}</span><span>− ₪ {Number(data.discountAmount).toFixed(2)}</span></div>}
              {Number(data.taxAmount) > 0 && <div className="flex justify-between text-muted"><span>Tax</span><span>₪ {Number(data.taxAmount).toFixed(2)}</span></div>}
              <div className="flex justify-between text-lg font-bold pt-2"><span>{t("total")}</span><span>₪ {(Number(data.grandTotal || 0) > 0 ? Number(data.grandTotal) : Number(data.totalAmount)).toFixed(2)}</span></div>
            </div>
            <div className="text-center border-t border-dashed border-border mt-5 pt-5"><b>{t("thanks")}</b><p className="text-[10px] text-muted mt-2">Tax included · Tax no. 310048229</p></div>
          </article>
        )}
      </div>
    </main>
  );
}

function paymentLabel(value: string, locale: "en" | "ar") {
  if (value === "CREDIT_CARD") return locale === "ar" ? "بطاقة / فيزا" : "Visa / Card";
  if (value === "BANK") return locale === "ar" ? "بنك" : "Bank";
  return locale === "ar" ? "نقداً" : "Cash";
}

function deliveryLabel(value: string, locale: "en" | "ar") {
  if (value === "DINE_IN") return locale === "ar" ? "داخل المطعم" : "Dine-in";
  if (value === "DELIVERY") return locale === "ar" ? "توصيل" : "Delivery";
  return locale === "ar" ? "سفري" : "Takeaway";
}
