"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Building2,
  CheckCircle2,
  Clock3,
  Coins,
  RefreshCw,
  Save,
  ShieldAlert,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/ui";
import { useLanguage } from "@/components/language-provider";

type Shift = {
  id: string;
  shiftNumber: string;
  status: string;
  openedAt: string;
  closedAt?: string | null;
  openingTotalBase: string;
  expectedClosingTotalBase?: string | null;
  actualClosingTotalBase?: string | null;
  differenceTotalBase?: string | null;
  branch: { name: string; nameAr?: string | null };
  register: { number: string; name?: string | null };
  employee: { name: string };
  reviewStatus: string;
  discrepancies?: { id: string; currencyCode: string; differenceAmount: string; note: string }[];
};

type Settings = {
  branches: { id: string; name: string; nameAr?: string | null }[];
  registers: { id: string; name: string; number: string; active: boolean; branch: { name: string; nameAr?: string | null } }[];
  currencies: {
    id: string;
    code: string;
    name: string;
    nameAr?: string | null;
    isBase: boolean;
    denominations: { id: string; label: string; value: string; active: boolean }[];
    exchangeRates: { rateToBase: string; previousRate?: string | null; createdAt: string; manager?: { name: string } | null }[];
  }[];
};

type ApiEnvelope<T> = T | { success: boolean; data?: T; message?: string; error?: string };
type Notice = { tone: "success" | "danger"; text: string } | null;

