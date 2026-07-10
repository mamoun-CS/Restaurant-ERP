"use client";
/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Download,
  Edit3,
  FileSpreadsheet,
  Plus,
  Receipt,
  Save,
  ShoppingBasket,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useLanguage } from "@/components/language-provider";
import { money } from "@/components/finance-page";

type Payroll = {
  id: string;
  employee: { id: string; name: string };
  baseSalary: number | string;
  overtime: number | string;
  bonuses: number | string;
  deductions: number | string;
  advances: number | string;
  netSalary: number | string;
  amountPaid: number | string;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  approved: boolean;
  paymentDate?: string;
};
type Employee = { id: string; name: string; baseSalary?: number | string };
const pcopy = {
  en: {
    title: "Payroll",
    sub: "Prepare and pay your team without entering salaries twice.",
    generate: "Generate monthly payroll",
    add: "Add salary",
    approve: "Approve all",
    payAll: "Mark all paid",
    employee: "Employee",
    base: "Base salary",
    overtime: "Overtime",
    bonuses: "Bonuses",
    deductions: "Deductions",
    advances: "Advances",
    net: "Net salary",
    paidAmount: "Amount paid",
    status: "Payment status",
    date: "Payment date",
    month: "Payroll month",
    approval: "Approval",
    approved: "Approved",
    pending: "Pending",
    unpaid: "Unpaid",
    partial: "Partially paid",
    paid: "Paid",
    edit: "Edit salary",
    save: "Save salary",
    choose: "Choose employee",
    empty: "Generate payroll to begin preparing this month’s salaries.",
    confirm: "Mark every salary as paid and create salary expenses?",
    pdf: "PDF report",
    excel: "Excel file",
  },
  ar: {
    title: "الرواتب",
    sub: "جهّز رواتب الفريق وادفعها دون إدخالها مرتين.",
    generate: "إنشاء رواتب الشهر",
    add: "إضافة راتب",
    approve: "اعتماد الكل",
    payAll: "تحديد الكل كمدفوع",
    employee: "الموظف",
    base: "الراتب الأساسي",
    overtime: "العمل الإضافي",
    bonuses: "المكافآت",
    deductions: "الخصومات",
    advances: "السلف",
    net: "صافي الراتب",
    paidAmount: "المبلغ المدفوع",
    status: "حالة الدفع",
    date: "تاريخ الدفع",
    month: "شهر الرواتب",
    approval: "الاعتماد",
    approved: "معتمد",
    pending: "بانتظار الاعتماد",
    unpaid: "غير مدفوع",
    partial: "مدفوع جزئياً",
    paid: "مدفوع",
    edit: "تعديل الراتب",
    save: "حفظ الراتب",
    choose: "اختر الموظف",
    empty: "أنشئ رواتب الشهر لبدء إعداد رواتب الفريق.",
    confirm: "هل تريد تحديد كل الرواتب كمدفوعة وإنشاء مصروفات الرواتب؟",
    pdf: "تقرير بي دي إف",
    excel: "ملف إكسل",
  },
};
export function CompletePayroll() {
  const { locale } = useLanguage(),
    c = pcopy[locale],
    search = useSearchParams();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)),
    [rows, setRows] = useState<Payroll[]>([]),
    [employees, setEmployees] = useState<Employee[]>([]),
    [editing, setEditing] = useState<
      (Partial<Payroll> & { employeeId?: string }) | null
    >(null),
    [busy, setBusy] = useState(false);
  const load = () =>
    fetch(`/api/finance/payroll?month=${month}`)
      .then((r) => r.json())
      .then(setRows);
  useEffect(() => {
    load();
    fetch("/api/employees")
      .then((r) => r.json())
      .then(setEmployees);
    if (search.get("create") === "1")
      setEditing({
        employeeId: "",
        baseSalary: 0,
        overtime: 0,
        bonuses: 0,
        deductions: 0,
        advances: 0,
        amountPaid: 0,
        status: "UNPAID",
      });
  }, [month]);
  const net = useMemo(
    () =>
      Number(editing?.baseSalary || 0) +
      Number(editing?.overtime || 0) +
      Number(editing?.bonuses || 0) -
      Number(editing?.deductions || 0) -
      Number(editing?.advances || 0),
    [editing],
  );
  async function bulk(action: string) {
    if (action === "pay" && !confirm(c.confirm)) return;
    setBusy(true);
    await fetch("/api/finance/payroll/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, month }),
    });
    setBusy(false);
    load();
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const current = editing;
    if (!current.id) {
      setBusy(true);
      await fetch("/api/finance/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: current.employeeId, month, baseSalary: Number(current.baseSalary), overtime: Number(current.overtime), bonuses: Number(current.bonuses), deductions: Number(current.deductions), advances: Number(current.advances) }),
      });
      setBusy(false);
      setEditing(null);
      load();
      return;
    }
    setBusy(true);
    await fetch("/api/finance/payroll", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing.id,
        baseSalary: Number(editing.baseSalary),
        overtime: Number(editing.overtime),
        bonuses: Number(editing.bonuses),
        deductions: Number(editing.deductions),
        advances: Number(editing.advances),
        amountPaid: Number(editing.amountPaid),
        status: editing.status,
        paymentDate: editing.paymentDate || null,
      }),
    });
    setBusy(false);
    setEditing(null);
    load();
  }
  const val = (k: keyof Payroll, v: string) =>
    setEditing((x) => ({ ...x, [k]: v }));
  return (
    <AppShell title={c.title} description={c.sub}>
      <div className="mobile-primary-actions">
        <button
          className="btn-primary flex gap-2 items-center"
          onClick={() => bulk("generate")}
        >
          <Plus size={18} />
          {c.generate}
        </button>
        <button
          className="btn-secondary flex gap-2 items-center"
          onClick={() =>
            setEditing({
              employeeId: "",
              baseSalary: 0,
              overtime: 0,
              bonuses: 0,
              deductions: 0,
              advances: 0,
              amountPaid: 0,
              status: "UNPAID",
            })
          }
        >
          <Plus size={18} />
          {c.add}
        </button>
      </div>
      <section className="card p-4 flex flex-wrap gap-3 items-end mb-5">
        <Label text={c.month}>
          <input
            className="input"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </Label>
        <div className="ms-auto flex flex-wrap gap-2">
          <button
            disabled={!rows.length || busy}
            className="btn-secondary"
            onClick={() => bulk("approve")}
          >
            {c.approve}
          </button>
          <button
            disabled={!rows.length || busy}
            className="btn-secondary"
            onClick={() => bulk("pay")}
          >
            {c.payAll}
          </button>
          <a
            className="btn-secondary flex items-center gap-2"
            href={`/api/finance/payroll/export?month=${month}&format=pdf&locale=${locale}`}
          >
            <Download size={17} />
            {c.pdf}
          </a>
          <a
            className="btn-secondary flex items-center gap-2"
            href={`/api/finance/payroll/export?month=${month}&format=xlsx&locale=${locale}`}
          >
            <FileSpreadsheet size={17} />
            {c.excel}
          </a>
        </div>
      </section>
      {rows.length ? (
        <>
          <div className="payroll-cards">
            {rows.map((r) => (
              <article className="card p-4" key={r.id}>
                <div className="flex justify-between">
                  <b>{r.employee.name}</b>
                  <button onClick={() => setEditing(r)} aria-label={c.edit}>
                    <Edit3 size={18} />
                  </button>
                </div>
                <dl>
                  <div>
                    <dt>{c.net}</dt>
                    <dd>{money(Number(r.netSalary), locale)}</dd>
                  </div>
                  <div>
                    <dt>{c.status}</dt>
                    <dd>{statusLabel(r.status, c)}</dd>
                  </div>
                  <div>
                    <dt>{c.approval}</dt>
                    <dd>{r.approved ? c.approved : c.pending}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <div className="card overflow-x-auto payroll-table">
            <table className="finance-table min-w-[1150px]">
              <thead>
                <tr>
                  {[
                    c.employee,
                    c.base,
                    c.overtime,
                    c.bonuses,
                    c.deductions,
                    c.advances,
                    c.net,
                    c.status,
                    c.approval,
                    c.edit,
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <b>{r.employee.name}</b>
                    </td>
                    {[
                      r.baseSalary,
                      r.overtime,
                      r.bonuses,
                      r.deductions,
                      r.advances,
                      r.netSalary,
                    ].map((x, i) => (
                      <td key={i}>{money(Number(x), locale)}</td>
                    ))}
                    <td>{statusLabel(r.status, c)}</td>
                    <td>{r.approved ? c.approved : c.pending}</td>
                    <td>
                      <button
                        className="btn-secondary !min-h-9"
                        onClick={() => setEditing(r)}
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="card p-12 text-center text-muted">{c.empty}</div>
      )}
      {editing && (
        <Dialog title={c.edit} close={() => setEditing(null)}>
          <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
            {!editing.id && (
              <Label text={c.employee} wide>
                <select
                  required
                  className="input"
                  value={editing.employeeId}
                  onChange={(e) =>
                    setEditing({ ...editing, employeeId: e.target.value })
                  }
                >
                  <option value="">{c.choose}</option>
                  {employees.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </Label>
            )}
            {(
              [
                "baseSalary",
                "overtime",
                "bonuses",
                "deductions",
                "advances",
              ] as const
            ).map((k, i) => (
              <Label
                key={k}
                text={
                  [c.base, c.overtime, c.bonuses, c.deductions, c.advances][i]
                }
              >
                <input
                  className="input"
                  type="number"
                  min="0"
                  step=".01"
                  value={editing[k] || 0}
                  onChange={(e) => val(k, e.target.value)}
                />
              </Label>
            ))}
            <Label text={c.net}>
              <output className="input flex items-center font-bold bg-background">
                {money(net, locale)}
              </output>
            </Label>
            <Label text={c.status}>
              <select
                className="input"
                value={editing.status}
                onChange={(e) => val("status", e.target.value)}
              >
                <option value="UNPAID">{c.unpaid}</option>
                <option value="PARTIALLY_PAID">{c.partial}</option>
                <option value="PAID">{c.paid}</option>
              </select>
            </Label>
            {editing.status === "PARTIALLY_PAID" && (
              <Label text={c.paidAmount}>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max={net}
                  value={editing.amountPaid || 0}
                  onChange={(e) => val("amountPaid", e.target.value)}
                />
              </Label>
            )}
            <Label text={c.date}>
              <input
                className="input"
                type="date"
                value={editing.paymentDate?.slice(0, 10) || ""}
                onChange={(e) => val("paymentDate", e.target.value)}
              />
            </Label>
            <div className="modal-actions">
              <button
                disabled={busy}
                className="btn-primary flex gap-2 items-center"
              >
                <Save size={17} />
                {c.save}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </AppShell>
  );
}

type Ingredient = {
  id: string;
  nameEn: string;
  nameAr: string;
  unit: string;
  purchaseQty: number | string;
  purchaseCost: number | string;
  unitCost: number | string;
  updatedAt: string;
};
export function IngredientPurchases() {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const [items, setItems] = useState<Ingredient[]>([]),
    [open, setOpen] = useState(useSearchParams().get("create") === "1"),
    [form, setForm] = useState({
      nameEn: "",
      nameAr: "",
      unit: "kg",
      purchaseQty: "",
      purchaseCost: "",
    });
  const load = () =>
    fetch("/api/finance/ingredients")
      .then((r) => r.json())
      .then(setItems);
  useEffect(() => { void load(); }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/finance/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        purchaseQty: Number(form.purchaseQty),
        purchaseCost: Number(form.purchaseCost),
      }),
    });
    if (r.ok) {
      setOpen(false);
      load();
    }
  }
  return (
    <AppShell
      title={ar ? "مشتريات المكونات" : "Ingredient purchases"}
      description={
        ar
          ? "سجّل تكلفة وكميات المكونات في مكان واحد."
          : "Record ingredient quantities and costs in one focused place."
      }
    >
      <button
        className="btn-primary mb-5 flex gap-2 items-center"
        onClick={() => setOpen(true)}
      >
        <Plus size={18} />
        {ar ? "إضافة عملية شراء" : "Add ingredient purchase"}
      </button>
      <div className="responsive-records">
        {items.map((x) => (
          <article className="card p-4" key={x.id}>
            <div className="flex justify-between">
              <b>{ar ? x.nameAr : x.nameEn}</b>
              <ShoppingBasket className="text-primary" size={19} />
            </div>
            <p className="text-muted mt-2">
              {Number(x.purchaseQty)} {x.unit} ·{" "}
              {money(Number(x.purchaseCost), locale)}
            </p>
            <small>
              {ar ? "تكلفة الوحدة" : "Unit cost"}:{" "}
              {money(Number(x.unitCost), locale)}
            </small>
          </article>
        ))}
      </div>
      {open && (
        <Dialog
          title={ar ? "إضافة شراء مكونات" : "Add ingredient purchase"}
          close={() => setOpen(false)}
        >
          <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
            <Label text={ar ? "اسم المكوّن" : "Ingredient name"}>
              <input
                required
                className="input"
                value={ar ? form.nameAr : form.nameEn}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [ar ? "nameAr" : "nameEn"]: e.target.value,
                  })
                }
              />
            </Label>
            <Label
              text={
                ar
                  ? "الاسم بلغة النظام الأخرى"
                  : "Name in other system language"
              }
            >
              <input
                required
                className="input"
                value={ar ? form.nameEn : form.nameAr}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [ar ? "nameEn" : "nameAr"]: e.target.value,
                  })
                }
              />
            </Label>
            <Label text={ar ? "الوحدة" : "Unit"}>
              <select
                className="input"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option value="kg">{ar ? "كيلوغرام" : "Kilogram"}</option>
                <option value="l">{ar ? "لتر" : "Liter"}</option>
                <option value="unit">{ar ? "قطعة" : "Unit"}</option>
              </select>
            </Label>
            <Label text={ar ? "الكمية" : "Quantity"}>
              <input
                required
                className="input"
                type="number"
                min=".0001"
                step=".0001"
                value={form.purchaseQty}
                onChange={(e) =>
                  setForm({ ...form, purchaseQty: e.target.value })
                }
              />
            </Label>
            <Label text={ar ? "إجمالي التكلفة" : "Total cost"} wide>
              <input
                required
                className="input"
                type="number"
                min=".01"
                step=".01"
                value={form.purchaseCost}
                onChange={(e) =>
                  setForm({ ...form, purchaseCost: e.target.value })
                }
              />
            </Label>
            <div className="modal-actions">
              <button className="btn-primary">
                {ar ? "حفظ عملية الشراء" : "Save purchase"}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </AppShell>
  );
}

