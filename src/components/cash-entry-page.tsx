"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Banknote, Globe2, LogOut, PlayCircle } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/components/language-provider";

type CurrentShift = { shift?: { id: string; shiftNumber: string; register: { number: string }; branch: { name: string }; openedAt: string } | null };

export function CashEntryPage() {
  const { locale, setLocale } = useLanguage();
  const ar = locale === "ar";
  const [data, setData] = useState<CurrentShift | null>(null);
  useEffect(() => { fetch("/api/cash/shifts/current").then((res) => res.json()).then(setData).catch(() => setData({ shift: null })); }, []);
  const hasShift = Boolean(data?.shift);
  return <main className="min-h-screen bg-background">
    <header className="h-20 bg-sidebar text-white flex items-center px-5 gap-4">
      <BrandLogo className="max-w-[190px]" />
      <div className="ms-auto flex items-center gap-2">
        <button onClick={() => setLocale(ar ? "en" : "ar")} className="btn-secondary bg-white/10 border-white/10 text-white flex items-center gap-2"><Globe2 size={17}/>{ar ? "English" : "العربية"}</button>
        <form action="/api/auth/logout" method="post"><button className="size-11 rounded-xl bg-white/10 grid place-items-center"><LogOut size={18}/></button></form>
      </div>
    </header>
    <section className="max-w-5xl mx-auto p-5 sm:p-8">
      <div className="mb-6">
        <p className="text-primary text-sm font-bold">{ar ? "نظام الكاش" : "Cash System"}</p>
        <h1 className="text-3xl font-bold mt-2">{ar ? "هل تريد فتح كاش جديد أو استمرار الدوام؟" : "Open cash or continue the shift?"}</h1>
        <p className="text-muted mt-3">{ar ? "اختر فتح كاش إذا كنت تبدأ دوام جديد. اختر استمرار الدوام إذا كان لديك شفت مفتوح." : "Choose open cash when starting a new shift. Choose continue when you already have an open shift."}</p>
      </div>
      {data?.shift && <div className="card p-4 mb-5 border-s-4 border-s-primary">
        <p className="text-sm text-muted">{ar ? "الشفت المفتوح الحالي" : "Current open shift"}</p>
        <b className="block mt-1">{data.shift.shiftNumber} · {data.shift.branch.name} · {data.shift.register.number}</b>
      </div>}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/cash/open" className="card p-6 hover:border-primary transition active:scale-[.99]">
          <span className="size-12 rounded-xl bg-primary-soft text-primary grid place-items-center"><Banknote size={24}/></span>
          <h2 className="text-xl font-bold mt-5">{ar ? "فتح كاش" : "Open Cash"}</h2>
          <p className="text-sm text-muted mt-2">{ar ? "عد النقود حسب العملة والفئة وافتح شفت جديد على جهاز الكاش." : "Count cash by currency and denomination, then open a new register shift."}</p>
          <span className="btn-primary mt-5 inline-flex items-center gap-2">{ar ? "فتح كاش" : "Open Cash"}<ArrowRight size={17} className="rtl:rotate-180"/></span>
        </Link>
        <Link href={hasShift ? "/pos" : "/cash/open"} className={`card p-6 transition active:scale-[.99] ${hasShift ? "hover:border-success" : "opacity-80"}`}>
          <span className="size-12 rounded-xl bg-success/10 text-success grid place-items-center"><PlayCircle size={24}/></span>
          <h2 className="text-xl font-bold mt-5">{ar ? "استمرار الدوام" : "Continue Shift"}</h2>
          <p className="text-sm text-muted mt-2">{hasShift ? (ar ? "انتقل إلى شاشة البيع واستمر على الشفت المفتوح." : "Go to POS and continue with your open shift.") : (ar ? "لا يوجد شفت مفتوح حالياً. سيتم تحويلك لفتح كاش." : "No open shift was found. You will be sent to open cash first.")}</p>
          <span className="btn-secondary mt-5 inline-flex items-center gap-2">{ar ? "استمرار" : "Continue"}<ArrowRight size={17} className="rtl:rotate-180"/></span>
        </Link>
      </div>
    </section>
  </main>
}
