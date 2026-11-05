"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import Link from "next/link";
import { Download, Eye, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageToolbar, Pagination, StatusBadge } from "@/components/ui";
import { useLanguage } from "@/components/language-provider";

type Invoice = {
  id: string;
  number: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: string | number;
  subtotal: string | number;
  discountAmount: string | number;
  taxAmount: string | number;
  status: string;
  grandTotal: string | number;
  customerName?: string | null;
  customerPhone?: string | null;
  customerNotes?: string | null;
  orderType: string;
  paymentMethod: string;
  cashier?: { name: string };
  branch?: { name: string; nameAr?: string | null };
  items?: unknown[];
  payments?: { status: string; method: string }[];
  kitchenOrder?: { status: string } | null;
};

export default function InvoicesPage() {
  const { t, locale } = useLanguage();
  const [rows, setRows] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/invoices", { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || payload?.error || "Failed to load invoices");
      setRows(Array.isArray(payload) ? payload : payload?.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((row) => `${row.number} ${row.cashier?.name || ""} ${row.branch?.name || ""}`.toLowerCase().includes(q));
  }, [rows, search]);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AppShell
      title={t("invoices")}
      description={locale === "ar" ? "كل الطلبات والفواتير المحفوظة في قاعدة البيانات" : "All orders and receipts saved in the database"}
      action={
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download size={17} />
            <span className="hidden sm:inline">{t("export")}</span>
          </button>
        </div>
      }
    >
      <PageToolbar search={search} setSearch={(value) => { setSearch(value); setPage(1); }}>
        <select className="input !w-auto"><option>{t("allBranches")}</option></select>
        <select className="input !w-auto"><option>{t("employee")}: All</option></select>
      </PageToolbar>
      {error && <div className="mb-4 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="p-4 text-start">{t("invoice")}</th>
                <th className="p-4 text-start">{t("date")}</th>
                <th className="p-4 text-start">{t("employee")}</th>
                <th className="p-4 text-start">{locale === "ar" ? "الزبون" : "Customer"}</th>
                <th className="p-4 text-start">{t("branch")}</th>
                <th className="p-4 text-start">{t("items")}</th>
                <th className="p-4 text-start">{t("payment")}</th>
                <th className="p-4 text-start">{t("deliveryMethod")}</th>
                <th className="p-4 text-start">{t("orderNotes")}</th>
                <th className="p-4 text-start">{t("status")}</th>
                <th className="p-4 text-end">{t("subtotal")}</th>
                <th className="p-4 text-end">{t("discount")}</th>
                <th className="p-4 text-end">Tax</th>
                <th className="p-4 text-end">{t("total")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="p-8 text-center text-muted" colSpan={15}>Loading...</td></tr>}
              {!loading && !visible.length && <tr><td className="p-8 text-center text-muted" colSpan={15}>{t("noResults")}</td></tr>}
              {!loading && visible.map((invoice) => (
                <tr key={invoice.id} className="border-t border-border hover:bg-background">
                  <td className="p-4 font-bold text-primary">#{invoice.number}</td>
                  <td className="p-4">{formatDate(invoice.createdAt, locale)}<small className="block text-muted">{formatDate(invoice.updatedAt, locale)}</small></td>
                  <td className="p-4">{invoice.cashier?.name || "-"}</td>
                  <td className="p-4">{invoice.customerName || "-"}{invoice.customerPhone && <small className="block text-muted">{invoice.customerPhone}</small>}</td>
                  <td className="p-4">{locale === "ar" ? invoice.branch?.nameAr || invoice.branch?.name : invoice.branch?.name}</td>
                  <td className="p-4">{invoice.items?.length || 0}</td>
                  <td className="p-4">{paymentLabel(invoice.paymentMethod, locale)}<small className="block text-muted">{invoice.payments?.[0]?.status || "COMPLETED"}</small></td>
                  <td className="p-4">{deliveryLabel(invoice.orderType, locale)}</td>
                  <td className="p-4 max-w-[190px] truncate" title={invoice.customerNotes || t("noNotes")}>{invoice.customerNotes || t("noNotes")}</td>
                  <td className="p-4"><StatusBadge label={statusLabel(invoice, locale)} active={invoice.status !== "VOIDED"} /></td>
                  <td className="p-4 text-end font-bold">₪ {amount(invoice.subtotal)}</td>
                  <td className="p-4 text-end">₪ {amount(invoice.discountAmount)}</td>
                  <td className="p-4 text-end">₪ {amount(invoice.taxAmount)}</td>
                  <td className="p-4 text-end font-bold">₪ {amount(grandTotal(invoice))}</td>
                  <td className="p-4"><Link href={`/invoice/${invoice.number}`} className="size-9 rounded-lg bg-primary-soft text-primary grid place-items-center"><Eye size={17} /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} />
    </AppShell>
  );
}

function amount(value: string | number) {
  return Number(value || 0).toFixed(2);
}

function grandTotal(invoice: Invoice) {
  return Number(invoice.grandTotal || 0) > 0 ? invoice.grandTotal : invoice.totalAmount;
}

function formatDate(value: string, locale: "en" | "ar") {
  return new Date(value).toLocaleString(locale === "ar" ? "ar" : "en", { dateStyle: "medium", timeStyle: "short" });
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

function statusLabel(invoice: Invoice, locale: "en" | "ar") {
  const kitchen = invoice.kitchenOrder?.status;
  if (kitchen === "PREPARING") return locale === "ar" ? "قيد التحضير" : "Preparing";
  if (kitchen === "READY") return locale === "ar" ? "جاهز" : "Ready";
  if (invoice.status === "PAID" || invoice.status === "COMPLETED") return locale === "ar" ? "مدفوع" : "Paid";
  return invoice.status;
}
