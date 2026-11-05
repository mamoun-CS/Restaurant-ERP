"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCheck,
  Download,
  FileSpreadsheet,
  Plus,
  Receipt,
  Save,
  UsersRound,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useLanguage } from "@/components/language-provider";
import { money } from "@/components/finance-page";

const tx = {
  en: {
    expenses: "Expenses",
    expenseSub: "Record and review day-to-day restaurant spending.",
    addExpense: "Add expense",
    title: "Expense title",
    amount: "Amount",
    category: "Category",
    date: "Payment date",
    recurrence: "Recurrence",
    notes: "Notes (optional)",
    attachment: "Invoice attachment (optional)",
    save: "Save expense",
    cancel: "Cancel",
    history: "Expense history",
    one: "One-time",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    payroll: "Payroll",
    payrollSub: "Prepare and pay your team without entering salaries twice.",
    generate: "Generate monthly payroll",
    approve: "Approve all salaries",
    paid: "Mark all as paid",
    employee: "Employee",
    base: "Base salary",
    overtime: "Overtime",
    bonuses: "Bonuses",
    deductions: "Deductions",
    advances: "Advances",
    net: "Net salary",
    status: "Payment status",
    paymentDate: "Payment date",
    month: "Payroll month",
    unpaid: "Unpaid",
    partial: "Partially paid",
    paidStatus: "Paid",
    emptyPayroll: "No payroll has been generated for this month.",
    emptyExpense: "No expenses recorded yet.",
    saveSalary: "Save salary",
    confirmPaid:
      "Mark every salary as paid? This will create salary expenses automatically.",
  },
  ar: {
    expenses: "المصروفات",
    expenseSub: "سجّل مصروفات المطعم اليومية وراجعها بسهولة.",
    addExpense: "إضافة مصروف",
    title: "عنوان المصروف",
    amount: "المبلغ",
    category: "التصنيف",
    date: "تاريخ الدفع",
    recurrence: "التكرار",
    notes: "ملاحظات (اختياري)",
    attachment: "مرفق الفاتورة (اختياري)",
    save: "حفظ المصروف",
    cancel: "إلغاء",
    history: "سجل المصروفات",
    one: "مرة واحدة",
    daily: "يومي",
    weekly: "أسبوعي",
    monthly: "شهري",
    payroll: "الرواتب",
    payrollSub: "جهّز رواتب الفريق وادفعها دون إدخالها مرتين.",
    generate: "إنشاء رواتب الشهر",
    approve: "اعتماد كل الرواتب",
    paid: "تحديد الكل كمدفوع",
    employee: "الموظف",
    base: "الراتب الأساسي",
    overtime: "العمل الإضافي",
    bonuses: "المكافآت",
    deductions: "الخصومات",
    advances: "السلف",
    net: "صافي الراتب",
    status: "حالة الدفع",
    paymentDate: "تاريخ الدفع",
    month: "شهر الرواتب",
    unpaid: "غير مدفوع",
    partial: "مدفوع جزئياً",
    paidStatus: "مدفوع",
    emptyPayroll: "لم يتم إنشاء رواتب لهذا الشهر بعد.",
    emptyExpense: "لا توجد مصروفات مسجلة بعد.",
    saveSalary: "حفظ الراتب",
    confirmPaid:
      "هل تريد تحديد كل الرواتب كمدفوعة؟ سيتم إنشاء مصروف الرواتب تلقائياً.",
  },
};
const cats = [
  "RENT",
  "SALARIES",
  "ELECTRICITY",
  "WATER",
  "INTERNET",
  "MAINTENANCE",
  "MARKETING",
  "DELIVERY",
  "EQUIPMENT",
  "OTHER",
];
export function ExpensesPage() {
  const { locale } = useLanguage(),
    c = tx[locale],
    search = useSearchParams();
  const [open, setOpen] = useState(search.get("create") === "1"),
    [items, setItems] = useState<any[]>([]),
    [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "OTHER",
    expenseDate: new Date().toISOString().slice(0, 10),
    frequency: "ONE_TIME",
    notes: "",
    invoiceName: "",
  });
  const load = () =>
    fetch("/api/finance/expenses")
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems);
  useEffect(() => {
    load();
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/finance/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    setBusy(false);
    if (r.ok) {
      setOpen(false);
      setForm({ ...form, title: "", amount: "", notes: "", invoiceName: "" });
      load();
    }
  }
  return (
    <AppShell
      title={c.expenses}
      description={c.expenseSub}
      action={
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setOpen(true)}
        >
          <Plus size={18} />
          {c.addExpense}
        </button>
      }
    >
      <section className="card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-bold text-lg">{c.history}</h2>
        </div>
        {items.length ? (
          <div className="overflow-x-auto">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>{c.date}</th>
                  <th>{c.title}</th>
                  <th>{c.category}</th>
                  <th>{c.recurrence}</th>
                  <th>{c.amount}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.id}>
                    <td>
                      {new Date(x.expenseDate).toLocaleDateString(locale)}
                    </td>
                    <td>
                      <b>{x.title}</b>
                      {x.notes && <small>{x.notes}</small>}
                    </td>
                    <td>{expenseCategory(x.category, locale)}</td>
                    <td>{frequencyLabel(x.frequency, locale)}</td>
                    <td className="amount expense">
                      {money(Number(x.amount), locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={Receipt} text={c.emptyExpense} />
        )}
      </section>
      {open && (
        <Modal title={c.addExpense} close={() => setOpen(false)}>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <Input label={c.title}>
              <input
                required
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Input>
            <Input label={c.amount}>
              <input
                required
                min="0.01"
                step=".01"
                type="number"
                className="input"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </Input>
            <Input label={c.category}>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {cats.map((x) => (
                  <option key={x} value={x}>
                    {expenseCategory(x, locale)}
                  </option>
                ))}
              </select>
            </Input>
            <Input label={c.date}>
              <input
                required
                type="date"
                className="input"
                value={form.expenseDate}
                onChange={(e) =>
                  setForm({ ...form, expenseDate: e.target.value })
                }
              />
            </Input>
            <Input label={c.recurrence}>
              <select
                className="input"
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value })
                }
              >
                <option value="ONE_TIME">{c.one}</option>
                <option value="DAILY">{c.daily}</option>
                <option value="WEEKLY">{c.weekly}</option>
                <option value="MONTHLY">{c.monthly}</option>
              </select>
            </Input>
            <Input label={c.attachment}>
              <label className="input flex items-center cursor-pointer"><Receipt size={17} className="me-2 text-primary"/><span>{form.invoiceName || (locale === "ar" ? "اختيار ملف الفاتورة" : "Choose invoice file")}</span><input type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => setForm({ ...form, invoiceName: e.target.files?.[0]?.name || "" })}/></label>
              <small className="text-muted block mt-1">{locale === "ar" ? "يُحفظ اسم الملف فقط؛ لم يتم إعداد تخزين الملفات." : "Only file metadata is recorded; file storage is not configured."}</small>
            </Input>
            <Input label={c.notes} wide>
              <textarea
                className="input !h-24 py-3 resize-none"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Input>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setOpen(false)}
              >
                {c.cancel}
              </button>
              <button
                disabled={busy}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={18} />
                {c.save}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  );
}

