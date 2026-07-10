"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CirclePercent, Edit3, MoreHorizontal, Plus, Store, Trash2, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageToolbar, Pagination, StatusBadge } from "@/components/ui";
import { useLanguage } from "@/components/language-provider";
import { products as seedProducts } from "@/lib/demo-data";
import { ResourceManagementPage } from "@/components/resource-management-page";

type Kind="products"|"categories"|"discounts"|"employees";
const categories=[{name:"Burgers",ar:"برغر",products:8,order:1,active:true},{name:"Pizza",ar:"بيتزا",products:6,order:2,active:true},{name:"Bowls",ar:"أطباق",products:5,order:3,active:true},{name:"Sides",ar:"إضافات",products:7,order:4,active:true},{name:"Drinks",ar:"مشروبات",products:12,order:5,active:true},{name:"Desserts",ar:"حلويات",products:4,order:6,active:false}];
const campaigns=[{name:"Lunch Hour",ar:"ساعة الغداء",type:"Percentage",value:"15%",scope:"Burgers + Bowls",period:"Jul 1 – Jul 31",active:true},{name:"Coffee Pair",ar:"عرض القهوة",type:"Fixed",value:"₪ 1.50",scope:"Drinks",period:"Jul 3 – Aug 3",active:true},{name:"Weekend Pizza",ar:"بيتزا نهاية الأسبوع",type:"Percentage",value:"10%",scope:"Pizza",period:"Jun 1 – Jun 30",active:false}];
const employees=[{name:"Omar Khalil",email:"omar@noura.test",shift:"Morning",branch:"Main Branch",sales:"₪ 482.50",active:true,initials:"OK"},{name:"Lina Saad",email:"lina@noura.test",shift:"Evening",branch:"Main Branch",sales:"₪ 391.25",active:true,initials:"LS"},{name:"Yousef Ali",email:"yousef@noura.test",shift:"Morning",branch:"Garden Branch",sales:"₪ 276.00",active:true,initials:"YA"},{name:"Rana Odeh",email:"rana@noura.test",shift:"Evening",branch:"Main Branch",sales:"₪ 0.00",active:false,initials:"RO"}];

type ProductRow={id:string;sku:string;nameEn:string;nameAr:string;descriptionEn:string;descriptionAr:string;price:number;categoryId:string;category:string;categoryAr:string;active:boolean};
type CategoryOption={id:string;nameEn:string;nameAr:string};
type ProductForm={sku:string;nameEn:string;nameAr:string;descriptionEn:string;descriptionAr:string;price:string;categoryId:string;active:boolean};

export default function ManagementPage({kind}:{kind:Kind}){
  if(kind==="products")return <ProductsManagementPage/>;
  return <ResourceManagementPage kind={kind}/>;
}