export function ProfitLoss() {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(false),
    [from, setFrom] = useState(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .slice(0, 10),
    ),
    [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  useEffect(() => {
    setError(false);
    fetch(`/api/finance/summary?from=${from}&to=${to}`)
      .then(async r => { if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setData).catch(()=>{setData(null);setError(true)});
  }, [from, to]);
  const rows = data
    ? [
        { l: ar ? "الإيرادات" : "Revenue", v: data.totals.revenue },
        {
          l: ar ? "تكلفة البضاعة المباعة" : "Cost of goods sold",
          v: -data.totals.cogs,
        },
        {
          l: ar ? "إجمالي الربح" : "Gross profit",
          v: data.totals.grossProfit,
          b: true,
        },
        {
          l: ar ? "المصروفات التشغيلية" : "Operating expenses",
          v: -data.totals.operatingExpenses,
        },
        {
          l: ar ? "صافي الربح" : "Net profit",
          v: data.totals.netProfit,
          b: true,
        },
      ]
    : [];
  return (
    <AppShell
      title={ar ? "الأرباح والخسائر" : "Profit and loss"}
      description={
        ar
          ? "قائمة مالية واضحة بلغة تشغيلية بسيطة."
          : "A clear statement in simple operational language."
      }
    >
      <div className="card p-4 pnl-filters mb-5">
        <Label text={ar ? "من" : "From"}>
          <input
            className="input"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Label>
        <Label text={ar ? "إلى" : "To"}>
          <input
            className="input"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </Label>
      </div>
      <div className="card p-5 max-w-3xl">
        {error&&<div className="text-danger text-center p-6"><b>{ar?"تعذر تحميل القائمة المالية":"Could not load the statement"}</b><p className="text-muted mt-2">{ar?"تحقق من الاتصال ثم غيّر الفترة للمحاولة مجدداً.":"Check the connection, then change the date range to retry."}</p></div>}
        <div className="pnl-lines">
          {rows.map((x) => (
            <div className={x.b ? "total" : ""} key={x.l}>
              <span>{x.l}</span>
              <strong>{money(x.v, locale)}</strong>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export function FinanceReports() {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const reports = [
    {
      title: ar ? "ملخص الإدارة المالية" : "Financial summary",
      desc: ar
        ? "الإيرادات والتكاليف والأرباح للفترة المحددة."
        : "Revenue, costs, and profit for the selected period.",
      href: "/api/finance/reports?format=xlsx",
    },
    {
      title: ar ? "تقرير الرواتب" : "Payroll report",
      desc: ar
        ? "سجل رواتب الشهر وحالة كل دفعة."
        : "Monthly salaries and payment statuses.",
      href: `/api/finance/payroll/export?month=${new Date().toISOString().slice(0, 7)}&format=xlsx&locale=${locale}`,
    },
    {
      title: ar ? "تقرير المصروفات" : "Expense report",
      desc: ar
        ? "سجل المصروفات التشغيلية حسب التاريخ."
        : "Operating expense history by date.",
      href: "/api/finance/reports?format=csv",
    },
  ];
  return (
    <AppShell
      title={ar ? "التقارير المالية" : "Financial reports"}
      description={
        ar
          ? "تقارير واضحة جاهزة للتنزيل والمشاركة."
          : "Clear reports ready to download and share."
      }
    >
      <div className="report-list">
        {reports.map((r) => (
          <article className="card p-5" key={r.title}>
            <span className="size-11 bg-primary-soft text-primary grid place-items-center rounded-xl">
              <Receipt />
            </span>
            <div>
              <h2 className="font-bold">{r.title}</h2>
              <p className="text-muted text-sm mt-1">{r.desc}</p>
            </div>
            <a
              href={r.href}
              className="btn-secondary ms-auto flex items-center gap-2"
            >
              <Download size={17} />
              {ar ? "تنزيل" : "Download"}
            </a>
          </article>
        ))}
      </div>
    </AppShell>
  );
}

function Label({
  text,
  children,
  wide,
}: {
  text: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "sm:col-span-2" : ""}>
      <span className="block text-sm font-semibold mb-1.5">{text}</span>
      {children}
    </label>
  );
}
function Dialog({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/45 z-50 p-3 grid place-items-center"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="bg-surface w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-2xl shadow-2xl"
      >
        <header className="sticky top-0 bg-surface z-10 p-5 border-b border-border flex">
          <h2 className="text-xl font-bold">{title}</h2>
          <button className="ms-auto" onClick={close}>
            <X />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
function statusLabel(s: Payroll["status"], c: typeof pcopy.en) {
  return s === "PAID" ? c.paid : s === "PARTIALLY_PAID" ? c.partial : c.unpaid;
}
