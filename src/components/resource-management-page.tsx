"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Edit3, MoreHorizontal, Plus, Store, Trash2, UserRound, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageToolbar, Pagination, StatusBadge } from "@/components/ui";
import { useLanguage } from "@/components/language-provider";

export type ResourceKind="categories"|"discounts"|"employees";
type Category={id:string;nameEn:string;nameAr:string;sortOrder:number;active:boolean;_count?:{products:number}};
type Campaign={id:string;nameEn:string;nameAr:string;type:"FIXED"|"PERCENTAGE";value:string|number;startsAt:string;endsAt:string;active:boolean;products:{id:string}[];categories:{id:string;nameEn:string;nameAr:string}[]};
type Employee={id:string;name:string;email:string;active:boolean;branch:{id:string;name:string;nameAr:string}|null};
type Resource=Category|Campaign|Employee;
type Branch={id:string;name:string;nameAr:string};

const PAGE_SIZE=8;

export function ResourceManagementPage({kind}:{kind:ResourceKind}){
  const {t,locale}=useLanguage();
  const [rows,setRows]=useState<Resource[]>([]);
  const [search,setSearchState]=useState("");
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [editing,setEditing]=useState<Resource|null>(null);
  const [creating,setCreating]=useState(false);
  const copy=locale==="ar"?{
    descriptions:{categories:"إدارة تصنيفات قائمة الطعام",discounts:"إدارة العروض والحملات",employees:"إدارة الموظفين وحساباتهم"},
    load:"جارٍ تحميل البيانات…",empty:"لا توجد نتائج.",loadError:"تعذر تحميل البيانات.",saveError:"تعذر حفظ التغييرات.",deleteError:"تعذر حذف السجل.",confirm:"هل تريد حذف هذا السجل؟",
    sort:"ترتيب العرض",campaign:"الحملة",typeValue:"النوع / القيمة",scope:"ينطبق على",period:"الفترة",account:"حساب الموظف",more:"المزيد من الإجراءات",edit:"تعديل",remove:"حذف",
  }:{
    descriptions:{categories:"Manage menu categories",discounts:"Manage offers and campaigns",employees:"Manage employees and accounts"},
    load:"Loading data…",empty:"No results found.",loadError:"The data could not be loaded.",saveError:"The changes could not be saved.",deleteError:"The record could not be deleted.",confirm:"Delete this record?",
    sort:"Sort order",campaign:"Campaign",typeValue:"Type / value",scope:"Applies to",period:"Period",account:"Employee account",more:"More actions",edit:"Edit",remove:"Delete",
  };
  const titles={categories:t("categories"),discounts:t("discounts"),employees:t("employees")};
  const addLabels={categories:t("addCategory"),discounts:t("addDiscount"),employees:t("addEmployee")};
  async function load(){
    setLoading(true);setError("");
    try{const response=await fetch(`/api/${kind}`);if(!response.ok)throw new Error();setRows(await response.json());}
    catch{setError(copy.loadError);}finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[kind]);// eslint-disable-line react-hooks/exhaustive-deps
  const filtered=useMemo(()=>rows.filter(row=>searchText(row).toLowerCase().includes(search.toLowerCase())),[rows,search]);
  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const visible=filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
  const setSearch=(value:string)=>{setSearchState(value);setPage(1)};
  async function remove(row:Resource){
    if(!window.confirm(copy.confirm))return;
    const response=await fetch(`/api/${kind}/${row.id}`,{method:"DELETE"});
    if(!response.ok){setError(copy.deleteError);return;}
    if(kind==="employees")setRows(old=>old.map(item=>item.id===row.id?{...item,active:false}:item));
    else setRows(old=>old.filter(item=>item.id!==row.id));
  }
  async function toggle(row:Resource){
    const response=await fetch(`/api/${kind}/${row.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({active:!row.active})});
    if(!response.ok){setError(copy.saveError);return;}
    setRows(old=>old.map(item=>item.id===row.id?{...item,active:!row.active}:item));
  }
  const branches=useMemo(()=>Array.from(new Map((rows as Employee[]).map(row=>row.branch).filter((branch):branch is Branch=>Boolean(branch)).map(branch=>[branch.id,branch])).values()),[rows]);
  return <AppShell title={titles[kind]} description={copy.descriptions[kind]} action={<button type="button" onClick={()=>setCreating(true)} className="btn-primary flex items-center gap-2"><Plus size={17}/><span className="hidden sm:inline">{addLabels[kind]}</span></button>}>
    <PageToolbar search={search} setSearch={setSearch}/>
    {error&&<div role="alert" className="mb-4 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
    <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[720px]"><thead className="bg-background text-muted text-xs uppercase tracking-wide"><tr>{kind==="categories"&&<><th className="p-4 text-start">{t("category")}</th><th className="p-4 text-start">{t("products")}</th><th className="p-4 text-start">{copy.sort}</th></>}{kind==="discounts"&&<><th className="p-4 text-start">{copy.campaign}</th><th className="p-4 text-start">{copy.typeValue}</th><th className="p-4 text-start">{copy.scope}</th><th className="p-4 text-start">{copy.period}</th></>}{kind==="employees"&&<><th className="p-4 text-start">{t("employee")}</th><th className="p-4 text-start">{t("email")}</th><th className="p-4 text-start">{t("branch")}</th></>}<th className="p-4 text-start">{t("status")}</th><th className="p-4 text-end">{t("actions")}</th></tr></thead><tbody>
      {loading&&<tr><td className="p-8 text-center text-muted" colSpan={6}>{copy.load}</td></tr>}
      {!loading&&!visible.length&&<tr><td className="p-8 text-center text-muted" colSpan={6}>{copy.empty}</td></tr>}
      {!loading&&kind==="categories"&&(visible as Category[]).map(row=><tr key={row.id} className="border-t border-border hover:bg-background/60"><td className="p-4"><b>{locale==="ar"?row.nameAr:row.nameEn}</b><small className="text-muted block">{locale==="ar"?row.nameEn:row.nameAr}</small></td><td className="p-4">{row._count?.products??0} {t("items")}</td><td className="p-4">#{row.sortOrder}</td><StatusCell row={row} toggle={toggle}/><RowActions edit={()=>setEditing(row)} remove={()=>void remove(row)} labels={copy}/></tr>)}
      {!loading&&kind==="discounts"&&(visible as Campaign[]).map(row=><tr key={row.id} className="border-t border-border hover:bg-background/60"><td className="p-4"><b>{locale==="ar"?row.nameAr:row.nameEn}</b><small className="text-muted block">{locale==="ar"?row.nameEn:row.nameAr}</small></td><td className="p-4"><b>{row.type==="PERCENTAGE"?`${Number(row.value)}%`:`₪ ${Number(row.value).toFixed(2)}`}</b><small className="text-muted block">{row.type==="PERCENTAGE"?(locale==="ar"?"نسبة مئوية":"Percentage"):(locale==="ar"?"مبلغ ثابت":"Fixed")}</small></td><td className="p-4">{row.categories.length||row.products.length?`${row.categories.length+row.products.length} ${t("items")}`:(locale==="ar"?"كل المنتجات":"All products")}</td><td className="p-4"><span className="flex gap-2 items-center"><CalendarDays size={15} className="text-muted"/>{formatDate(row.startsAt,locale)} – {formatDate(row.endsAt,locale)}</span></td><StatusCell row={row} toggle={toggle}/><RowActions edit={()=>setEditing(row)} remove={()=>void remove(row)} labels={copy}/></tr>)}
      {!loading&&kind==="employees"&&(visible as Employee[]).map(row=><tr key={row.id} className="border-t border-border hover:bg-background/60"><td className="p-4"><div className="flex gap-3 items-center"><span className="size-10 rounded-full bg-secondary text-white grid place-items-center text-xs font-bold">{initials(row.name)}</span><b>{row.name}</b></div></td><td className="p-4 text-muted">{row.email}</td><td className="p-4"><span className="flex gap-2"><Store size={16} className="text-muted"/>{locale==="ar"?row.branch?.nameAr:row.branch?.name}</span></td><StatusCell row={row} toggle={toggle}/><RowActions edit={()=>setEditing(row)} remove={()=>void remove(row)} labels={copy}/></tr>)}
    </tbody></table></div></div>
    <Pagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage}/>
    {(editing||creating)&&<ResourceModal kind={kind} row={editing} branches={branches} close={()=>{setEditing(null);setCreating(false)}} saved={()=>{setEditing(null);setCreating(false);void load()}}/>}
  </AppShell>;
}

function StatusCell({row,toggle}:{row:Resource;toggle:(row:Resource)=>Promise<void>}){return <td className="p-4"><button type="button" onClick={()=>void toggle(row)}><StatusBadge active={row.active}/></button></td>}
function RowActions({edit,remove,labels}:{edit:()=>void;remove:()=>void;labels:{edit:string;remove:string;more:string}}){
  const [open,setOpen]=useState(false);
  return <td className="p-4"><div className="flex justify-end gap-1 relative"><button type="button" onClick={edit} aria-label={labels.edit} className="size-9 rounded-lg hover:bg-primary-soft text-muted hover:text-primary grid place-items-center"><Edit3 size={16}/></button><button type="button" onClick={remove} aria-label={labels.remove} className="size-9 rounded-lg hover:bg-danger/10 text-muted hover:text-danger grid place-items-center"><Trash2 size={16}/></button><button type="button" onClick={()=>setOpen(value=>!value)} aria-label={labels.more} aria-expanded={open} className="size-9 grid place-items-center text-muted"><MoreHorizontal size={18}/></button>{open&&<div className="absolute end-0 top-10 z-10 min-w-32 rounded-xl border border-border bg-surface p-1 shadow-xl"><button type="button" onClick={()=>{setOpen(false);edit()}} className="w-full px-3 py-2 rounded-lg text-start text-sm hover:bg-background flex items-center gap-2"><Edit3 size={14}/>{labels.edit}</button><button type="button" onClick={()=>{setOpen(false);remove()}} className="w-full px-3 py-2 rounded-lg text-start text-sm text-danger hover:bg-danger/10 flex items-center gap-2"><Trash2 size={14}/>{labels.remove}</button></div>}</div></td>;
}

function ResourceModal({kind,row,branches,close,saved}:{kind:ResourceKind;row:Resource|null;branches:Branch[];close:()=>void;saved:()=>void}){
  const {t,locale}=useLanguage();const editing=Boolean(row);const [saving,setSaving]=useState(false);const [error,setError]=useState("");
  const category=row as Category|null;const campaign=row as Campaign|null;const employee=row as Employee|null;
  const [form,setForm]=useState({nameEn:category?.nameEn??campaign?.nameEn??"",nameAr:category?.nameAr??campaign?.nameAr??"",sortOrder:String(category?.sortOrder??0),active:row?.active??true,type:campaign?.type??"PERCENTAGE",value:String(campaign?.value??""),startsAt:dateInput(campaign?.startsAt),endsAt:dateInput(campaign?.endsAt),name:employee?.name??"",email:employee?.email??"",password:"",branchId:employee?.branch?.id??branches[0]?.id??""});
  const c=locale==="ar"?{title:editing?"تعديل السجل":"إضافة سجل",nameEn:"الاسم بالإنجليزية",nameAr:"الاسم بالعربية",sort:"ترتيب العرض",type:"نوع الخصم",value:"القيمة",start:"تاريخ البداية",end:"تاريخ النهاية",name:"اسم الموظف",password:"كلمة المرور",cancel:"إلغاء",saving:"جارٍ الحفظ…",failed:"تعذر حفظ البيانات."}:{title:editing?"Edit record":"Add record",nameEn:"English name",nameAr:"Arabic name",sort:"Sort order",type:"Discount type",value:"Value",start:"Start date",end:"End date",name:"Employee name",password:"Password",cancel:"Cancel",saving:"Saving…",failed:"The record could not be saved."};
  async function submit(event:React.FormEvent){event.preventDefault();setSaving(true);setError("");let body:Record<string,unknown>={active:form.active};if(kind==="categories")body={...body,nameEn:form.nameEn,nameAr:form.nameAr,sortOrder:Number(form.sortOrder)};if(kind==="discounts")body={...body,nameEn:form.nameEn,nameAr:form.nameAr,type:form.type,value:Number(form.value),startsAt:new Date(form.startsAt).toISOString(),endsAt:new Date(form.endsAt).toISOString(),...(editing?{}:{productIds:[],categoryIds:[]})};if(kind==="employees")body={...body,name:form.name,email:form.email,branchId:form.branchId,...(!editing?{password:form.password}:{})};const response=await fetch(row?`/api/${kind}/${row.id}`:`/api/${kind}`,{method:row?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});if(!response.ok){const data=await response.json().catch(()=>null);setError(data?.error??c.failed);setSaving(false);return;}saved();}
  return <div className="fixed inset-0 z-50 bg-text/50 grid place-items-center p-4" onMouseDown={close}><form onSubmit={submit} className="card w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto p-6 shadow-2xl" onMouseDown={event=>event.stopPropagation()}><div className="flex items-center gap-3"><div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center">{kind==="employees"?<UserRound/>:<Edit3/>}</div><h2 className="font-bold text-xl">{c.title}</h2><button type="button" onClick={close} className="ms-auto size-9 grid place-items-center"><X size={18}/></button></div>{error&&<div role="alert" className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}<div className="grid sm:grid-cols-2 gap-4 mt-6">{kind!=="employees"&&<><Field label={c.nameEn}><input required minLength={2} className="input" value={form.nameEn} onChange={e=>setForm({...form,nameEn:e.target.value})}/></Field><Field label={c.nameAr}><input required minLength={2} dir="rtl" className="input" value={form.nameAr} onChange={e=>setForm({...form,nameAr:e.target.value})}/></Field></>}{kind==="categories"&&<Field label={c.sort}><input required type="number" className="input" value={form.sortOrder} onChange={e=>setForm({...form,sortOrder:e.target.value})}/></Field>}{kind==="discounts"&&<><Field label={c.type}><select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value as "FIXED"|"PERCENTAGE"})}><option value="PERCENTAGE">{locale==="ar"?"نسبة مئوية":"Percentage"}</option><option value="FIXED">{locale==="ar"?"مبلغ ثابت":"Fixed"}</option></select></Field><Field label={c.value}><input required min="0.01" step="0.01" type="number" className="input" value={form.value} onChange={e=>setForm({...form,value:e.target.value})}/></Field><Field label={c.start}><input required type="date" className="input" value={form.startsAt} onChange={e=>setForm({...form,startsAt:e.target.value})}/></Field><Field label={c.end}><input required type="date" className="input" value={form.endsAt} onChange={e=>setForm({...form,endsAt:e.target.value})}/></Field></>}{kind==="employees"&&<><Field label={c.name}><input required minLength={2} className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field><Field label={t("email")}><input required type="email" className="input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field>{!editing&&<Field label={c.password}><input required minLength={8} type="password" className="input" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></Field>}<Field label={t("branch")}><select required className="input" value={form.branchId} onChange={e=>setForm({...form,branchId:e.target.value})}>{branches.map(branch=><option key={branch.id} value={branch.id}>{locale==="ar"?branch.nameAr:branch.name}</option>)}</select></Field></>}<label className="flex items-center gap-3 self-end h-11"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/><span className="text-sm font-bold">{t("active")}</span></label></div><div className="flex justify-end gap-2 mt-7"><button type="button" onClick={close} className="btn-secondary">{c.cancel}</button><button disabled={saving} className="btn-primary">{saving?c.saving:t("save")}</button></div></form></div>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label><span className="text-xs font-bold block mb-2">{label}</span>{children}</label>}
function searchText(row:Resource){return "name" in row?`${row.name} ${row.email}`:`${row.nameEn} ${row.nameAr}`}
function initials(name:string){return name.split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase()}
function dateInput(value?:string){return value?new Date(value).toISOString().slice(0,10):new Date().toISOString().slice(0,10)}
function formatDate(value:string,locale:"en"|"ar"){return new Intl.DateTimeFormat(locale==="ar"?"ar-PS":"en",{month:"short",day:"numeric",year:"numeric"}).format(new Date(value))}