function ProductsManagementPage(){
  const {t,locale}=useLanguage();
  const [search,setSearch]=useState("");
  const [products,setProducts]=useState<ProductRow[]>([]);
  const [categoryOptions,setCategoryOptions]=useState<CategoryOption[]>([]);
  const [editing,setEditing]=useState<ProductRow|null>(null);
  const [creating,setCreating]=useState(false);
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const copy=locale==="ar"?{
    description:"إدارة المنتجات والأسعار والتصنيفات",
    sku:"رمز المنتج",loading:"جارٍ تحميل المنتجات…",empty:"لا توجد منتجات.",loadError:"تعذر تحميل المنتجات.",
    updateError:"تعذر حفظ تعديلات المنتج.",deleteConfirm:"هل تريد حذف هذا المنتج؟",deleteError:"تعذر حذف المنتج.",more:"المزيد من الإجراءات",edit:"تعديل",remove:"حذف",
  }:{
    description:"Manage products, prices, and categories",
    sku:"SKU",loading:"Loading products…",empty:"No products found.",loadError:"Products could not be loaded.",
    updateError:"The product changes could not be saved.",deleteConfirm:"Delete this product?",deleteError:"The product could not be deleted.",more:"More actions",edit:"Edit",remove:"Delete",
  };

  async function loadProducts(){
    setLoading(true);setError("");
    try{
      const [productResponse,categoryResponse]=await Promise.all([fetch("/api/products"),fetch("/api/categories")]);
      if(!productResponse.ok||!categoryResponse.ok)throw new Error("load");
      const [productData,categoryData]=await Promise.all([productResponse.json(),categoryResponse.json()]);
      setCategoryOptions(categoryData.map((item:CategoryOption)=>({id:item.id,nameEn:item.nameEn,nameAr:item.nameAr})));
      setProducts(productData.map((item:{id:string;sku:string;price:string|number;active:boolean;categoryId:string;category:CategoryOption;translations:{locale:string;name:string;description?:string|null}[]})=>{
        const en=item.translations.find(x=>x.locale==="en");
        const ar=item.translations.find(x=>x.locale==="ar");
        return {id:item.id,sku:item.sku,price:Number(item.price),active:item.active,categoryId:item.categoryId,category:item.category.nameEn,categoryAr:item.category.nameAr,nameEn:en?.name??item.sku,nameAr:ar?.name??en?.name??item.sku,descriptionEn:en?.description??"",descriptionAr:ar?.description??""};
      }));
    }catch{setError(copy.loadError);}finally{setLoading(false);}
  }
  useEffect(()=>{void loadProducts();},[]);// eslint-disable-line react-hooks/exhaustive-deps

  const filtered=useMemo(()=>products.filter(product=>(product.nameEn+product.nameAr+product.sku).toLowerCase().includes(search.toLowerCase())),[products,search]);
  const totalPages=Math.max(1,Math.ceil(filtered.length/8));
  const visible=filtered.slice((page-1)*8,page*8);
  async function toggleStatus(product:ProductRow){
    const response=await fetch(`/api/products/${product.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({active:!product.active})});
    if(!response.ok){setError(copy.updateError);return;}
    setProducts(old=>old.map(item=>item.id===product.id?{...item,active:!item.active}:item));
  }
  async function deleteProduct(product:ProductRow){
    if(!window.confirm(copy.deleteConfirm))return;
    const response=await fetch(`/api/products/${product.id}`,{method:"DELETE"});
    if(!response.ok){setError(copy.deleteError);return;}
    setProducts(old=>old.filter(item=>item.id!==product.id));
  }
  return <AppShell title={t("products")} description={copy.description} action={<button onClick={()=>setCreating(true)} className="btn-primary flex items-center gap-2"><Plus size={17}/><span className="hidden sm:inline">{t("addProduct")}</span></button>}>
    <PageToolbar search={search} setSearch={value=>{setSearch(value);setPage(1)}}><select className="input !w-auto"><option>{t("allCategories")}</option>{categoryOptions.map(category=><option key={category.id}>{locale==="ar"?category.nameAr:category.nameEn}</option>)}</select></PageToolbar>
    {error&&<div className="mb-4 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">{error}</div>}
    <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[720px]"><thead className="bg-background text-muted text-xs uppercase tracking-wide"><tr><th className="p-4 text-start">{t("products")}</th><th className="p-4 text-start">{copy.sku}</th><th className="p-4 text-start">{t("category")}</th><th className="p-4 text-start">{t("price")}</th><th className="p-4 text-start">{t("status")}</th><th className="p-4 text-end">{t("actions")}</th></tr></thead><tbody>
      {loading&&<tr><td colSpan={6} className="p-8 text-center text-muted">{copy.loading}</td></tr>}
      {!loading&&filtered.length===0&&<tr><td colSpan={6} className="p-8 text-center text-muted">{copy.empty}</td></tr>}
      {!loading&&visible.map(product=><tr key={product.id} className="border-t border-border hover:bg-background/60"><td className="p-4"><div className="flex items-center gap-3"><div className="size-12 rounded-xl bg-background grid place-items-center text-2xl">🍽️</div><div><b>{locale==="ar"?product.nameAr:product.nameEn}</b><small className="block text-muted max-w-48 truncate">{locale==="ar"?product.descriptionAr:product.descriptionEn}</small></div></div></td><td className="p-4 text-muted">{product.sku}</td><td className="p-4">{locale==="ar"?product.categoryAr:product.category}</td><td className="p-4 font-bold">₪ {product.price.toFixed(2)}</td><td className="p-4"><button type="button" onClick={()=>void toggleStatus(product)} aria-label={`${t("status")}: ${product.active?t("active"):t("inactive")}`}><StatusBadge active={product.active}/></button></td><ProductActions edit={()=>setEditing(product)} remove={()=>void deleteProduct(product)} labels={copy}/></tr>)}
    </tbody></table></div></div>
    <Pagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={8} onPageChange={setPage}/>
    {(editing||creating)&&<ProductModal product={editing} categories={categoryOptions} close={()=>{setEditing(null);setCreating(false);}} saved={()=>{setEditing(null);setCreating(false);void loadProducts();}}/>}
  </AppShell>;
}
function ProductActions({edit,remove,labels}:{edit:()=>void;remove:()=>void;labels:{edit:string;remove:string;more:string}}){const [open,setOpen]=useState(false);return <td className="p-4"><div className="flex justify-end gap-1 relative"><button type="button" onClick={edit} aria-label={labels.edit} className="size-9 rounded-lg hover:bg-primary-soft text-muted hover:text-primary grid place-items-center"><Edit3 size={16}/></button><button type="button" onClick={remove} aria-label={labels.remove} className="size-9 rounded-lg hover:bg-danger/10 text-muted hover:text-danger grid place-items-center"><Trash2 size={16}/></button><button type="button" onClick={()=>setOpen(value=>!value)} aria-label={labels.more} aria-expanded={open} className="size-9 grid place-items-center text-muted"><MoreHorizontal size={18}/></button>{open&&<div className="absolute end-0 top-10 z-10 min-w-32 rounded-xl border border-border bg-surface p-1 shadow-xl"><button type="button" onClick={()=>{setOpen(false);edit()}} className="w-full px-3 py-2 rounded-lg text-start text-sm hover:bg-background flex items-center gap-2"><Edit3 size={14}/>{labels.edit}</button><button type="button" onClick={()=>{setOpen(false);remove()}} className="w-full px-3 py-2 rounded-lg text-start text-sm text-danger hover:bg-danger/10 flex items-center gap-2"><Trash2 size={14}/>{labels.remove}</button></div>}</div></td>}

function ProductModal({product,categories,close,saved}:{product:ProductRow|null;categories:CategoryOption[];close:()=>void;saved:()=>void}){
  const {t,locale}=useLanguage();
  const [form,setForm]=useState<ProductForm>({sku:product?.sku??"",nameEn:product?.nameEn??"",nameAr:product?.nameAr??"",descriptionEn:product?.descriptionEn??"",descriptionAr:product?.descriptionAr??"",price:product?String(product.price):"",categoryId:product?.categoryId??categories[0]?.id??"",active:product?.active??true});
  const [saving,setSaving]=useState(false);const [error,setError]=useState("");
  const c=locale==="ar"?{title:product?"تعديل المنتج":"إضافة منتج",subtitle:"بيانات المنتج بالعربية والإنجليزية",nameEn:"الاسم بالإنجليزية",nameAr:"الاسم بالعربية",descriptionEn:"الوصف بالإنجليزية",descriptionAr:"الوصف بالعربية",sku:"رمز المنتج",cancel:"إلغاء",saving:"جارٍ الحفظ…",failed:"تعذر حفظ المنتج. تحقق من البيانات وحاول مجدداً."}:{title:product?"Edit product":"Add product",subtitle:"Product details in English and Arabic",nameEn:"English name",nameAr:"Arabic name",descriptionEn:"English description",descriptionAr:"Arabic description",sku:"SKU",cancel:"Cancel",saving:"Saving…",failed:"The product could not be saved. Check the fields and try again."};
  async function submit(event:React.FormEvent){
    event.preventDefault();setSaving(true);setError("");
    const response=await fetch(product?`/api/products/${product.id}`:"/api/products",{method:product?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,price:Number(form.price)})});
    if(!response.ok){const body=await response.json().catch(()=>null);setError(body?.error??c.failed);setSaving(false);return;}
    saved();
  }
  return <div className="fixed inset-0 z-50 bg-text/50 grid place-items-center p-4" onMouseDown={close}><form onSubmit={submit} className="card w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6 shadow-2xl" onMouseDown={event=>event.stopPropagation()}><div className="flex items-center gap-3"><div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center"><Edit3/></div><div><h2 className="font-bold text-xl">{c.title}</h2><p className="text-muted text-sm">{c.subtitle}</p></div></div>{error&&<div className="mt-4 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">{error}</div>}<div className="grid sm:grid-cols-2 gap-4 mt-6"><Field label={c.nameEn}><input required minLength={2} className="input" value={form.nameEn} onChange={e=>setForm({...form,nameEn:e.target.value})}/></Field><Field label={c.nameAr}><input required minLength={2} dir="rtl" className="input" value={form.nameAr} onChange={e=>setForm({...form,nameAr:e.target.value})}/></Field><Field label={c.descriptionEn}><textarea className="input min-h-24 py-3" value={form.descriptionEn} onChange={e=>setForm({...form,descriptionEn:e.target.value})}/></Field><Field label={c.descriptionAr}><textarea dir="rtl" className="input min-h-24 py-3" value={form.descriptionAr} onChange={e=>setForm({...form,descriptionAr:e.target.value})}/></Field><Field label={c.sku}><input required minLength={2} className="input" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/></Field><Field label={t("price")}><input required min="0.01" step="0.01" type="number" className="input" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></Field><Field label={t("category")}><select required className="input" value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})}>{categories.map(category=><option key={category.id} value={category.id}>{locale==="ar"?category.nameAr:category.nameEn}</option>)}</select></Field><label className="flex items-center gap-3 self-end h-11"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/><span className="text-sm font-bold">{t("active")}</span></label></div><div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-7"><button type="button" onClick={close} className="btn-secondary">{c.cancel}</button><button disabled={saving} className="btn-primary disabled:opacity-60">{saving?c.saving:t("save")}</button></div></form></div>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label><span className="text-xs font-bold block mb-2">{label}</span>{children}</label>}

// Retained temporarily for compatibility with the original demo fixtures; active routes use ResourceManagementPage.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LegacyManagementPage({kind}:{kind:Kind}){const {t,locale}=useLanguage();const [search,setSearch]=useState("");const [modal,setModal]=useState(false);const [products,setProducts]=useState(seedProducts);const titles={products:t("products"),categories:t("categories"),discounts:t("discounts"),employees:t("employees")};const addLabels={products:t("addProduct"),categories:t("addCategory"),discounts:t("addDiscount"),employees:t("addEmployee")};const filtered=useMemo(()=>products.filter(p=>(p.nameEn+p.nameAr).toLowerCase().includes(search.toLowerCase())),[products,search]);
  const action=<button onClick={()=>setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={17}/><span className="hidden sm:inline">{addLabels[kind]}</span></button>;
  return <AppShell title={titles[kind]} description={`Manage your ${kind} across all branches`} action={action}><PageToolbar search={search} setSearch={setSearch}><select className="input !w-auto"><option>{t("allBranches")}</option><option>Main Branch</option><option>Garden Branch</option></select></PageToolbar>
    <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm min-w-[720px]"><thead className="bg-background text-muted text-xs uppercase tracking-wide"><tr>{kind==="products"&&<><th className="p-4 text-start">{t("products")}</th><th className="p-4 text-start">SKU</th><th className="p-4 text-start">{t("category")}</th><th className="p-4 text-start">{t("price")}</th></>}{kind==="categories"&&<><th className="p-4 text-start">{t("category")}</th><th className="p-4 text-start">{t("products")}</th><th className="p-4 text-start">Sort order</th></>}{kind==="discounts"&&<><th className="p-4 text-start">Campaign</th><th className="p-4 text-start">Type / Value</th><th className="p-4 text-start">Applies to</th><th className="p-4 text-start">Period</th></>}{kind==="employees"&&<><th className="p-4 text-start">{t("employee")}</th><th className="p-4 text-start">Shift</th><th className="p-4 text-start">{t("branch")}</th><th className="p-4 text-start">Today</th></>}<th className="p-4 text-start">{t("status")}</th><th className="p-4 text-end">{t("actions")}</th></tr></thead><tbody>
      {kind==="products"&&filtered.map(p=><tr key={p.id} className="border-t border-border hover:bg-background/60"><td className="p-4"><div className="flex items-center gap-3"><div className="size-12 rounded-xl bg-background grid place-items-center text-2xl">{p.emoji}</div><div><b>{locale==="ar"?p.nameAr:p.nameEn}</b><small className="block text-muted max-w-48 truncate">{locale==="ar"?p.descriptionAr:p.descriptionEn}</small></div></div></td><td className="p-4 text-muted">{`PRD-00${p.id.slice(1)}`}</td><td className="p-4">{locale==="ar"?p.categoryAr:p.category}</td><td className="p-4 font-bold">₪ {p.price.toFixed(2)}</td><td className="p-4"><button onClick={()=>setProducts(old=>old.map(x=>x.id===p.id?{...x,active:!x.active}:x))}><StatusBadge active={p.active}/></button></td><Actions/></tr>)}
      {kind==="categories"&&categories.filter(x=>x.name.toLowerCase().includes(search.toLowerCase())).map(c=><tr key={c.name} className="border-t border-border"><td className="p-4"><b>{locale==="ar"?c.ar:c.name}</b><small className="text-muted block">{c.name} · {c.ar}</small></td><td className="p-4">{c.products} {t("items")}</td><td className="p-4">#{c.order}</td><td className="p-4"><StatusBadge active={c.active}/></td><Actions/></tr>)}
      {kind==="discounts"&&campaigns.filter(x=>x.name.toLowerCase().includes(search.toLowerCase())).map(c=><tr key={c.name} className="border-t border-border"><td className="p-4"><div className="flex gap-3 items-center"><span className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center"><CirclePercent size={20}/></span><div><b>{locale==="ar"?c.ar:c.name}</b><small className="block text-muted">{c.name} · {c.ar}</small></div></div></td><td className="p-4"><b>{c.value}</b><small className="block text-muted">{c.type}</small></td><td className="p-4">{c.scope}</td><td className="p-4"><span className="flex gap-2 items-center"><CalendarDays size={15} className="text-muted"/>{c.period}</span></td><td className="p-4"><StatusBadge active={c.active}/></td><Actions/></tr>)}
      {kind==="employees"&&employees.filter(x=>x.name.toLowerCase().includes(search.toLowerCase())).map(e=><tr key={e.email} className="border-t border-border"><td className="p-4"><div className="flex gap-3 items-center"><span className="size-10 rounded-full bg-secondary text-white grid place-items-center text-xs font-bold">{e.initials}</span><div><b>{e.name}</b><small className="block text-muted">{e.email}</small></div></div></td><td className="p-4">{e.shift}</td><td className="p-4"><span className="flex gap-2"><Store size={16} className="text-muted"/>{e.branch}</span></td><td className="p-4 font-bold">{e.sales}</td><td className="p-4"><StatusBadge active={e.active}/></td><Actions/></tr>)}
    </tbody></table></div></div><Pagination/>{modal&&<CreateModal kind={kind} close={()=>setModal(false)}/>}</AppShell>}

function Actions(){return <td className="p-4"><div className="flex justify-end gap-1"><button className="size-9 rounded-lg hover:bg-primary-soft text-muted hover:text-primary grid place-items-center"><Edit3 size={16}/></button><button className="size-9 rounded-lg hover:bg-danger/10 text-muted hover:text-danger grid place-items-center"><Trash2 size={16}/></button><button className="size-9 grid place-items-center text-muted"><MoreHorizontal size={18}/></button></div></td>}
function CreateModal({kind,close}:{kind:Kind;close:()=>void}){const {t}=useLanguage();return <div className="fixed inset-0 z-50 bg-text/50 grid place-items-center p-4" onMouseDown={close}><div className="card w-full max-w-lg p-6 shadow-2xl" onMouseDown={e=>e.stopPropagation()}><div className="flex items-center gap-3"><div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center">{kind==="employees"?<UserRound/>:<Plus/>}</div><div><h2 className="font-bold text-xl">{kind==="products"?t("addProduct"):kind==="categories"?t("addCategory"):kind==="discounts"?t("addDiscount"):t("addEmployee")}</h2><p className="text-muted text-sm">English and Arabic details</p></div></div><div className="grid sm:grid-cols-2 gap-4 mt-6"><label><span className="text-xs font-bold block mb-2">Name (English)</span><input className="input" placeholder="Enter name"/></label><label><span className="text-xs font-bold block mb-2">الاسم (العربية)</span><input dir="rtl" className="input" placeholder="أدخل الاسم"/></label><label><span className="text-xs font-bold block mb-2">{kind==="products"?t("price"):kind==="employees"?t("email"):"Reference"}</span><input className="input" placeholder={kind==="products"?"0.00":"Details"}/></label><label><span className="text-xs font-bold block mb-2">{t("branch")}</span><select className="input"><option>Main Branch</option><option>Garden Branch</option></select></label></div><div className="flex justify-end gap-2 mt-7"><button onClick={close} className="btn-secondary">Cancel</button><button onClick={close} className="btn-primary">{t("save")}</button></div></div></div>}
