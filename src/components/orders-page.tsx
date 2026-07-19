"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Copy,
  Eye,
  Pencil,
  Printer,
  RefreshCw,
  Search,
  ShoppingBag,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/components/language-provider";

type Locale = "en" | "ar";
type RawRecord = Record<string, unknown>;
type OrderStatus = "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED" | "DONE";
type PaymentKind = "CASH" | "CARD" | "SPLIT" | "OTHER";
type DeliveryKind = "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "OTHER";

type OrderRow = {
  id: string;
  number: string;
  createdAt: Date | null;
  cashier: string;
  itemsCount: number;
  total: number;
  payment: PaymentKind;
  delivery: DeliveryKind;
  notes: string;
  status: OrderStatus;
  sourceStatus: string;
  canModify: boolean;
};

const copy = {
  en: {
    back: "Back to POS",
    title: "Orders",
    subtitle: "Cashier order management",
    refresh: "Refresh",
    search: "Search orders",
    today: "Today",
    shift: "Current shift",
    status: "Status",
    allStatus: "All statuses",
    orderNumber: "Order number",
    customer: "Customer name",
    payment: "Payment type",
    deliveryMethod: "Delivery",
    notes: "Notes",
    noNotes: "No notes",
    allPayments: "All payments",
    future: "Future",
    time: "Time",
    cashier: "Cashier",
    items: "Items",
    total: "Total",
    actions: "Actions",
    view: "View",
    print: "Print",
    edit: "Edit",
    cancel: "Cancel",
    delete: "Delete",
    deleteTitle: "Delete order",
    deleteMessage: "Are you sure you want to delete this order? This action cannot be undone.",
    deleted: "Order deleted successfully.",
    deleteFailed: "Order could not be deleted.",
    deleting: "Deleting...",
    duplicate: "Duplicate order",
    loading: "Loading orders",
    empty: "No orders found",
    emptyHint: "Try changing the filters or refresh the page.",
    error: "Orders could not be loaded.",
    retry: "Retry",
    showing: "Showing",
    of: "of",
    page: "Page",
    notAvailable: "Not available",
    modificationClosed: "Modification window closed",
    pending: "Pending",
    preparing: "Preparing",
    ready: "Ready",
    delivered: "Delivered",
    done: "Done",
    cancelled: "Cancelled",
    cash: "Cash",
    card: "Visa/Card",
    split: "Split payment",
    other: "Other",
    dineIn: "Dine-in",
    takeaway: "Takeaway",
    delivery: "Delivery",
  },
  ar: {
    back: "العودة إلى نقطة البيع",
    title: "الطلبات",
    subtitle: "إدارة طلبات الكاشير",
    refresh: "تحديث",
    search: "ابحث في الطلبات",
    today: "اليوم",
    shift: "الوردية الحالية",
    status: "الحالة",
    allStatus: "كل الحالات",
    orderNumber: "رقم الطلب",
    customer: "اسم الزبون",
    payment: "طريقة الدفع",
    deliveryMethod: "التسليم",
    notes: "ملاحظات",
    noNotes: "لا توجد ملاحظات",
    allPayments: "كل طرق الدفع",
    future: "لاحقا",
    time: "الوقت",
    cashier: "الكاشير",
    items: "الأصناف",
    total: "الإجمالي",
    actions: "إجراءات",
    view: "عرض",
    print: "طباعة",
    edit: "تعديل",
    cancel: "إلغاء",
    delete: "حذف",
    deleteTitle: "حذف الطلب",
    deleteMessage: "هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.",
    deleted: "تم حذف الطلب بنجاح.",
    deleteFailed: "تعذر حذف الطلب.",
    deleting: "جارٍ الحذف...",
    duplicate: "تكرار الطلب",
    loading: "جاري تحميل الطلبات",
    empty: "لا توجد طلبات",
    emptyHint: "جرّب تغيير الفلاتر أو تحديث الصفحة.",
    error: "تعذر تحميل الطلبات.",
    retry: "إعادة المحاولة",
    showing: "عرض",
    of: "من",
    page: "صفحة",
    notAvailable: "غير متوفر",
    modificationClosed: "انتهت مهلة التعديل",
    pending: "قيد الانتظار",
    preparing: "قيد التحضير",
    ready: "جاهز",
    delivered: "تم التسليم",
    done: "تم",
    cancelled: "ملغي",
    cash: "نقدا",
    card: "فيزا/بطاقة",
    split: "دفع مقسم",
    other: "أخرى",
    dineIn: "داخل المطعم",
    takeaway: "سفري",
    delivery: "توصيل",
  },
} satisfies Record<Locale, Record<string, string>>;

