"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Globe2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/components/language-provider";

export default function LoginPage() {
  const { t, locale, setLocale } = useLanguage(); const router = useRouter();
  const [email, setEmail] = useState("admin@noura.test"); const [password, setPassword] = useState("Demo123!");
  const [show, setShow] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) { e.preventDefault(); setLoading(true); setError(""); const res = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,password}) }); const data = await res.json(); setLoading(false); if (!res.ok) return setError(data.error); router.push(data.redirectTo || (data.role === "ADMIN" ? "/admin" : "/cash")); router.refresh(); }
  return <main className="min-h-screen grid lg:grid-cols-[1.05fr_.95fr] bg-surface">
    <section className="hidden lg:flex relative overflow-hidden bg-sidebar text-white p-14 flex-col justify-between">
      <div className="absolute inset-x-0 top-0 h-px bg-accent/60"/><div className="absolute end-0 top-0 h-full w-1/3 border-s border-white/10 bg-[linear-gradient(180deg,rgba(255,138,31,.15),transparent)]"/>
      <BrandLogo size="lg" className="relative max-w-[260px]"/>
      <div className="relative max-w-xl"><div className="text-brand-gold text-sm uppercase tracking-[.22em] font-bold mb-5">Serve with craft</div><h1 className="text-5xl leading-[1.12] font-semibold tracking-tight">Every order.<br/>Every shift.<br/><em className="font-serif text-brand-cream">Perfectly in sync.</em></h1><p className="mt-6 text-sidebar-muted text-lg max-w-md leading-8">A focused workspace for authentic service, clear decisions, and a premium guest experience.</p></div>
      <div className="flex gap-8 text-sm text-sidebar-muted relative"><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-brand-gold"/>Role protected</span><span>EN / عربي</span><span>Multi-branch ready</span></div>
    </section>
    <section className="relative flex items-center justify-center p-6 sm:p-12">
      <button onClick={()=>setLocale(locale === "en" ? "ar" : "en")} className="absolute top-6 end-6 btn-secondary flex items-center gap-2"><Globe2 size={17}/>{t("language")}</button>
      <div className="w-full max-w-md"><div className="mb-12 lg:hidden"><BrandLogo tone="light" size="lg"/></div>
        <p className="text-primary font-bold text-sm tracking-wide mb-2">{t("tagline")}</p><h2 className="text-4xl font-bold tracking-tight">{t("welcomeBack")}</h2><p className="text-muted mt-3">{t("loginHint")}</p>
        <form onSubmit={submit} className="mt-9 space-y-5"><label className="block"><span className="text-sm font-semibold block mb-2">{t("email")}</span><div className="relative"><Mail className="absolute start-4 top-3.5 text-muted" size={18}/><input className="input input-icon-start" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div></label>
          <label className="block"><span className="text-sm font-semibold block mb-2">{t("password")}</span><div className="relative"><LockKeyhole className="absolute start-4 top-3.5 text-muted" size={18}/><input className="input input-icon-both" type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required/><button type="button" onClick={()=>setShow(!show)} className="absolute end-4 top-3.5 text-muted">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
          {error&&<p className="text-danger text-sm font-semibold">{error}</p>}<button disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">{loading?"…":t("signIn")}<ArrowRight size={18} className="rtl:rotate-180"/></button>
        </form>
        <div className="mt-8 card bg-background p-4"><p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">{t("demoAccounts")}</p><div className="grid grid-cols-2 gap-2 text-xs"><button onClick={()=>{setEmail("admin@noura.test");setPassword("Demo123!")}} className="text-start p-3 bg-surface rounded-xl border border-border"><b className="block mb-1">{t("admin")}</b>admin@noura.test</button><button onClick={()=>{setEmail("cashier@noura.test");setPassword("Demo123!")}} className="text-start p-3 bg-surface rounded-xl border border-border"><b className="block mb-1">{t("cashier")}</b>cashier@noura.test</button></div><p className="text-xs text-muted mt-3">Password: Demo123!</p></div>
      </div>
    </section>
  </main>;
}