export function PayrollPage() {
  const { locale } = useLanguage(),
    c = tx[locale];
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)),
    [rows, setRows] = useState<any[]>([]),
    [busy, setBusy] = useState(false);
  const [pendingPay, setPendingPay] = useState(false);
  const load = () =>
    fetch(`/api/finance/payroll?month=${month}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setRows);
  useEffect(() => {
    load();
  }, [month]);
  async function act(action: string) {
    if (action === "pay") { setPendingPay(true); return; }
    setBusy(true);
    await fetch("/api/finance/payroll/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, month }),
    });
    setBusy(false);
    load();
  }
  async function confirmPay() {
    if (pendingPay) {
      setPendingPay(false);
      setBusy(true);
      await fetch("/api/finance/payroll/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pay", month }),
      });
      setBusy(false);
      load();
    }
  }
  return (
    <AppShell
      title={c.payroll}
      description={c.payrollSub}
      action={
        <button
          disabled={busy}
          onClick={() => act("generate")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          {c.generate}
        </button>
      }
    >
      <section className="card p-4 flex flex-wrap gap-3 items-end mb-5">
        <Input label={c.month}>
          <input
            type="month"
            className="input"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </Input>
        <div className="ms-auto flex flex-wrap gap-2">
          <button
            disabled={!rows.length || busy}
            onClick={() => act("approve")}
            className="btn-secondary flex items-center gap-2"
          >
            <CheckCheck size={18} />
            {c.approve}
          </button>
          <button
            disabled={!rows.length || busy}
            onClick={() => act("pay")}
            className="btn-secondary flex items-center gap-2"
          >
            <Receipt size={18} />
            {c.paid}
          </button>
          <a
            className="btn-secondary flex items-center gap-2"
            href={`/api/finance/payroll/export?month=${month}&format=pdf`}
          >
            <Download size={18} />
            PDF
          </a>
          <a
            className="btn-secondary flex items-center gap-2"
            href={`/api/finance/payroll/export?month=${month}&format=csv`}
          >
            <FileSpreadsheet size={18} />
            Excel
          </a>
        </div>
      </section>
      <section className="card overflow-hidden">
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="finance-table min-w-[1100px]">
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
                    c.paymentDate,
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <b>{x.employee.name}</b>
                    </td>
                    {[
                      "baseSalary",
                      "overtime",
                      "bonuses",
                      "deductions",
                      "advances",
                      "netSalary",
                    ].map((k) => (
                      <td key={k}>{money(Number(x[k]), locale)}</td>
                    ))}
                    <td>
                      <span className={`status ${x.status.toLowerCase()}`}>
                        {x.status === "PAID"
                          ? c.paidStatus
                          : x.status === "PARTIALLY_PAID"
                            ? c.partial
                            : c.unpaid}
                      </span>
                    </td>
                    <td>
                      {x.paymentDate
                        ? new Date(x.paymentDate).toLocaleDateString(locale)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={UsersRound} text={c.emptyPayroll} />
        )}
      </section>
      <ConfirmDialog
        open={pendingPay}
        title={locale === "ar" ? "تأكيد الدفع" : "Confirm payment"}
        description={locale === "ar"
          ? "هل تريد تحديد كل الرواتب كمدفوعة؟ سيتم إنشاء مصروف الرواتب تلقائياً."
          : "Mark every salary as paid? This will create salary expenses automatically."}
        loading={busy}
        onConfirm={()=>void confirmPay()}
        onClose={()=>setPendingPay(false)}
      />
    </AppShell>
  );
}

export function SimpleFinancePage({
  kind,
}: {
  kind: "ingredients" | "profit" | "reports";
}) {
  const { locale } = useLanguage();
  const names = {
    ingredients: {
      en: [
        "Ingredient purchases",
        "Keep purchasing separate from financial analytics.",
      ],
      ar: ["مشتريات المكونات", "احتفظ بالمشتريات منفصلة عن التحليلات المالية."],
    },
    profit: {
      en: [
        "Profit and loss",
        "A plain-language statement of restaurant performance.",
      ],
      ar: ["الأرباح والخسائر", "قائمة مبسطة لأداء المطعم."],
    },
    reports: {
      en: ["Financial reports", "Download and share finance records."],
      ar: ["التقارير المالية", "نزّل السجلات المالية وشاركها."],
    },
  }[kind][locale];
  return (
    <AppShell title={names[0]} description={names[1]}>
      <div className="card p-10 text-center">
        <Receipt className="mx-auto text-primary" size={32} />
        <h2 className="font-bold text-lg mt-4">{names[0]}</h2>
        <p className="text-muted mt-2">{names[1]}</p>
      </div>
    </AppShell>
  );
}
function Input({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "sm:col-span-2" : ""}>
      <span className="block text-sm font-semibold mb-1.5">{label}</span>
      {children}
    </label>
  );
}
function Modal({
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
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="bg-surface w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-2xl shadow-2xl"
      >
        <header className="p-5 border-b border-border flex items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={close}
            className="ms-auto size-11 grid place-items-center rounded-xl hover:bg-background"
          >
            <X />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
function Empty({ icon: Icon, text }: { icon: typeof Receipt; text: string }) {
  return (
    <div className="p-12 text-center text-muted">
      <span className="size-14 rounded-2xl bg-primary-soft text-primary grid place-items-center mx-auto">
        <Icon />
      </span>
      <p className="mt-4">{text}</p>
    </div>
  );
}
function expenseCategory(value:string,locale:string){const m:Record<string,[string,string]>={RENT:["Rent","الإيجار"],SALARIES:["Employee salaries","رواتب الموظفين"],ELECTRICITY:["Electricity","الكهرباء"],WATER:["Water","المياه"],INTERNET:["Internet","الإنترنت"],MAINTENANCE:["Maintenance","الصيانة"],MARKETING:["Marketing","التسويق"],DELIVERY:["Delivery","التوصيل"],EQUIPMENT:["Equipment","المعدات"],OTHER:["Other","أخرى"]};return (m[value]||[value,value])[locale==="ar"?1:0]}
function frequencyLabel(value:string,locale:string){const m:Record<string,[string,string]>={ONE_TIME:["One-time","مرة واحدة"],DAILY:["Daily","يومي"],WEEKLY:["Weekly","أسبوعي"],MONTHLY:["Monthly","شهري"]};return (m[value]||[value,value])[locale==="ar"?1:0]}