const PAGE_SIZE = 10;
const lockedStatuses = new Set(["PREPARING", "READY", "DELIVERED", "CANCELLED", "DONE"]);

export default function OrdersPage() {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [fetchedAt, setFetchedAt] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [todayOnly, setTodayOnly] = useState(true);
  const [currentShift, setCurrentShift] = useState(false);
  const [status, setStatus] = useState("ALL");
  const [payment, setPayment] = useState("ALL");
  const [orderNumber, setOrderNumber] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<OrderRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/invoices", { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(readString(payload, "message") || c.error);
      setOrders(extractRows(payload).map(normalizeOrder));
      setFetchedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : c.error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteOrder() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setNotice("");
    try {
      const response = await fetch(`/api/invoices/${encodeURIComponent(deleteTarget.id)}`, { method: "DELETE" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(readString(payload, "message") || readString(payload, "error") || c.deleteFailed);
      setDeleteTarget(null);
      setNotice(c.deleted);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : c.deleteFailed);
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const num = orderNumber.trim().toLowerCase();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return orders.filter((order) => {
      if (todayOnly && order.createdAt && order.createdAt < startOfDay) return false;
      if (status !== "ALL" && order.status !== status) return false;
      if (payment !== "ALL" && order.payment !== payment) return false;
      if (num && !order.number.toLowerCase().includes(num)) return false;
      if (currentShift && order.createdAt && fetchedAt - order.createdAt.getTime() > 8 * 60 * 60 * 1000) return false;
      if (!q) return true;
      return [order.number, order.cashier, order.sourceStatus].some((value) =>
        value.toLowerCase().includes(q),
      );
    });
  }, [currentShift, fetchedAt, orderNumber, orders, payment, search, status, todayOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [currentShift, orderNumber, payment, search, status, todayOnly]);

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-sidebar text-white px-4 sm:px-6 py-3">
        <div className="mx-auto flex max-w-[1680px] items-center gap-3">
          <Link href="/pos" className="flex min-w-0 items-center gap-3">
            <ArrowLeft className="shrink-0 rtl:rotate-180" size={18} />
            <BrandLogo variant="icon" className="size-9 shrink-0" />
            <span className="hidden text-sm text-sidebar-muted sm:inline">{c.back}</span>
          </Link>
          <div className="min-w-0 ps-2">
            <h1 className="truncate text-xl font-bold">{c.title}</h1>
            <p className="truncate text-xs text-sidebar-muted">{c.subtitle}</p>
          </div>
          <button onClick={loadOrders} className="ms-auto h-10 rounded-xl bg-white/10 px-3 text-sm font-bold">
            <RefreshCw className={loading ? "animate-spin" : ""} size={17} />
            <span className="hidden sm:inline">{c.refresh}</span>
          </button>
        </div>
      </header>

      <div className="page-container">
        {notice && <div className="mb-4 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm font-bold text-success">{notice}</div>}
        <section className="card mb-4 p-3">
          <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_auto_auto_auto_auto]">
            <label className="relative min-w-0">
              <Search className="absolute start-3.5 top-3.5 text-muted" size={17} />
              <input className="input input-icon-start" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={c.search} />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setTodayOnly((v) => !v)} className={toggleClass(todayOnly)}>
                {c.today}
              </button>
              <button type="button" onClick={() => setCurrentShift((v) => !v)} className={toggleClass(currentShift)}>
                {c.shift}
              </button>
            </div>
            <select className="input xl:!w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">{c.allStatus}</option>
              <option value="PENDING">{c.pending}</option>
              <option value="PREPARING">{c.preparing}</option>
              <option value="READY">{c.ready}</option>
              <option value="DELIVERED">{c.delivered}</option>
              <option value="DONE">{c.done}</option>
              <option value="CANCELLED">{c.cancelled}</option>
            </select>
            <input className="input xl:!w-[170px]" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder={c.orderNumber} />
            <select className="input xl:!w-[170px]" value={payment} onChange={(e) => setPayment(e.target.value)}>
              <option value="ALL">{c.allPayments}</option>
              <option value="CASH">{c.cash}</option>
              <option value="CARD">{c.card}</option>
              <option value="SPLIT">{c.split}</option>
            </select>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,280px)_1fr]">
            <input className="input opacity-70" disabled placeholder={`${c.customer} (${c.future})`} />
          </div>
        </section>

        {error ? (
          <StatePanel icon={<AlertCircle size={24} />} title={c.error} text={error} action={<button onClick={loadOrders} className="btn-secondary">{c.retry}</button>} />
        ) : loading ? (
          <LoadingState label={c.loading} />
        ) : filtered.length === 0 ? (
          <StatePanel icon={<ShoppingBag size={24} />} title={c.empty} text={c.emptyHint} />
        ) : (
          <>
            <section className="card overflow-hidden mobile-hidden-table">
              <div className="table-scroll">
                <table className="w-full min-w-[1260px] text-sm">
                  <thead className="bg-background text-xs uppercase tracking-[.04em] text-muted">
                    <tr>
                      <th className="p-3 text-start">{c.orderNumber}</th>
                      <th className="p-3 text-start">{c.time}</th>
                      <th className="p-3 text-start">{c.cashier}</th>
                      <th className="p-3 text-start">{c.items}</th>
                      <th className="p-3 text-start">{c.total}</th>
                      <th className="p-3 text-start">{c.payment}</th>
                      <th className="p-3 text-start">{c.deliveryMethod}</th>
                      <th className="p-3 text-start">{c.notes}</th>
                      <th className="p-3 text-start">{c.status}</th>
                      <th className="p-3 text-end">{c.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((order) => (
                      <tr key={order.id} className="border-t border-border hover:bg-background/70">
                        <td className="p-3 font-bold text-primary">#{order.number}</td>
                        <td className="p-3">{formatDate(order.createdAt, locale)}</td>
                        <td className="p-3">{order.cashier || c.notAvailable}</td>
                        <td className="p-3 amount">{order.itemsCount}</td>
                        <td className="p-3 amount font-bold">₪ {order.total.toFixed(2)}</td>
                        <td className="p-3">{paymentLabel(order.payment, c)}</td>
                        <td className="p-3">{deliveryLabel(order.delivery, c)}</td>
                        <td className="p-3 max-w-[180px] truncate" title={order.notes || c.noNotes}>{order.notes || c.noNotes}</td>
                        <td className="p-3"><OrderBadge status={order.status} label={statusLabel(order.status, c)} /></td>
                        <td className="p-3"><ActionBar order={order} labels={c} onDelete={() => setDeleteTarget(order)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mobile-card-list">
              {visible.map((order) => (
                <article key={order.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <b className="break-anywhere text-primary">#{order.number}</b>
                      <p className="mt-1 text-xs text-muted">{formatDate(order.createdAt, locale)} · {order.cashier || c.notAvailable}</p>
                    </div>
                    <OrderBadge status={order.status} label={statusLabel(order.status, c)} />
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div><dt className="text-xs text-muted">{c.items}</dt><dd className="mt-1 font-bold">{order.itemsCount}</dd></div>
                    <div><dt className="text-xs text-muted">{c.payment}</dt><dd className="mt-1 font-bold">{paymentLabel(order.payment, c)}</dd></div>
                    <div><dt className="text-xs text-muted">{c.total}</dt><dd className="mt-1 font-bold">₪ {order.total.toFixed(2)}</dd></div>
                  </dl>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div><dt className="text-xs text-muted">{c.deliveryMethod}</dt><dd className="mt-1 font-bold">{deliveryLabel(order.delivery, c)}</dd></div>
                    <div><dt className="text-xs text-muted">{c.notes}</dt><dd className="mt-1 font-bold">{order.notes || c.noNotes}</dd></div>
                  </dl>
                  <div className="mt-4"><ActionBar order={order} labels={c} onDelete={() => setDeleteTarget(order)} /></div>
                </article>
              ))}
            </section>

            <Pagination currentPage={safePage} totalPages={totalPages} totalItems={filtered.length} labels={c} onPageChange={setPage} />
          </>
        )}
      </div>
      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-text/50 p-4" onMouseDown={() => setDeleteTarget(null)}>
          <section className="card w-full max-w-md p-5 shadow-2xl" role="alertdialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <h2 className="text-xl font-bold">{c.deleteTitle}</h2>
            <p className="mt-2 text-sm text-muted">{c.deleteMessage}</p>
            <p className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-sm font-bold text-danger">#{deleteTarget.number}</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button className="btn-secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>{c.cancel}</button>
              <button className="rounded-xl bg-danger px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50" disabled={deleting} onClick={deleteOrder}>{deleting ? c.deleting : c.delete}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function extractRows(payload: unknown): RawRecord[] {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (isRecord(payload)) {
    const data = payload.data;
    if (Array.isArray(data)) return data.filter(isRecord);
  }
  return [];
}

function normalizeOrder(raw: RawRecord): OrderRow {
  const createdAt = parseDate(readString(raw, "createdAt") || readString(raw, "paidAt"));
  const createdMs = createdAt?.getTime();
  const kitchenOrder = readRecord(raw, "kitchenOrder");
  const sourceStatus = readString(kitchenOrder, "status") || readString(raw, "status") || "";
  const baseStatus = normalizeStatus(sourceStatus);
  const isOlderThanEditWindow = typeof createdMs === "number" && Date.now() - createdMs > 5 * 60 * 1000;
  const status = baseStatus === "PENDING" && isOlderThanEditWindow ? "DONE" : baseStatus;
  return {
    id: readString(raw, "id") || readString(raw, "number") || crypto.randomUUID(),
    number: readString(raw, "number") || readString(raw, "officialNumber") || readString(raw, "id") || "-",
    createdAt,
    cashier: readString(readRecord(raw, "cashier"), "name") || readString(raw, "cashierName"),
    itemsCount: countItems(raw),
    total: readNumber(raw, "totalAmount") ?? readNumber(raw, "total") ?? readNumber(readRecord(raw, "payment"), "amount") ?? 0,
    payment: normalizePayment(raw),
    delivery: normalizeDelivery(raw),
    notes: readString(raw, "customerNotes") || readString(kitchenOrder, "notes"),
    status,
    sourceStatus,
    canModify: typeof createdMs === "number" && Date.now() - createdMs <= 5 * 60 * 1000 && !lockedStatuses.has(status),
  };
}

function countItems(raw: RawRecord) {
  const items = raw.items;
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (isRecord(item) ? Math.max(1, readNumber(item, "quantity") ?? 1) : 1), 0);
}

function normalizeStatus(value: string): OrderStatus {
  const status = value.toUpperCase();
  if (status.includes("CANCEL") || status.includes("VOID") || status.includes("REFUND")) return "CANCELLED";
  if (status.includes("DELIVER")) return "DELIVERED";
  if (status.includes("READY")) return "READY";
  if (status.includes("PREPAR")) return "PREPARING";
  return "PENDING";
}

function normalizePayment(raw: RawRecord): PaymentKind {
  const payments = Array.isArray(raw.payments) ? raw.payments : [];
  if (Array.isArray(payments) && payments.length > 1) return "SPLIT";
  const method = (readString(raw, "paymentMethod") || readString(readRecord(raw, "payment"), "method") || readString(isRecord(payments?.[0]) ? payments[0] : undefined, "method")).toUpperCase();
  if (method === "CASH") return "CASH";
  if (method === "CREDIT_CARD" || method === "CARD" || method === "VISA") return "CARD";
  return "OTHER";
}

function normalizeDelivery(raw: RawRecord): DeliveryKind {
  const value = readString(raw, "orderType").toUpperCase();
  if (value === "DINE_IN") return "DINE_IN";
  if (value === "TAKEAWAY" || value === "PICKUP") return "TAKEAWAY";
  if (value === "DELIVERY") return "DELIVERY";
  return "OTHER";
}

function ActionBar({ order, labels, onDelete }: { order: OrderRow; labels: (typeof copy)["en"]; onDelete: () => void }) {
  const closed = !order.canModify;
  return (
    <div className="flex justify-end gap-1.5">
      <IconLink href={`/invoice/${encodeURIComponent(order.number)}`} label={labels.view} icon={<Eye size={16} />} />
      <IconButton label={labels.print} icon={<Printer size={16} />} onClick={() => window.print()} />
      <IconLink href={`/pos?edit=${encodeURIComponent(order.id)}`} label={closed ? labels.modificationClosed : labels.edit} icon={<Pencil size={16} />} disabled={closed} />
      <IconButton label={closed ? labels.modificationClosed : labels.delete} icon={<Ban size={16} />} disabled={closed} danger onClick={onDelete} />
      <Link href="/pos" title={labels.duplicate} aria-label={labels.duplicate} className="size-9 rounded-lg border border-border bg-surface grid place-items-center text-muted hover:text-primary">
        <Copy size={16} />
      </Link>
    </div>
  );
}

function IconLink({ href, label, icon, disabled }: { href: string; label: string; icon: React.ReactNode; disabled?: boolean }) {
  if (disabled) return <span title={label} aria-label={label} className="size-9 rounded-lg border border-border bg-surface grid place-items-center text-muted opacity-45">{icon}</span>;
  return <Link href={href} title={label} aria-label={label} className="size-9 rounded-lg bg-primary-soft text-primary grid place-items-center">{icon}</Link>;
}

function IconButton({ label, icon, disabled, danger, onClick }: { label: string; icon: React.ReactNode; disabled?: boolean; danger?: boolean; onClick?: () => void }) {
  return <button type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick} className={`size-9 rounded-lg border border-border bg-surface grid place-items-center ${danger ? "text-danger" : "text-muted hover:text-primary"}`}>{icon}</button>;
}

function OrderBadge({ status, label }: { status: OrderStatus; label: string }) {
  const styles = {
    PENDING: "bg-warning/10 text-warning",
    PREPARING: "bg-primary-soft text-primary",
    READY: "bg-success/10 text-success",
    DELIVERED: "bg-muted/10 text-muted",
    DONE: "bg-success/10 text-success",
    CANCELLED: "bg-danger/10 text-danger",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>{label}</span>;
}

function LoadingState({ label }: { label: string }) {
  return <section className="card p-4"><p className="mb-4 text-sm font-bold text-muted">{label}</p>{Array.from({ length: 6 }).map((_, i) => <div key={i} className="mb-3 h-12 animate-pulse rounded-lg bg-border/50" />)}</section>;
}

function StatePanel({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) {
  return <section className="card grid min-h-[300px] place-items-center p-8 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary">{icon}</span><h2 className="mt-4 text-lg font-bold">{title}</h2><p className="mt-2 text-sm text-muted">{text}</p>{action && <div className="mt-5">{action}</div>}</div></section>;
}

function Pagination({ currentPage, totalPages, totalItems, labels, onPageChange }: { currentPage: number; totalPages: number; totalItems: number; labels: (typeof copy)["en"]; onPageChange: (page: number) => void }) {
  return <div className="mt-4 flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between"><span>{labels.showing} {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, totalItems)} {labels.of} {totalItems}</span><div className="flex items-center gap-2"><button className="btn-secondary" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>‹</button><span>{labels.page} {currentPage} / {totalPages}</span><button className="btn-secondary" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>›</button></div></div>;
}

function toggleClass(active: boolean) {
  return `h-[46px] rounded-xl px-4 text-sm font-bold ${active ? "bg-secondary text-white" : "border border-border bg-surface text-muted"}`;
}

function statusLabel(status: OrderStatus, c: (typeof copy)["en"]) {
  const labels = {
    PENDING: c.pending,
    PREPARING: c.preparing,
    READY: c.ready,
    DELIVERED: c.delivered,
    DONE: c.done,
    CANCELLED: c.cancelled,
  };
  return labels[status];
}

function paymentLabel(payment: PaymentKind, c: (typeof copy)["en"]) {
  if (payment === "CASH") return c.cash;
  if (payment === "CARD") return c.card;
  if (payment === "SPLIT") return c.split;
  return c.other;
}

function deliveryLabel(delivery: DeliveryKind, c: (typeof copy)["en"]) {
  if (delivery === "DINE_IN") return c.dineIn || "Dine-in";
  if (delivery === "TAKEAWAY") return c.takeaway || "Takeaway";
  if (delivery === "DELIVERY") return c.delivery || "Delivery";
  return c.other;
}

function formatDate(date: Date | null, locale: Locale) {
  if (!date) return "-";
  return date.toLocaleString(locale === "ar" ? "ar" : "en", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" });
}

function parseDate(value: string) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function isRecord(value: unknown): value is RawRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readRecord(source: unknown, key: string) {
  if (!isRecord(source)) return undefined;
  const value = source[key];
  return isRecord(value) ? value : undefined;
}

function readString(source: unknown, key: string) {
  if (!isRecord(source)) return "";
  const value = source[key];
  return typeof value === "string" ? value : "";
}

function readNumber(source: unknown, key: string) {
  if (!isRecord(source)) return undefined;
  const value = source[key];
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}
