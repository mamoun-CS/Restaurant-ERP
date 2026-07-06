"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Coffee, Eye, EyeOff, Globe2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function LoginPage() {
  const { t, locale, setLocale } = useLanguage(); const router = useRouter();
  const [email, setEmail] = useState("admin@noura.test"); const [password, setPassword] = useState("Demo123!");
  const [show, setShow] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) { e.preventDefault(); setLoading(true); setError(""); const res = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,password}) }); const data = await res.json(); setLoading(false); if (!res.ok) return setError(data.error); router.push(data.role === "ADMIN" ? "/admin" : "/pos"); router.refresh(); }
  return <main className="min-h-screen grid lg:grid-cols-[1.05fr_.95fr] bg-surface">
    <section className="hidden lg:flex relative overflow-hidden bg-sidebar text-white p-14 flex-col justify-between">
      <div className="absolute -end-28 top-24 size-80 rounded-full border border-white/10"/><div className="absolute -end-10 top-44 size-52 rounded-full border border-white/10"/>
      <div className="flex items-center gap-3 relative"><div className="size-11 rounded-xl bg-primary grid place-items-center"><Coffee size={24}/></div><div><div className="font-bold text-lg">{t("brand")}</div><div className="text-xs text-sidebar-muted">Restaurant ERP</div></div></div>
      <div className="relative max-w-xl"><div className="text-primary-soft text-sm uppercase tracking-[.22em] font-bold mb-5">Serve smarter</div><h1 className="text-5xl leading-[1.12] font-semibold tracking-tight">Every order.<br/>Every shift.<br/><em className="font-serif text-primary-soft">Perfectly in sync.</em></h1><p className="mt-6 text-sidebar-muted text-lg max-w-md leading-8">A focused workspace for busy counters, clear decisions, and memorable service.</p></div>
      <div className="flex gap-8 text-sm text-sidebar-muted relative"><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-primary-soft"/>Role protected</span><span>EN / عربي</span><span>Multi-branch ready</span></div>
    </section>
    <section className="relative flex items-center justify-center p-6 sm:p-12">
      <button onClick={()=>setLocale(locale === "en" ? "ar" : "en")} className="absolute top-6 end-6 btn-secondary flex items-center gap-2"><Globe2 size={17}/>{t("language")}</button>
      <div className="w-full max-w-md"><div className="flex lg:hidden items-center gap-3 mb-12"><div className="size-11 rounded-xl bg-primary text-white grid place-items-center"><Coffee size={24}/></div><b className="text-lg">{t("brand")}</b></div>
        <p className="text-primary font-bold text-sm tracking-wide mb-2">{t("tagline")}</p><h2 className="text-4xl font-bold tracking-tight">{t("welcomeBack")}</h2><p className="text-muted mt-3">{t("loginHint")}</p>
        <form onSubmit={submit} className="mt-9 space-y-5"><label className="block"><span className="text-sm font-semibold block mb-2">{t("email")}</span><div className="relative"><Mail className="absolute start-4 top-3.5 text-muted" size={18}/><input className="input ps-11" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div></label>
          <label className="block"><span className="text-sm font-semibold block mb-2">{t("password")}</span><div className="relative"><LockKeyhole className="absolute start-4 top-3.5 text-muted" size={18}/><input className="input px-11" type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" onClick={()=>setShow(!show)} className="absolute end-4 top-3.5 text-muted">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
          {error&&<p className="text-danger text-sm font-semibold">{error}</p>}<button disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">{loading?"…":t("signIn")}<ArrowRight size={18} className="rtl:rotate-180"/></button>
        </form>
        <div className="mt-8 card bg-background p-4"><p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">{t("demoAccounts")}</p><div className="grid grid-cols-2 gap-2 text-xs"><button onClick={()=>{setEmail("admin@noura.test");setPassword("Demo123!")}} className="text-start p-3 bg-surface rounded-xl border border-border"><b className="block mb-1">{t("admin")}</b>admin@noura.test</button><button onClick={()=>{setEmail("cashier@noura.test");setPassword("Demo123!")}} className="text-start p-3 bg-surface rounded-xl border border-border"><b className="block mb-1">{t("cashier")}</b>cashier@noura.test</button></div><p className="text-xs text-muted mt-3">Password: Demo123!</p></div>
      </div>
    </section>
  </main>;
}

