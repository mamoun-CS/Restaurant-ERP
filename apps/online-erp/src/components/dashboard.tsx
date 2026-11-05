"use client";
import Link from "next/link";
import { ArrowUpRight, Boxes, CirclePercent, CreditCard, FileText, Plus, ReceiptText, ShoppingBag, TrendingUp, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useLanguage } from "@/components/language-provider";

type Invoice = {
  id: string;
  number: string;
  createdAt: string;
  totalAmount: string | number;
  subtotal: string | number;
  discountAmount: string | number;
  status: string;
  paymentMethod: string;
  cashier?: { name: string };
  items?: unknown[];
};

export default function Dashboard() {
  const { t, locale } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/invoices", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.message || payload?.error || "Failed to load dashboard");
        setInvoices(Array.isArray(payload) ? payload : payload?.data || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return invoices.filter((invoice) => new Date(invoice.createdAt) >= start);
  }, [invoices]);
  const todayIncome = today.reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0);
  const grossSales = today.reduce((sum, invoice) => sum + Number(invoice.subtotal || 0), 0);
  const discounts = today.reduce((sum, invoice) => sum + Number(invoice.discountAmount || 0), 0);
  const cardTotal = today.filter((invoice) => invoice.paymentMethod === "CREDIT_CARD").reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0);
  const stats = [
    { label: t("todayIncome"), value: `₪ ${todayIncome.toFixed(2)}`, delta: loading ? "..." : `${today.length}`, icon: CreditCard, color: "bg-primary-soft text-primary" },
    { label: t("grossSales"), value: `₪ ${grossSales.toFixed(2)}`, delta: "+0%", icon: TrendingUp, color: "bg-success/10 text-success" },
    { label: t("discount"), value: `₪ ${discounts.toFixed(2)}`, delta: "-", icon: ShoppingBag, color: "bg-warning/10 text-warning" },
    { label: t("totalInvoices"), value: String(invoices.length), delta: `Card ₪ ${cardTotal.toFixed(2)}`, icon: ReceiptText, color: "bg-secondary/10 text-secondary" },
  ];

  return (
    <AppShell title={t("dashboard")} description={locale === "ar" ? "بيانات مباشرة من قاعدة البيانات" : "Live data from database"} action={<Link href="/admin/products" className="btn-primary hidden sm:flex items-center gap-2"><Plus size={17} />{t("addProduct")}</Link>}>
      {error && <div className="mb-4 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        {stats.map(({ label, value, delta, icon: Icon, color }) => (
          <div key={label} className="card p-4 sm:p-5">
            <div className="flex justify-between items-start">
              <div className={`size-10 sm:size-11 rounded-xl grid place-items-center ${color}`}><Icon size={21} /></div>
              <span className="text-success text-xs font-bold flex gap-1 items-center"><ArrowUpRight size={13} />{delta}</span>
            </div>
            <p className="text-muted text-xs sm:text-sm mt-5">{label}</p>
            <p className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">{value}</p>
          </div>
        ))}
      </section>
      <section className="grid xl:grid-cols-[1.65fr_1fr] gap-5 mt-5">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div><h2 className="font-bold">{t("salesOverview")}</h2><p className="text-muted text-xs mt-1">{locale === "ar" ? "آخر الطلبات المحفوظة" : "Latest saved orders"}</p></div>
          </div>
          <div className="mt-8 h-56 flex items-end gap-2 border-b border-border relative">
            {invoices.slice(0, 14).reverse().map((invoice) => {
              const height = Math.min(100, Math.max(8, Number(invoice.totalAmount || 0) * 2));
              return <div key={invoice.id} title={`${invoice.number} ₪ ${Number(invoice.totalAmount).toFixed(2)}`} className="flex-1 bg-primary-soft hover:bg-primary rounded-t-md transition-all" style={{ height: `${height}%` }} />;
            })}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex justify-between"><h2 className="font-bold">{t("payment")}</h2><Link href="/admin/invoices" className="text-primary text-sm font-bold">{t("viewAll")}</Link></div>
          <div className="mt-5 space-y-4">
            {["CASH", "CREDIT_CARD", "BANK"].map((method) => {
              const total = today.filter((invoice) => invoice.paymentMethod === method).reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0);
              return <div key={method} className="flex items-center justify-between rounded-xl bg-background p-3"><span className="text-sm font-semibold">{paymentLabel(method, locale)}</span><b>₪ {total.toFixed(2)}</b></div>;
            })}
          </div>
        </div>
      </section>
      <section className="grid xl:grid-cols-[1.65fr_1fr] gap-5 mt-5">
        <div className="card overflow-hidden">
          <div className="p-5 flex justify-between"><h2 className="font-bold">{t("recentInvoices")}</h2><Link href="/admin/invoices" className="text-primary text-sm font-bold">{t("viewAll")}</Link></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background text-muted text-xs"><tr><th className="p-3 text-start">{t("invoice")}</th><th className="p-3 text-start">{t("employee")}</th><th className="p-3 text-start">{t("items")}</th><th className="p-3 text-start">{t("payment")}</th><th className="p-3 text-end">{t("total")}</th></tr></thead>
              <tbody>
                {loading && <tr><td className="p-5 text-center text-muted" colSpan={5}>Loading...</td></tr>}
                {!loading && invoices.slice(0, 6).map((invoice) => (
                  <tr key={invoice.id} className="border-t border-border">
                    <td className="p-3"><Link href={`/invoice/${invoice.number}`} className="font-bold text-primary">#{invoice.number}</Link><small className="block text-muted">{new Date(invoice.createdAt).toLocaleTimeString(locale === "ar" ? "ar" : "en", { hour: "2-digit", minute: "2-digit" })}</small></td>
                    <td className="p-3">{invoice.cashier?.name || "-"}</td>
                    <td className="p-3">{invoice.items?.length || 0}</td>
                    <td className="p-3">{paymentLabel(invoice.paymentMethod, locale)}</td>
                    <td className="p-3 text-end font-bold">₪ {Number(invoice.totalAmount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card p-5"><h2 className="font-bold">{t("quickAction")}</h2><div className="grid grid-cols-3 gap-3 mt-5">{[[Boxes, "manageCatalog", "/admin/products"], [CirclePercent, "createOffer", "/admin/discounts"], [UserPlus, "inviteCashier", "/admin/employees"]].map(([Icon, label, href]) => { const I = Icon as typeof Boxes; return <Link key={label as string} href={href as string} className="bg-background rounded-xl p-3 text-center hover:bg-primary-soft transition"><I className="mx-auto text-primary" size={22} /><span className="text-xs font-semibold block mt-2">{t(label as "manageCatalog")}</span></Link>; })}</div><div className="mt-5 bg-secondary text-white rounded-xl p-4 flex items-center gap-3"><div className="size-10 rounded-lg bg-white/10 grid place-items-center"><FileText /></div><div><p className="font-semibold text-sm">Daily close</p><p className="text-sidebar-muted text-xs">Ready at 11:00 PM</p></div></div></div>
      </section>
    </AppShell>
  );
}

function paymentLabel(value: string, locale: "en" | "ar") {
  if (value === "CREDIT_CARD") return locale === "ar" ? "بطاقة / فيزا" : "Visa / Card";
  if (value === "BANK") return locale === "ar" ? "بنك" : "Bank";
  return locale === "ar" ? "نقداً" : "Cash";
}
