"use client";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function PageToolbar({ search, setSearch, children }: { search?:string; setSearch?:(v:string)=>void; children?:React.ReactNode }) {
  const {t}=useLanguage(); return <div className="card p-3 flex flex-col sm:flex-row gap-3 mb-5"><div className="relative flex-1 max-w-lg"><Search size={17} className="absolute start-3.5 top-3.5 text-muted"/><input value={search} onChange={e=>setSearch?.(e.target.value)} placeholder={t("search")+"…"} className="input ps-10"/></div><div className="flex gap-2 overflow-auto">{children}<button className="btn-secondary flex items-center gap-2 whitespace-nowrap"><SlidersHorizontal size={16}/>{t("filter")}</button></div></div>;
}
export function StatusBadge({active=true,label}:{active?:boolean;label?:string}) { const {t}=useLanguage(); return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${active?"bg-success/10 text-success":"bg-muted/10 text-muted"}`}><span className={`size-1.5 rounded-full ${active?"bg-success":"bg-muted"}`}/>{label||(active?t("active"):t("inactive"))}</span> }
export function Pagination(){return <div className="flex justify-between items-center mt-4 text-sm text-muted"><span>Showing 1–8 of 24</span><div className="flex gap-1"><button className="size-9 card grid place-items-center"><ChevronLeft size={16}/></button><button className="size-9 rounded-lg bg-primary text-white">1</button><button className="size-9 card">2</button><button className="size-9 card">3</button><button className="size-9 card grid place-items-center"><ChevronRight size={16}/></button></div></div>}

