"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, ChevronDown, CirclePercent, Coffee, FileText, Gauge, Globe2, LogOut, Menu, Settings, Tags, Users, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/i18n/en";

const nav: { href: string; label: TranslationKey; icon: typeof Gauge }[] = [
  { href:"/admin", label:"dashboard", icon:Gauge }, { href:"/admin/reports", label:"reports", icon:BarChart3 },
  { href:"/admin/products", label:"products", icon:Boxes }, { href:"/admin/categories", label:"categories", icon:Tags },
  { href:"/admin/discounts", label:"discounts", icon:CirclePercent }, { href:"/admin/employees", label:"employees", icon:Users },
  { href:"/admin/invoices", label:"invoices", icon:FileText }, { href:"/admin/settings", label:"settings", icon:Settings },
];

export function AppShell({ children, title, description, action }: { children:React.ReactNode; title:string; description?:string; action?:React.ReactNode }) {
  const pathname=usePathname(); const {t,locale,setLocale}=useLanguage(); const [open,setOpen]=useState(false);
  const sidebar=<><div className="h-20 px-5 flex items-center justify-between border-b border-white/10"><Link href="/admin" className="flex items-center gap-3"><div className="size-10 rounded-xl bg-primary grid place-items-center text-white"><Coffee size={22}/></div><div><div className="font-bold text-white">{t("brand")}</div><div className="text-[10px] uppercase tracking-widest text-sidebar-muted">Restaurant ERP</div></div></Link><button onClick={()=>setOpen(false)} className="lg:hidden text-white"><X/></button></div>
    <div className="px-3 py-5 flex-1 overflow-y-auto"><p className="px-3 text-[10px] font-bold uppercase tracking-[.18em] text-sidebar-muted mb-2">Workspace</p><nav className="space-y-1">{nav.map(item=>{const active=item.href==="/admin"?pathname===item.href:pathname.startsWith(item.href);const Icon=item.icon;return <Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={`flex items-center gap-3 px-3 h-11 rounded-xl text-sm transition ${active?"bg-white/10 text-white font-semibold":"text-sidebar-muted hover:text-white hover:bg-white/5"}`}><Icon size={19}/>{t(item.label)}{active&&<span className="ms-auto size-1.5 bg-primary rounded-full"/>}</Link>})}</nav>
    <div className="mt-7 p-3 rounded-xl bg-white/5 border border-white/5"><div className="flex gap-2 items-center text-white text-xs font-semibold"><span className="size-2 rounded-full bg-success"/>{t("operatingNow")}</div><p className="text-sidebar-muted text-xs mt-2">Main Branch · 08:00–23:00</p></div></div>
    <div className="p-3 border-t border-white/10"><form action="/api/auth/logout" method="post"><button className="w-full flex items-center gap-3 px-3 h-11 rounded-xl text-sidebar-muted hover:text-white"><LogOut size={18}/>{t("logout")}</button></form></div></>;
  return <div className="min-h-screen bg-background lg:ps-64"><aside className="fixed hidden lg:flex start-0 top-0 bottom-0 w-64 bg-sidebar flex-col z-30">{sidebar}</aside>{open&&<><div className="fixed inset-0 bg-text/40 z-40 lg:hidden" onClick={()=>setOpen(false)}/><aside className="fixed flex flex-col start-0 top-0 bottom-0 w-[280px] bg-sidebar z-50 lg:hidden">{sidebar}</aside></>}
    <header className="h-20 bg-surface/95 backdrop-blur border-b border-border sticky top-0 z-20 px-4 sm:px-7 flex items-center gap-4"><button onClick={()=>setOpen(true)} className="lg:hidden btn-secondary !p-0 size-11 grid place-items-center"><Menu size={20}/></button><div className="min-w-0"><h1 className="font-bold text-xl truncate">{title}</h1>{description&&<p className="text-muted text-xs mt-1 truncate hidden sm:block">{description}</p>}</div><div className="ms-auto flex items-center gap-2">{action}<button onClick={()=>setLocale(locale==="en"?"ar":"en")} className="btn-secondary flex items-center gap-2 !px-3"><Globe2 size={17}/><span className="hidden sm:inline">{t("language")}</span></button><button className="hidden sm:flex items-center gap-2 ps-2"><span className="size-9 rounded-full bg-primary-soft text-primary grid place-items-center text-sm font-bold">MH</span><span className="text-sm text-start"><b className="block">Maya Haddad</b><small className="text-muted">{t("admin")}</small></span><ChevronDown size={15}/></button></div></header>
    <main className="p-4 sm:p-7 max-w-[1500px] mx-auto">{children}</main></div>;
}
