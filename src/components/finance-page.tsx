"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownLeft,
  CalendarDays,
  Coins,
  Plus,
  Receipt,
  ShoppingBasket,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useLanguage } from "@/components/language-provider";

type Summary = {
  totals: {
    revenue: number;
    cogs: number;
    operatingExpenses: number;
    grossProfit: number;
    netProfit: number;
  };
  byDay: { period: string; revenue: number; cogs: number; netProfit: number }[];
  expenses: {
    id: string;
    title: string;
    category: string;
    amount: number;
    expenseDate: string;
  }[];
};
const fallback: Summary = {
  totals: {
    revenue: 8642.25,
    cogs: 3184.4,
    operatingExpenses: 2260,
    grossProfit: 5457.85,
    netProfit: 3197.85,
  },
  byDay: [
    { period: "2026-07-01", revenue: 980, cogs: 360, netProfit: 420 },
    { period: "2026-07-02", revenue: 1210, cogs: 430, netProfit: 650 },
    { period: "2026-07-03", revenue: 1480, cogs: 540, netProfit: 520 },
    { period: "2026-07-04", revenue: 1330, cogs: 480, netProfit: 690 },
    { period: "2026-07-05", revenue: 1690, cogs: 620, netProfit: 810 },
  ],
  expenses: [
    {
      id: "1",
      title: "Monthly rent",
      category: "RENT",
      amount: 1200,
      expenseDate: "2026-07-01",
    },
    {
      id: "2",
      title: "Electricity",
      category: "ELECTRICITY",
      amount: 420,
      expenseDate: "2026-07-03",
    },
  ],
};
const copy = {
  en: {
    title: "Financial overview",
    sub: "A simple view of what the restaurant earned and spent.",
    addExpense: "Add expense",
    addSalary: "Add salary",
    addIngredient: "Add ingredient purchase",
    revenue: "Total revenue",
    cogs: "Cost of goods sold",
    expenses: "Operating expenses",
    gross: "Gross profit",
    net: "Net profit",
    daily: "Daily performance",
    monthly: "Monthly view",
    recent: "Recent financial transactions",
    date: "Date",
    transaction: "Transaction",
    type: "Type",
    amount: "Amount",
    income: "Income",
    expense: "Expense",
    from: "From",
    to: "To",
    empty: "No financial transactions in this period.",
  },
  ar: {
    title: "النظرة المالية",
    sub: "ملخص بسيط لما حققه المطعم وما أنفقه.",
    addExpense: "إضافة مصروف",
    addSalary: "إضافة راتب",
    addIngredient: "إضافة شراء مكونات",
    revenue: "إجمالي الإيرادات",
    cogs: "تكلفة البضاعة المباعة",
    expenses: "المصروفات التشغيلية",
    gross: "إجمالي الربح",
    net: "صافي الربح",
    daily: "الأداء اليومي",
    monthly: "العرض الشهري",
    recent: "أحدث الحركات المالية",
    date: "التاريخ",
    transaction: "الحركة",
    type: "النوع",
    amount: "المبلغ",
    income: "إيراد",
    expense: "مصروف",
    from: "من",
    to: "إلى",
    empty: "لا توجد حركات مالية في هذه الفترة.",
  },
};
export default function FinancePage() {
  const { locale } = useLanguage();
  const c = copy[locale];
  const [data, setData] = useState(fallback);
  const [from, setFrom] = useState("2026-07-01"),
    [to, setTo] = useState("2026-07-31");
  useEffect(() => {
    fetch(`/api/finance/summary?from=${from}&to=${to}`)
      .then((r) => (r.ok ? r.json() : fallback))
      .then(setData)
      .catch(() => setData(fallback));
  }, [from, to]);
  const kpis = [
    { label: c.revenue, value: data.totals.revenue, icon: WalletCards },
    { label: c.cogs, value: data.totals.cogs, icon: ShoppingBasket },
    { label: c.expenses, value: data.totals.operatingExpenses, icon: Receipt },
    { label: c.gross, value: data.totals.grossProfit, icon: TrendingUp },
    { label: c.net, value: data.totals.netProfit, icon: Coins },
  ];
  return (
    <AppShell title={c.title} description={c.sub}>
      <div className="finance-actions">
        <Quick
          href="/admin/finance/expenses?create=1"
          icon={Receipt}
          label={c.addExpense}
        />
        <Quick
          href="/admin/finance/payroll?create=1"
          icon={Coins}
          label={c.addSalary}
        />
        <Quick
          href="/admin/finance/ingredients?create=1"
          icon={ShoppingBasket}
          label={c.addIngredient}
        />
      </div>
      <section className="card p-4 mt-5 flex flex-wrap items-end gap-3">
        <Field label={c.from}>
          <input
            className="input"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Field>
        <Field label={c.to}>
          <input
            className="input"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </Field>
        <span className="ms-auto size-11 bg-primary-soft text-primary grid place-items-center rounded-xl">
          <CalendarDays size={20} />
        </span>
      </section>
      <section className="finance-kpis">
        {kpis.map(({ label, value, icon: Icon }, i) => (
          <article
            className={`finance-kpi ${i === 4 ? "featured" : ""}`}
            key={label}
          >
            <Icon size={21} />
            <span>{label}</span>
            <strong>{money(value, locale)}</strong>
          </article>
        ))}
      </section>
      <section className="grid xl:grid-cols-2 gap-5 mt-5">
        <Chart title={c.daily} data={data.byDay} locale={locale} labels={[c.revenue,c.net]} />
        <Chart
          title={c.monthly}
          data={aggregateMonths(data.byDay)} locale={locale} labels={[c.revenue,c.net]}
        />
      </section>
      <section className="card mt-5 overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-bold">{c.recent}</h2>
        </div>
        <div className="transaction-cards">
          {data.expenses.map(x=><article className="p-4 border-t border-border" key={x.id}><div className="flex justify-between gap-3"><b>{transactionTitle(x,locale)}</b><strong className="text-danger">− {money(x.amount,locale)}</strong></div><p className="text-muted text-sm mt-2">{categoryName(x.category,locale)} · {new Date(x.expenseDate).toLocaleDateString(locale==="ar"?"ar-PS":"en-US")}</p></article>)}
        </div>
        <div className="overflow-x-auto transaction-table">
          <table className="finance-table">
            <thead>
              <tr>
                <th>{c.date}</th>
                <th>{c.transaction}</th>
                <th>{c.type}</th>
                <th>{c.amount}</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.length ? (
                data.expenses.map((x) => (
                  <tr key={x.id}>
                    <td>
                      {new Date(x.expenseDate).toLocaleDateString(locale)}
                    </td>
                    <td>
                      <b>{transactionTitle(x,locale)}</b>
                      <small>{categoryName(x.category,locale)}</small>
                    </td>
                    <td>
                      <span className="status expense">
                        <ArrowDownLeft size={14} />
                        {c.expense}
                      </span>
                    </td>
                    <td className="amount expense">
                      − {money(x.amount, locale)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted">
                    {c.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
function Quick({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Receipt;
  label: string;
}) {
  return (
    <Link href={href} className="finance-quick">
      <span>
        <Icon size={21} />
      </span>
      {label}
      <Plus size={18} className="ms-auto" />
    </Link>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="min-w-44">
      <span className="text-sm font-semibold block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
function Chart({ title, data, locale, labels }: { title: string; data: Summary["byDay"]; locale:"en"|"ar"; labels:[string,string] }) {
  const points=data.map(x=>({...x,revenue:Number(x.revenue)||0,cogs:Number(x.cogs)||0,netProfit:Number(x.netProfit)||0}));
  return (
    <article className="card p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="h-72 mt-5" dir="ltr">
        <ResponsiveContainer>
          <AreaChart data={points}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#16836f" stopOpacity=".35" />
                <stop offset="1" stopColor="#16836f" stopOpacity="0" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7ded2" />
            <XAxis dataKey="period" tick={{ fontSize: 12 }} tickFormatter={v=>periodLabel(String(v),locale)} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v,n) => [money(Number(v),locale),n==="revenue"?labels[0]:labels[1]]} labelFormatter={v=>periodLabel(String(v),locale)} />
            <Legend formatter={v=>v==="revenue"?labels[0]:labels[1]} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#16836f"
              strokeWidth={3}
              fill="url(#rev)"
            />
            <Area
              type="monotone"
              dataKey="netProfit"
              stroke="#d28533"
              strokeWidth={2}
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
export function money(v: number, locale: string) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-PS" : "en-US", {
    style: "currency",
    currency: "ILS",
  }).format(v || 0);
}
function periodLabel(value:string,locale:string){const d=new Date(value.length===7?`${value}-01`:value);return Number.isNaN(d.valueOf())?value:new Intl.DateTimeFormat(locale==="ar"?"ar-PS":"en-US",value.length===7?{month:"short",year:"numeric"}:{month:"short",day:"numeric"}).format(d)}
function aggregateMonths(rows:Summary["byDay"]){const grouped=new Map<string,Summary["byDay"][number]>();for(const r of rows){const k=r.period.slice(0,7);const x=grouped.get(k)||{period:k,revenue:0,cogs:0,netProfit:0};x.revenue+=r.revenue;x.cogs+=r.cogs;x.netProfit+=r.netProfit;grouped.set(k,x)}return [...grouped.values()]}
function categoryName(value:string,locale:string){const m:Record<string,[string,string]>={RENT:["Rent","الإيجار"],SALARIES:["Employee salaries","رواتب الموظفين"],ELECTRICITY:["Electricity","الكهرباء"],WATER:["Water","المياه"],INTERNET:["Internet","الإنترنت"],MAINTENANCE:["Maintenance","الصيانة"],MARKETING:["Marketing","التسويق"],DELIVERY:["Delivery","التوصيل"],EQUIPMENT:["Equipment","المعدات"],OTHER:["Other","أخرى"]};return (m[value]||[value,value])[locale==="ar"?1:0]}
function transactionTitle(x:Summary["expenses"][number],locale:string){if(locale!=="ar")return x.title;const known:Record<string,string>={"Monthly rent":"الإيجار الشهري",Electricity:"فاتورة الكهرباء","Delivery fuel":"وقود التوصيل"};return known[x.title]||categoryName(x.category,locale)}