export function CashManagementPage() {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const copy = ar ? arabicCopy : englishCopy;
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rate, setRate] = useState({ currencyCode: "USD", rateToBase: "3.65" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [shiftRes, settingsRes] = await Promise.all([fetch("/api/cash/shifts"), fetch("/api/cash/settings")]);
      const shiftBody = await shiftRes.json().catch(() => null);
      const settingsBody = await settingsRes.json().catch(() => null);
      if (!shiftRes.ok || !settingsRes.ok) {
        const message = apiMessage(shiftBody) || apiMessage(settingsBody) || copy.loadError;
        throw new Error(message);
      }
      const shiftData = unwrap<Shift[]>(shiftBody);
      const settingsData = unwrap<Settings>(settingsBody);
      setShifts(Array.isArray(shiftData) ? shiftData : []);
      setSettings(settingsData ?? null);
      const selected = settingsData?.currencies.find((currency) => currency.code === rate.currencyCode);
      const latest = selected?.exchangeRates[0]?.rateToBase;
      if (latest) setRate((current) => ({ ...current, rateToBase: latest }));
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.loadError);
    } finally {
      setLoading(false);
    }
  }, [copy.loadError, rate.currencyCode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function saveRate() {
    if (saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/cash/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currencyCode: rate.currencyCode, rateToBase: Number(rate.rateToBase) }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(response.status === 401 ? copy.staleSession : body?.message || body?.error || copy.saveError);
      }
      setNotice({ tone: "success", text: copy.saved });
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.saveError;
      setNotice({ tone: "danger", text: message.toLowerCase().includes("stale") ? copy.staleSession : message });
    } finally {
      setSaving(false);
    }
  }

  const stats = useMemo(() => {
    const review = shifts.filter((shift) => shift.status === "REVIEW_REQUIRED").length;
    return {
      open: shifts.filter((shift) => shift.status === "OPEN").length,
      review,
      closed: shifts.filter((shift) => shift.status === "CLOSED" || shift.status === "APPROVED").length,
      shortage: shifts.reduce((sum, shift) => sum + Math.min(0, Number(shift.differenceTotalBase || 0)), 0),
      overage: shifts.reduce((sum, shift) => sum + Math.max(0, Number(shift.differenceTotalBase || 0)), 0),
    };
  }, [shifts]);

  const selectedCurrency = settings?.currencies.find((currency) => currency.code === rate.currencyCode);

  return (
    <AppShell title={copy.title} description={copy.description}>
      {error && <Alert tone="danger" text={error} />}

      <div className="responsive-grid mb-5">
        <Metric icon={Clock3} label={copy.openShifts} value={stats.open} />
        <Metric icon={ShieldAlert} label={copy.reviewRequired} value={stats.review} tone="text-warning" />
        <Metric icon={CheckCircle2} label={copy.closedShifts} value={stats.closed} tone="text-success" />
        <Metric icon={AlertTriangle} label={copy.shortages} value={money(Math.abs(stats.shortage), ar)} tone="text-danger" />
        <Metric icon={Coins} label={copy.overages} value={money(stats.overage, ar)} tone="text-warning" />
      </div>

      <section className="card p-5 mb-5">
        <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-primary">
              <Banknote size={19} />
              <h2 className="font-bold text-lg text-text">{copy.currencySettings}</h2>
            </div>
            <p className="text-sm text-muted mt-1">{copy.currencyHelp}</p>
          </div>
          <label className="min-w-0 xl:w-36">
            <span className="text-xs font-bold block mb-2">{copy.currency}</span>
            <select className="input" value={rate.currencyCode} onChange={(event) => setRate({ currencyCode: event.target.value, rateToBase: currentRate(settings, event.target.value) || rate.rateToBase })}>
              <option>USD</option>
              <option>JOD</option>
            </select>
          </label>
          <label className="min-w-0 xl:w-44">
            <span className="text-xs font-bold block mb-2">{copy.rateToIls}</span>
            <input
              className="input"
              value={rate.rateToBase}
              onChange={(event) => setRate({ ...rate, rateToBase: event.target.value })}
              inputMode="decimal"
            />
          </label>
          <button className="btn-primary h-11 flex items-center justify-center gap-2" onClick={saveRate} disabled={saving}>
            {saving ? <RefreshCw size={17} className="animate-spin" /> : <Save size={17} />}
            {saving ? copy.saving : copy.saveRate}
          </button>
        </div>

        {notice && <Alert tone={notice.tone} text={notice.text} compact />}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-5">
          {loading && <SkeletonCards count={3} />}
          {!loading &&
            settings?.currencies.map((currency) => {
              const latest = currency.exchangeRates[0];
              return (
                <article key={currency.id} className="rounded-lg border border-border p-4 min-w-0">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <b>{currency.code}</b>
                      <p className="text-sm text-muted mt-1 break-anywhere">{ar ? currency.nameAr || currency.name : currency.name}</p>
                    </div>
                    <StatusBadge active={currency.isBase} label={currency.isBase ? copy.base : copy.accepted} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <Info label={copy.currentRate} value={currency.isBase ? "1.000000" : formatRate(latest?.rateToBase)} />
                    <Info label={copy.previousRate} value={formatRate(latest?.previousRate)} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {currency.denominations.map((denomination) => (
                      <span key={denomination.id} className="px-2 py-1 rounded-md bg-background text-xs font-semibold">
                        {denomination.label}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
        </div>
        {!loading && !settings?.currencies.length && <Empty text={copy.noCurrencies} />}

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={18} className="text-primary" />
            <h3 className="font-bold text-sm">{copy.registerHealth}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {settings?.registers.map((register) => (
              <div key={register.id} className="bg-background rounded-lg p-3 text-sm flex flex-wrap justify-between gap-2 min-w-0">
                <span className="break-anywhere">
                  {ar ? register.branch.nameAr || register.branch.name : register.branch.name} · {register.number}
                </span>
                <StatusBadge active={register.active} />
              </div>
            ))}
          </div>
          {!loading && !settings?.registers.length && <Empty text={copy.noRegisters} />}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-lg">{copy.closingReports}</h2>
            <p className="text-sm text-muted mt-1">{copy.closingHelp}</p>
          </div>
          <button className="btn-secondary flex items-center gap-2 self-start sm:self-auto" onClick={refresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {copy.refresh}
          </button>
        </div>
        <div className="table-scroll mobile-hidden-table">
          <table className="w-full text-sm min-w-[920px]">
            <thead className="bg-background text-muted">
              <tr>
                <th className="p-3 text-start">{copy.shift}</th>
                <th className="p-3 text-start">{copy.employee}</th>
                <th className="p-3 text-start">{copy.branch}</th>
                <th className="p-3 text-start">{copy.register}</th>
                <th className="p-3 text-end">{copy.expected}</th>
                <th className="p-3 text-end">{copy.actual}</th>
                <th className="p-3 text-end">{copy.shortage}</th>
                <th className="p-3 text-end">{copy.overage}</th>
                <th className="p-3 text-start">{copy.review}</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="p-8 text-center text-muted" colSpan={9}>
                    {copy.loading}
                  </td>
                </tr>
              )}
              {!loading && !shifts.length && (
                <tr>
                  <td className="p-8 text-center text-muted" colSpan={9}>
                    {copy.noShifts}
                  </td>
                </tr>
              )}
              {!loading && shifts.map((shift) => <ShiftRow key={shift.id} shift={shift} copy={copy} ar={ar} />)}
            </tbody>
          </table>
        </div>
        <div className="mobile-card-list p-3">
          {loading && <p className="p-4 text-center text-muted">{copy.loading}</p>}
          {!loading && !shifts.length && <Empty text={copy.noShifts} />}
          {!loading && shifts.map((shift) => <ShiftCard key={`${shift.id}-card`} shift={shift} copy={copy} ar={ar} />)}
        </div>
      </section>

      {selectedCurrency && (
        <p className="text-xs text-muted mt-4">
          {copy.selectedRate}: {selectedCurrency.code} = {formatRate(selectedCurrency.exchangeRates[0]?.rateToBase)} ILS
        </p>
      )}
    </AppShell>
  );
}

function ShiftRow({ shift, copy, ar }: { shift: Shift; copy: Copy; ar: boolean }) {
  const diff = Number(shift.differenceTotalBase || 0);
  return (
    <tr className="border-t border-border hover:bg-background/60">
      <td className="p-3">
        <b>{shift.shiftNumber}</b>
        <br />
        <small className="text-muted">{statusLabel(shift.status, copy)}</small>
      </td>
      <td className="p-3">{shift.employee.name}</td>
      <td className="p-3">{ar ? shift.branch.nameAr || shift.branch.name : shift.branch.name}</td>
      <td className="p-3">{shift.register.number}</td>
      <td className="p-3 text-end amount">{money(shift.expectedClosingTotalBase, ar)}</td>
      <td className="p-3 text-end amount">{money(shift.actualClosingTotalBase, ar)}</td>
      <td className="p-3 text-end font-bold text-danger amount">{money(Math.abs(Math.min(0, diff)), ar)}</td>
      <td className="p-3 text-end font-bold text-warning amount">{money(Math.max(0, diff), ar)}</td>
      <td className="p-3">
        <StatusBadge active={shift.status !== "REVIEW_REQUIRED"} label={reviewLabel(shift, copy)} />
      </td>
    </tr>
  );
}

function ShiftCard({ shift, copy, ar }: { shift: Shift; copy: Copy; ar: boolean }) {
  const diff = Number(shift.differenceTotalBase || 0);
  return (
    <article className="rounded-xl border border-border bg-background p-4">
      <div className="flex justify-between gap-3">
        <div className="min-w-0">
          <b className="break-anywhere">{shift.shiftNumber}</b>
          <p className="text-xs text-muted mt-1 break-anywhere">
            {shift.employee.name} · {shift.register.number}
          </p>
        </div>
        <StatusBadge active={shift.status !== "REVIEW_REQUIRED"} label={statusLabel(shift.status, copy)} />
      </div>
      <dl className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <Info label={copy.expected} value={money(shift.expectedClosingTotalBase, ar)} />
        <Info label={copy.actual} value={money(shift.actualClosingTotalBase, ar)} />
        <Info label={copy.shortage} value={money(Math.abs(Math.min(0, diff)), ar)} className="text-danger" />
        <Info label={copy.overage} value={money(Math.max(0, diff), ar)} className="text-warning" />
        <Info label={copy.branch} value={ar ? shift.branch.nameAr || shift.branch.name : shift.branch.name} />
        <Info label={copy.review} value={reviewLabel(shift, copy)} />
      </dl>
    </article>
  );
}

function Metric({ icon: Icon, label, value, tone = "" }: { icon: typeof Clock3; label: string; value: string | number; tone?: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">{label}</p>
        <Icon size={18} className="text-muted" />
      </div>
      <b className={`text-2xl mt-2 block ${tone}`}>{value}</b>
    </div>
  );
}

function Info({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted text-xs">{label}</dt>
      <dd className={`font-bold break-anywhere ${className}`}>{value}</dd>
    </div>
  );
}

function Alert({ tone, text, compact = false }: { tone: "success" | "danger"; text: string; compact?: boolean }) {
  return (
    <div className={`${compact ? "mt-4" : "mb-4"} rounded-xl border px-4 py-3 text-sm ${tone === "success" ? "border-success/25 bg-success/10 text-success" : "border-danger/25 bg-danger/10 text-danger"}`}>
      {text}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg bg-background p-4 text-center text-sm text-muted">{text}</p>;
}

function SkeletonCards({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <div key={index} className="rounded-lg border border-border p-4 animate-pulse">
      <div className="h-4 w-24 rounded bg-muted/20" />
      <div className="h-3 w-36 rounded bg-muted/20 mt-3" />
      <div className="h-16 rounded bg-muted/10 mt-5" />
    </div>
  ));
}

function unwrap<T>(payload: ApiEnvelope<T>): T | undefined {
  if (payload && typeof payload === "object" && "success" in payload) return payload.data;
  return payload as T;
}

function apiMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const body = payload as { message?: unknown; error?: unknown };
  return typeof body.message === "string" ? body.message : typeof body.error === "string" ? body.error : "";
}

function money(value: string | number | null | undefined, ar: boolean) {
  const amount = Number(value || 0);
  return `${amount.toLocaleString(ar ? "ar-PS" : "en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ILS`;
}

function formatRate(value?: string | null) {
  if (!value) return "—";
  return Number(value).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function currentRate(settings: Settings | null, currencyCode: string) {
  return formatRate(settings?.currencies.find((currency) => currency.code === currencyCode)?.exchangeRates[0]?.rateToBase);
}

function statusLabel(status: string, copy: Copy) {
  return copy.statuses[status] || status.replaceAll("_", " ");
}

function reviewLabel(shift: Shift, copy: Copy) {
  if (shift.status === "REVIEW_REQUIRED") return copy.needsReview;
  return copy.reviewStatuses[shift.reviewStatus] || shift.reviewStatus?.replaceAll("_", " ") || copy.none;
}

const englishCopy = {
  title: "Cash Register and Shift Management",
  description: "Monitor cash drawers, closing reports, exchange rates, denominations, and manager reviews.",
  openShifts: "Open shifts",
  reviewRequired: "Review required",
  closedShifts: "Closed shifts",
  shortages: "Shortages",
  overages: "Overages",
  currencySettings: "Cash and Currency Settings",
  currencyHelp: "Base currency is ILS. Managers can update fixed USD/JOD rates; every change is saved in history.",
  currency: "Currency",
  rateToIls: "Rate to ILS",
  saveRate: "Save rate",
  saving: "Saving...",
  saved: "Exchange rate saved.",
  staleSession: "Your session is stale. Please sign in again.",
  saveError: "The exchange rate could not be saved.",
  loadError: "Cash data could not be loaded.",
  base: "Base",
  accepted: "Accepted",
  currentRate: "Current rate",
  previousRate: "Previous rate",
  registers: "Registers",
  registerHealth: "Register Health",
  closingReports: "Shift Closing and Review",
  closingHelp: "Shortage and overage are shown separately. Any non-zero discrepancy requires manager review.",
  refresh: "Refresh",
  loading: "Loading cash data...",
  noShifts: "No shifts found.",
  noCurrencies: "No currencies configured.",
  noRegisters: "No registers configured.",
  shift: "Shift",
  employee: "Employee",
  branch: "Branch",
  register: "Register",
  expected: "Expected",
  actual: "Actual",
  shortage: "Shortage",
  overage: "Overage",
  review: "Review",
  needsReview: "Needs review",
  none: "None",
  selectedRate: "Selected rate",
  statuses: {
    OPEN: "Open",
    CLOSING_PENDING: "Closing pending",
    CLOSED: "Closed",
    REVIEW_REQUIRED: "Review required",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    FORCE_CLOSED: "Force closed",
  } as Record<string, string>,
  reviewStatuses: {
    NEW: "New",
    PENDING_REVIEW: "Pending review",
    REVIEWED: "Reviewed",
    MATCHED: "Matched",
    SHORTAGE_UNDER_INVESTIGATION: "Under investigation",
    ACCEPTED_DIFFERENCE: "Accepted difference",
    PERMANENTLY_CLOSED: "Permanently closed",
  } as Record<string, string>,
};

const arabicCopy: typeof englishCopy = {
  title: "إدارة الصندوق والورديات",
  description: "متابعة أدراج النقد، تقارير الإغلاق، أسعار الصرف، الفئات النقدية، ومراجعات المدير.",
  openShifts: "ورديات مفتوحة",
  reviewRequired: "بحاجة لمراجعة",
  closedShifts: "ورديات مغلقة",
  shortages: "العجز",
  overages: "الزيادة",
  currencySettings: "إعدادات النقد والعملات",
  currencyHelp: "العملة الأساسية هي الشيكل. يمكن للمدير تحديث أسعار الدولار والدينار، ويتم حفظ كل تغيير في السجل.",
  currency: "العملة",
  rateToIls: "السعر مقابل الشيكل",
  saveRate: "حفظ السعر",
  saving: "جارٍ الحفظ...",
  saved: "تم حفظ سعر الصرف.",
  staleSession: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.",
  saveError: "تعذر حفظ سعر الصرف.",
  loadError: "تعذر تحميل بيانات الصندوق.",
  base: "أساسية",
  accepted: "معتمدة",
  currentRate: "السعر الحالي",
  previousRate: "السعر السابق",
  registers: "الصناديق",
  registerHealth: "حالة الصناديق",
  closingReports: "إغلاق الورديات والمراجعة",
  closingHelp: "يتم عرض العجز والزيادة بشكل منفصل. أي فرق غير صفري يتطلب مراجعة المدير.",
  refresh: "تحديث",
  loading: "جارٍ تحميل بيانات الصندوق...",
  noShifts: "لا توجد ورديات.",
  noCurrencies: "لا توجد عملات معرفة.",
  noRegisters: "لا توجد صناديق معرفة.",
  shift: "الوردية",
  employee: "الموظف",
  branch: "الفرع",
  register: "الصندوق",
  expected: "المتوقع",
  actual: "الفعلي",
  shortage: "العجز",
  overage: "الزيادة",
  review: "المراجعة",
  needsReview: "تحتاج مراجعة",
  none: "لا يوجد",
  selectedRate: "السعر المحدد",
  statuses: {
    OPEN: "مفتوحة",
    CLOSING_PENDING: "الإغلاق قيد المعالجة",
    CLOSED: "مغلقة",
    REVIEW_REQUIRED: "بحاجة لمراجعة",
    APPROVED: "معتمدة",
    REJECTED: "مرفوضة",
    FORCE_CLOSED: "مغلقة إجبارياً",
  },
  reviewStatuses: {
    NEW: "جديد",
    PENDING_REVIEW: "بانتظار المراجعة",
    REVIEWED: "تمت المراجعة",
    MATCHED: "مطابقة",
    SHORTAGE_UNDER_INVESTIGATION: "العجز قيد التحقيق",
    ACCEPTED_DIFFERENCE: "تم قبول الفرق",
    PERMANENTLY_CLOSED: "مغلقة نهائياً",
  },
};

type Copy = typeof englishCopy;
