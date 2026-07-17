"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Globe2, LogOut } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/components/language-provider";

type Settings = {
  registers: { id: string; number: string; branch: { name: string } }[];
  rates: { code: string; rateToBase: string }[];
  carryover?: {
    id: string;
    shiftNumber: string;
    carryovers: { currencyCode: string; amount: string }[];
  };
};
type Denom = {
  code: string;
  value: number;
  qty: number;
  withdrawn: number;
  remaining: number;
};
const defaults: Record<string, number[]> = {
  ILS: [200, 100, 50, 20, 10, 5, 2, 1],
  USD: [100, 50, 20, 10, 5, 1],
  JOD: [50, 20, 10, 5, 1],
};

export function CashShiftPage({ mode }: { mode: "open" | "close" }) {
  const { locale, setLocale } = useLanguage();
  const ar = locale === "ar";
  const [settings, setSettings] = useState<Settings | null>(null);
  const [registerId, setRegisterId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [note, setNote] = useState("");
  const [counts, setCounts] = useState<Denom[]>(
    Object.entries(defaults).flatMap(([code, values]) =>
      values.map((value) => ({
        code,
        value,
        qty: 0,
        withdrawn: 0,
        remaining: 0,
      })),
    ),
  );
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/api/cash/shifts/current")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setRegisterId(data.registers?.[0]?.id || "");
        setShiftId(data.shift?.id || "");
      });
  }, []);
  const totals = useMemo(
    () =>
      counts.reduce<Record<string, number>>(
        (acc, row) => ({
          ...acc,
          [row.code]: (acc[row.code] || 0) + row.value * row.qty,
        }),
        {},
      ),
    [counts],
  );
  function update(
    index: number,
    key: "qty" | "withdrawn" | "remaining",
    value: string,
  ) {
    setCounts((old) =>
      old.map((row, i) =>
        i === index ? { ...row, [key]: Math.max(0, Number(value) || 0) } : row,
      ),
    );
  }
  function errorText(error: string) {
    if (!ar) return error;
    if (error.includes("note")) return "يجب إدخال ملاحظة عند وجود فرق";
    if (error.includes("Withdrawn"))
      return "كمية المسحوب + كمية المتبقي يجب أن تساوي الكمية المتوفرة";
    if (error.includes("already")) return "يوجد شفت مفتوح على جهاز الكاش";
    return "تعذر حفظ الشفت";
  }
  async function submit() {
    setMessage("");
    const endpoint =
      mode === "open" ? "/api/cash/shifts/open" : "/api/cash/shifts/close";
    const body =
      mode === "open"
        ? {
            registerId,
            counts: counts.map((c) => ({
              currencyCode: c.code,
              denominationValue: c.value,
              quantity: c.qty,
            })),
            discrepancyNote: note,
          }
        : {
            shiftId,
            counts: counts.map((c) => ({
              currencyCode: c.code,
              denominationValue: c.value,
              quantity: c.qty,
              withdrawnQty: c.withdrawn,
              remainingQty: c.remaining,
            })),
            note,
          };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(errorText(data.error || "Unable to save shift"));
      return;
    }
    window.location.href =
      mode === "open" ? "/pos" : `/cash/close?closed=${data.reportReference}`;
  }
  return (
    <main className="min-h-screen bg-background">
      <header className="h-20 bg-sidebar text-white flex items-center px-5 gap-4">
        <Link href="/cash">
          <BrandLogo className="max-w-[190px]" />
        </Link>
        <div className="ms-auto flex items-center gap-2">
          <button style={{color : "black" }}
            onClick={() => setLocale(ar ? "en" : "ar")}
            className="btn-secondary bg-white/10 border-white/10 text-white flex items-center gap-2"
          >
            <Globe2 size={17} />
            {ar ? "English" : "العربية"}
          </button>
          <Link style={{color : "black"}}
            className="btn-secondary bg-white/10 border-white/10 text-white"
            href="/pos"
          >
            {ar ? "نقطة البيع" : "POS"}
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="size-11 rounded-xl bg-white/10 grid place-items-center" >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </header>
      <div className="max-w-6xl mx-auto p-4 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-5">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {mode === "open"
                ? ar
                  ? "فتح كاش"
                  : "Open Cash Register"
                : ar
                  ? "إغلاق الكاش"
                  : "Close Cash Register"}
            </h1>
            <p className="text-sm text-muted mt-1">
              {ar
                ? "عد كل عملة حسب الفئة. تظهر المجاميع وأسعار الصرف قبل التأكيد."
                : "Count each currency by denomination. Totals and exchange references are shown before confirmation."}
            </p>
          </div>
          {mode === "open" ? (
            <select
              className="input md:w-72"
              value={registerId}
              onChange={(e) => setRegisterId(e.target.value)}
            >
              {settings?.registers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.branch.name} · {r.number}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="input md:w-72"
              value={shiftId}
              onChange={(e) => setShiftId(e.target.value)}
              placeholder={ar ? "رقم الشفت المفتوح" : "Open shift ID"}
            />
          )}
        </div>
        <section className="card p-4 mb-5 grid md:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-muted">
              {ar ? "أسعار الصرف" : "Exchange rates"}
            </span>
            <p className="font-bold mt-1">
              {settings?.rates
                .map((r) => `${r.code}: ${r.rateToBase}`)
                .join(" · ")}
            </p>
          </div>
          <div>
            <span className="text-muted">
              {ar ? "المرحل من الشفت السابق" : "Previous carryover"}
            </span>
            <p className="font-bold mt-1">
              {settings?.carryover?.carryovers
                ?.map((c) => `${c.currencyCode} ${Number(c.amount).toFixed(2)}`)
                .join(" · ") || (ar ? "لا يوجد" : "None")}
            </p>
          </div>
          <div>
            <span className="text-muted">
              {ar ? "المجموع الحالي" : "Current totals"}
            </span>
            <p className="font-bold mt-1">
              {Object.entries(totals)
                .map(([code, total]) => `${code} ${total.toFixed(2)}`)
                .join(" · ")}
            </p>
          </div>
        </section>
        <div className="grid lg:grid-cols-3 gap-4">
          {Object.keys(defaults).map((code) => (
            <section key={code} className="card overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between">
                <b>{code}</b>
                <span className="text-primary font-bold">
                  {(totals[code] || 0).toFixed(2)}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-background text-muted">
                  <tr>
                    <th className="p-2 text-start">
                      {ar ? "الفئة" : "Denomination"}
                    </th>
                    <th className="p-2 text-end">{ar ? "العدد" : "Qty"}</th>
                    {mode === "close" && (
                      <>
                        <th className="p-2 text-end">{ar ? "مسحوب" : "Out"}</th>
                        <th className="p-2 text-end">
                          {ar ? "متبقي" : "Left"}
                        </th>
                      </>
                    )}
                    <th className="p-2 text-end">{ar ? "المجموع" : "Total"}</th>
                  </tr>
                </thead>
                <tbody>
                  {counts.map(
                    (row, index) =>
                      row.code === code && (
                        <tr
                          key={`${row.code}-${row.value}`}
                          className="border-t border-border"
                        >
                          <td className="p-2 font-semibold">{row.value}</td>
                          <td className="p-2">
                            <input
                              className="input !h-9 text-end"
                              inputMode="numeric"
                              value={row.qty}
                              onChange={(e) =>
                                update(index, "qty", e.target.value)
                              }
                            />
                          </td>
                          {mode === "close" && (
                            <>
                              <td className="p-2">
                                <input
                                  className="input !h-9 text-end"
                                  inputMode="numeric"
                                  value={row.withdrawn}
                                  onChange={(e) =>
                                    update(index, "withdrawn", e.target.value)
                                  }
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  className="input !h-9 text-end"
                                  inputMode="numeric"
                                  value={row.remaining}
                                  onChange={(e) =>
                                    update(index, "remaining", e.target.value)
                                  }
                                />
                              </td>
                            </>
                          )}
                          <td className="p-2 text-end">
                            {(row.value * row.qty).toFixed(2)}
                          </td>
                        </tr>
                      ),
                  )}
                </tbody>
              </table>
            </section>
          ))}
        </div>
        <section className="card p-4 mt-5">
          <label className="text-sm font-bold">
            {ar ? "ملاحظة الفرق أو الإغلاق" : "Discrepancy or closing note"}
          </label>
          <textarea
            className="input min-h-24 mt-2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              ar
                ? "مطلوبة عند وجود فرق تسليم، عجز، أو زيادة."
                : "Required when there is a handover difference, shortage, or overage."
            }
          />
          <div className="flex items-center gap-3 mt-4">
            <button className="btn-primary" onClick={submit}>
              {mode === "open"
                ? ar
                  ? "تأكيد فتح الكاش"
                  : "Confirm opening count"
                : ar
                  ? "تأكيد إغلاق الشفت"
                  : "Finalize shift closing"}
            </button>
            {message && (
              <p className="text-danger text-sm font-semibold">{message}</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
