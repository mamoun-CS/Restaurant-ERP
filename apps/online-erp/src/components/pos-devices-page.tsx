"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, KeyRound, MonitorSmartphone, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";

type Branch = { id:string;name:string;nameAr:string;code:string };
type Register = { id:string;name:string;number:string;branchId:string };
type Cashier = { id:string;name:string;email:string;role:"ADMIN"|"CASHIER";branchId:string|null;offlinePinExpiresAt:string|null;hasOfflinePin:boolean;canDiscount:boolean;maxDiscountPercent:number;maxDiscountAmount:number;supervisor:boolean };
type Device = { id:string;name:string;active:boolean;createdAt:string;lastHeartbeatAt:string|null;lastSyncAt:string|null;lastSyncError:string|null;branchId:string;branch:Branch;register:{name:string;number:string}|null;assignments:{active:boolean;user:Cashier}[] };
type PageData = { branches:Branch[];registers:Register[];devices:Device[];cashiers:Cashier[] };

export default function PosDevicesPage() {
  const [data,setData] = useState<PageData>({branches:[],registers:[],devices:[],cashiers:[]});
  const [branchId,setBranchId] = useState("");
  const [registerId,setRegisterId] = useState("");
  const [pairing,setPairing] = useState<{code:string;expiresAt:string|null}|null>(null);
  const [selectedCashier,setSelectedCashier] = useState("");
  const [pin,setPin] = useState("");
  const [offlineDays,setOfflineDays] = useState(30);
  const [pinNeverExpires,setPinNeverExpires] = useState(false);
  const [pairNeverExpires,setPairNeverExpires] = useState(false);
  const [canDiscount,setCanDiscount] = useState(false);
  const [maxDiscountPercent,setMaxDiscountPercent] = useState(0);
  const [maxDiscountAmount,setMaxDiscountAmount] = useState(0);
  const [supervisor,setSupervisor] = useState(false);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [busy,setBusy] = useState(false);
  const [clock,setClock] = useState(0);

  const load = useCallback(async () => {
    const response = await fetch("/api/pos/devices",{cache:"no-store"});
    if (!response.ok) throw new Error("Could not load POS device settings.");
    const result = await response.json() as PageData; setData(result);
    if (!branchId && result.branches[0]) setBranchId(result.branches[0].id);
    if (!registerId) setRegisterId(result.registers.find((item)=>item.branchId===branchId)?.id??"");
  },[branchId,registerId]);
  useEffect(()=>{const timer=window.setTimeout(()=>{void load().catch((e)=>setError(e.message));},0);return()=>window.clearTimeout(timer);},[load]);
  useEffect(()=>{const timer=window.setInterval(()=>setClock(Date.now()),30_000);return()=>window.clearInterval(timer);},[]);
  const registers = data.registers.filter((register)=>register.branchId===branchId);
  const selectedAccount = data.cashiers.find((account)=>account.id===selectedCashier);

  function selectPosAccount(id:string) {
    setSelectedCashier(id);
    const account=data.cashiers.find((item)=>item.id===id);
    if(!account)return;
    setCanDiscount(account.canDiscount);
    setMaxDiscountPercent(Number(account.maxDiscountPercent));
    setMaxDiscountAmount(Number(account.maxDiscountAmount));
    setSupervisor(account.role==="ADMIN"||account.supervisor);
    if(account.offlinePinExpiresAt)setOfflineDays(Math.max(1,Math.min(90,Math.ceil((Date.parse(account.offlinePinExpiresAt)-Date.now())/86_400_000))));
    setPinNeverExpires(account.hasOfflinePin&&!account.offlinePinExpiresAt);
  }

  async function createPairingCode(event:React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try { const response=await fetch("/api/pos/devices/pairing-codes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({branchId,registerId,neverExpires:pairNeverExpires})}); const result=await response.json(); if(!response.ok)throw new Error(result.error??"Pairing code could not be created."); setPairing({code:result.pairingCode,expiresAt:result.expiresAt}); }
    catch(e){setError(e instanceof Error?e.message:"Pairing code could not be created.");} finally{setBusy(false);}
  }
  async function saveAssignments(device:Device,form:HTMLFormElement) {
    const userIds=Array.from(form.querySelectorAll<HTMLInputElement>('input[name="cashier"]:checked')).map((input)=>input.value);
    setError("");
    const response=await fetch(`/api/pos/devices/${encodeURIComponent(device.id)}/cashiers`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({userIds})});
    const result=await response.json(); if(!response.ok)throw new Error(result.error??"Assignments could not be saved."); setNotice("Cashier assignments saved."); await load();
  }
  async function revoke(device:Device) {
    if(!window.confirm(`Revoke ${device.name}? This terminal will lose cloud access.`))return;
    const response=await fetch(`/api/pos/devices/${encodeURIComponent(device.id)}`,{method:"DELETE"});
    if(!response.ok)throw new Error("Device could not be revoked."); setNotice(`${device.name} was revoked.`); await load();
  }
  async function provisionPin(event:React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try { const response=await fetch(`/api/employees/${encodeURIComponent(selectedCashier)}/pos-auth`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin,offlineDays,neverExpires:pinNeverExpires,canDiscount,maxDiscountPercent,maxDiscountAmount,supervisor})}); const result=await response.json(); if(!response.ok)throw new Error(result.error??"PIN settings could not be saved."); setPin(""); setNotice(result.offlineExpiresAt?`Offline PIN set. It expires ${new Date(result.offlineExpiresAt).toLocaleString()}.`:"Offline PIN set with no expiration."); await load(); }
    catch(e){setError(e instanceof Error?e.message:"PIN settings could not be saved.");} finally{setBusy(false);}
  }
  const online=(device:Device)=>Boolean(clock&&device.lastHeartbeatAt&&clock-Date.parse(device.lastHeartbeatAt)<90_000);

  return <AppShell title="POS Devices" description="Pair terminals, manage cashier and administrator access, and provision offline PINs.">
    <div className="space-y-6">
      {(error||notice)&&<div className={`rounded-xl px-4 py-3 text-sm ${error?"bg-red-50 text-red-700":"bg-green-50 text-green-800"}`}>{error||notice}</div>}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><Plus size={19}/></span><div><h2 className="font-bold">Pair a terminal</h2><p className="text-xs text-muted">Codes are single-use. By default they expire after 10 minutes.</p></div></div>
          <form onSubmit={(event)=>void createPairingCode(event)} className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold">Branch<select className="input mt-1 w-full" value={branchId} onChange={(e)=>{setBranchId(e.target.value);setRegisterId(data.registers.find((x)=>x.branchId===e.target.value)?.id??"");}} required><option value="">Choose a branch</option>{data.branches.map((x)=><option key={x.id} value={x.id}>{x.name} · {x.code}</option>)}</select></label>
            <label className="text-xs font-semibold">Cash register<select className="input mt-1 w-full" value={registerId} onChange={(e)=>setRegisterId(e.target.value)} required><option value="">Choose a register</option>{registers.map((x)=><option key={x.id} value={x.id}>{x.name} · {x.number}</option>)}</select></label>
            <label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2"><input type="checkbox" checked={pairNeverExpires} onChange={(e)=>setPairNeverExpires(e.target.checked)}/>Pairing code never expires (single use)</label>
            <button className="btn-primary sm:col-span-2" disabled={busy||!registerId}><KeyRound size={16}/>Generate pairing code</button>
          </form>
          {pairing&&<div className="mt-4 rounded-xl border border-primary/20 bg-primary-soft p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-primary">Show this once on the POS terminal</p><div className="mt-2 flex items-center gap-3"><code className="text-xl font-bold tracking-[.2em]">{pairing.code}</code><button className="btn-secondary !h-9" onClick={()=>void navigator.clipboard.writeText(pairing.code)}><Copy size={14}/>Copy</button></div><p className="mt-2 text-xs text-muted">{pairing.expiresAt?`Expires ${new Date(pairing.expiresAt).toLocaleTimeString()}.`:"No expiration. The code remains single use."}</p></div>}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary"><ShieldCheck size={19}/></span><div><h2 className="font-bold">Cashier / admin offline PIN</h2><p className="text-xs text-muted">Set or change an account PIN and its offline policy. Admin accounts can open the local admin panel; their PIN is never returned.</p></div></div>
          <form onSubmit={(event)=>void provisionPin(event)} className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold sm:col-span-2">POS account<select className="input mt-1 w-full" value={selectedCashier} onChange={(e)=>selectPosAccount(e.target.value)} required><option value="">Choose an account</option>{data.cashiers.map((x)=><option key={x.id} value={x.id}>{x.role==="ADMIN"?"Admin":"Cashier"} · {x.name} · {x.email}</option>)}</select></label>
            {selectedAccount&&<p className="rounded-lg bg-primary-soft p-3 text-xs font-semibold sm:col-span-2">{selectedAccount.role==="ADMIN"?"Administrator PIN — use it in the cashier’s Admin panel.":"Cashier PIN — use it on the cashier sign-in screen."} {selectedAccount.hasOfflinePin?(selectedAccount.offlinePinExpiresAt?`Current PIN active until ${new Date(selectedAccount.offlinePinExpiresAt).toLocaleString()}. Enter a new PIN below to replace it.`:"Current PIN has no expiration. Enter a new PIN below to replace it."):"No offline PIN is currently set."}</p>}
            <label className="text-xs font-semibold">{selectedAccount?.hasOfflinePin?"New PIN (leave blank to keep current)":"New PIN"}<input className="input mt-1 w-full" value={pin} onChange={(e)=>setPin(e.target.value)} inputMode="numeric" type="password" pattern="[0-9]{4,12}" minLength={4} maxLength={12} required={!selectedAccount?.hasOfflinePin}/></label>
            <label className="text-xs font-semibold">Offline validity (days)<input className="input mt-1 w-full" type="number" min={1} max={90} value={offlineDays} disabled={pinNeverExpires} onChange={(e)=>setOfflineDays(Number(e.target.value))}/></label>
            <label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2"><input type="checkbox" checked={pinNeverExpires} onChange={(e)=>setPinNeverExpires(e.target.checked)}/>Offline PIN never expires</label>
            <label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2"><input type="checkbox" checked={canDiscount} onChange={(e)=>setCanDiscount(e.target.checked)}/>Allow discounts</label>
            {canDiscount&&<><label className="text-xs font-semibold">Max discount percent<input className="input mt-1 w-full" type="number" min={0} max={100} step="0.01" value={maxDiscountPercent} onChange={(e)=>setMaxDiscountPercent(Number(e.target.value))}/></label><label className="text-xs font-semibold">Max discount amount (ILS)<input className="input mt-1 w-full" type="number" min={0} step="0.01" value={maxDiscountAmount} onChange={(e)=>setMaxDiscountAmount(Number(e.target.value))}/></label></>}
            {selectedAccount?.role==="ADMIN"?<p className="text-xs font-semibold text-primary sm:col-span-2">Administrator status is enforced for local admin access.</p>:<label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2"><input type="checkbox" checked={supervisor} onChange={(e)=>setSupervisor(e.target.checked)}/>May approve supervisor overrides</label>}
            <button className="btn-primary sm:col-span-2" disabled={busy||!selectedCashier||(pin.length>0&&pin.length<4)}><KeyRound size={16}/>{selectedAccount?.hasOfflinePin&&!pin?"Save policy changes":"Save PIN and policy"}</button>
          </form>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-bold">Registered terminals</h2><p className="mt-1 text-xs text-muted">Revoking a terminal immediately invalidates its device tokens.</p></div><button className="btn-secondary !h-9" onClick={()=>void load()}><RefreshCw size={14}/>Refresh</button></div>
        {!data.devices.length?<div className="p-10 text-center text-sm text-muted"><MonitorSmartphone className="mx-auto mb-3"/><p>No POS terminals registered.</p></div>:<div className="divide-y divide-border">{data.devices.map((device)=><div className="p-5" key={device.id}><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className={`size-2 rounded-full ${device.active&&online(device)?"bg-green-500":"bg-amber-500"}`}/><div><h3 className="font-semibold">{device.name}</h3><p className="mt-1 text-xs text-muted">{device.branch.name} · {device.register?.name??"No register"} {device.register?.number??""} · Last seen {device.lastHeartbeatAt?new Date(device.lastHeartbeatAt).toLocaleString():"never"}</p></div></div>{device.active?<button className="btn-secondary !h-9 !text-red-700" onClick={()=>void revoke(device).catch(e=>setError(e.message))}><Trash2 size={14}/>Revoke</button>:<span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">Revoked</span>}</div>
          {device.active&&<details className="mt-4"><summary className="cursor-pointer text-xs font-semibold text-primary">Assign POS accounts ({device.assignments.filter((x)=>x.active).length})</summary><form className="mt-3 rounded-xl bg-background p-4" onSubmit={(event)=>{event.preventDefault();void saveAssignments(device,event.currentTarget).catch(e=>setError(e.message));}}><div className="grid gap-2 sm:grid-cols-2">{data.cashiers.filter((x)=>x.branchId===device.branchId||(x.role==="ADMIN"&&!x.branchId)).map((account)=><label key={account.id} className="flex items-center gap-2 text-xs"><input name="cashier" type="checkbox" value={account.id} defaultChecked={device.assignments.some((x)=>x.active&&x.user.id===account.id)}/><span>{account.role==="ADMIN"?"Admin":"Cashier"} · {account.name}<small className="ms-1 text-muted">{account.hasOfflinePin?"PIN set":"PIN missing"}</small></span></label>)}</div><button className="btn-primary mt-4 !h-9">Save assignments</button></form></details>}
        </div>)}</div>}
      </section>
    </div>
  </AppShell>;
}
