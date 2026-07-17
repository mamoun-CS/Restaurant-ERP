"use client";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/ui";

type Shift = { id:string; shiftNumber:string; status:string; openedAt:string; closedAt?:string; openingTotalBase:string; expectedClosingTotalBase?:string; actualClosingTotalBase?:string; differenceTotalBase?:string; branch:{name:string}; register:{number:string}; employee:{name:string}; reviewStatus:string };
type Settings = { branches:{id:string;name:string}[]; registers:{id:string;name:string;number:string;active:boolean;branch:{name:string}}[]; currencies:{id:string;code:string;name:string;isBase:boolean;denominations:{id:string;label:string;value:string;active:boolean}[];exchangeRates:{rateToBase:string;previousRate?:string;createdAt:string;manager?:{name:string}}[]}[] };

export function CashManagementPage() {
  const [shifts,setShifts]=useState<Shift[]>([]);
  const [settings,setSettings]=useState<Settings|null>(null);
  const [rate,setRate]=useState({currencyCode:"USD",rateToBase:"3.65"});
  useEffect(()=>{void refresh()},[]);
  async function refresh(){const [shiftRes,settingsRes]=await Promise.all([fetch("/api/cash/shifts"),fetch("/api/cash/settings")]);setShifts(await shiftRes.json());setSettings(await settingsRes.json())}
  async function saveRate(){await fetch("/api/cash/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({currencyCode:rate.currencyCode,rateToBase:Number(rate.rateToBase)})});await refresh()}
  const stats=useMemo(()=>({open:shifts.filter(s=>s.status==="OPEN").length,closed:shifts.filter(s=>s.status==="CLOSED").length,shortage:shifts.reduce((a,s)=>a+Math.min(0,Number(s.differenceTotalBase||0)),0),overage:shifts.reduce((a,s)=>a+Math.max(0,Number(s.differenceTotalBase||0)),0)}),[shifts]);
  return <AppShell title="Cash Register and Shift Management" description="Open shifts, closing reports, exchange rates, denominations, and review status">
    <div className="grid sm:grid-cols-4 gap-3 mb-5">
      <Stat label="Open shifts" value={stats.open}/><Stat label="Closed shifts" value={stats.closed}/><Stat label="Shortages" value={`₪ ${Math.abs(stats.shortage).toFixed(2)}`} tone="text-danger"/><Stat label="Overages" value={`₪ ${stats.overage.toFixed(2)}`} tone="text-warning"/>
    </div>
    <section className="card p-5 mb-5">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
        <div className="flex-1"><h2 className="font-bold text-lg">Cash and Currency Settings</h2><p className="text-sm text-muted mt-1">Base currency is ILS. Managers can update fixed USD/JOD rates; every change is saved in history.</p></div>
        <select className="input lg:w-32" value={rate.currencyCode} onChange={e=>setRate({...rate,currencyCode:e.target.value})}><option>USD</option><option>JOD</option></select>
        <input className="input lg:w-36" value={rate.rateToBase} onChange={e=>setRate({...rate,rateToBase:e.target.value})} inputMode="decimal"/>
        <button className="btn-primary" onClick={saveRate}>Save rate</button>
      </div>
      <div className="grid md:grid-cols-3 gap-3 mt-5">{settings?.currencies.map(currency=><div key={currency.id} className="rounded-lg border border-border p-4"><div className="flex justify-between"><b>{currency.code}</b><StatusBadge active={currency.isBase} label={currency.isBase?"Base":"Accepted"}/></div><p className="text-sm text-muted mt-1">{currency.name}</p><p className="text-sm mt-3">Rate: <b>{currency.isBase?"1.000000":currency.exchangeRates[0]?.rateToBase}</b></p><div className="flex flex-wrap gap-1.5 mt-3">{currency.denominations.map(d=><span key={d.id} className="px-2 py-1 rounded-md bg-background text-xs font-semibold">{d.label}</span>)}</div></div>)}</div>
      <div className="mt-5"><h3 className="font-bold text-sm mb-2">Registers</h3><div className="grid md:grid-cols-3 gap-2">{settings?.registers.map(register=><div key={register.id} className="bg-background rounded-lg p-3 text-sm flex justify-between"><span>{register.branch.name} · {register.number}</span><StatusBadge active={register.active}/></div>)}</div></div>
    </section>
    <section className="card overflow-hidden"><div className="p-5 border-b border-border"><h2 className="font-bold text-lg">Closing Reports</h2></div><div className="overflow-auto"><table className="w-full text-sm"><thead className="bg-background text-muted"><tr><th className="p-3 text-start">Shift</th><th className="p-3 text-start">Employee</th><th className="p-3 text-start">Branch</th><th className="p-3 text-start">Register</th><th className="p-3 text-end">Expected</th><th className="p-3 text-end">Actual</th><th className="p-3 text-end">Difference</th><th className="p-3 text-start">Review</th></tr></thead><tbody>{shifts.map(s=><tr key={s.id} className="border-t border-border"><td className="p-3"><b>{s.shiftNumber}</b><br/><small className="text-muted">{s.status}</small></td><td className="p-3">{s.employee.name}</td><td className="p-3">{s.branch.name}</td><td className="p-3">{s.register.number}</td><td className="p-3 text-end">₪ {Number(s.expectedClosingTotalBase||0).toFixed(2)}</td><td className="p-3 text-end">₪ {Number(s.actualClosingTotalBase||0).toFixed(2)}</td><td className={`p-3 text-end font-bold ${Number(s.differenceTotalBase)<0?"text-danger":Number(s.differenceTotalBase)>0?"text-warning":"text-success"}`}>₪ {Number(s.differenceTotalBase||0).toFixed(2)}</td><td className="p-3">{s.reviewStatus}</td></tr>)}</tbody></table></div></section>
  </AppShell>
}
function Stat({label,value,tone=""}:{label:string;value:string|number;tone?:string}){return <div className="card p-4"><p className="text-xs text-muted">{label}</p><b className={`text-2xl mt-1 block ${tone}`}>{value}</b></div>}
