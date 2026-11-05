import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProductSummary } from "../electron/shared";
import brandIcon from "./assets/sheikh-al-kar-icon.svg";

type CartLine = { product: ProductSummary; quantity: number };
type Language = "en" | "ar";
const copy = {
  en: { language:"العربية", app:"Restaurant POS", cashier:"Cashier sign in", pinHint:"Use a cashier PIN provisioned to this device.", printerSetupButton:"Set up a printer", username:"Cashier username", pin:"PIN", signIn:"Sign in", offlineReady:"OFFLINE READY", deviceSetup:"DEVICE SETUP", server:"Cloud server URL", pairing:"One-time pairing code", terminal:"Terminal name", pair:"Pair this terminal", connecting:"Connecting…", printerSetup:"PRINTER SETUP", printerTitle:"Connect and choose a printer", close:"Close", printerHelp:"Connect the printer by USB or network, install its Windows driver if prompted, then refresh this list.", windowsPrinters:"Open Windows printer settings", refreshPrinters:"Refresh printer list", receiptPrinter:"Receipt printer", askPrinter:"Ask me each time (Windows dialog)", noPrinter:"No printer found yet. Add one in Windows settings, then refresh the list. You can keep using the cashier without a printer.", testPrint:"Print test page", printing:"Printing test…", printerSaved:"Receipt printer saved.", askEach:"Windows will ask which printer to use for each receipt.", paymentComplete:"PAYMENT COMPLETE", receipt:"Receipt", totalPaid:"Total paid", savedOffline:"Saved on this device. Cloud sync will retry automatically when the server is available.", printReceipt:"Print receipt", savePdf:"Save invoice PDF", savingPdf:"Saving PDF…", newSale:"New sale", pointOfSale:"Point of sale", printer:"Printer", lock:"Lock", cloudConnected:"Cloud connected", offline:"Offline · local sales enabled", pending:"pending", syncIssue:"Sync issue", localCatalog:"LOCAL CATALOG", products:"products", catalogMatch:"Prices and products match the cloud · checked", recently:"recently", catalogDiff:"Local catalog differs from the last cloud check. Refresh to download current prices and products; offline checkout remains available.", catalogUnknown:"Catalog has not yet been verified against the cloud. Offline checkout uses the saved local catalog.", refreshCatalog:"Refresh catalog", refreshing:"Refreshing…", search:"Search product or scan barcode", noMatch:"No matching products", emptyCatalog:"Catalog is empty", trySearch:"Try another name, SKU, or barcode.", connectAdmin:"Connect to the admin system to download the local product catalog.", currentOrder:"CURRENT ORDER", cart:"Cart", clear:"Clear", each:"each", emptyCart:"Your order will appear here", addProducts:"Add products to get started", discount:"Manual discount (minor units)", discountReason:"Reason for discount", coupon:"Coupon code", applyCoupon:"Apply coupon", couponApplied:"Coupon applied", couponInvalid:"Coupon is invalid or unavailable offline. Sync the terminal.", supervisor:"Supervisor username", supervisorPin:"Supervisor PIN", total:"Total", cashPayment:"Cash payment · Local transaction", completeSale:"Complete cash sale", saving:"Saving…", signInFailed:"Sign-in failed.", deviceSetupFailed:"Device setup failed.", refreshFailed:"Catalog refresh failed.", readPrintersFailed:"Could not read Windows printers.", printerSaveFailed:"Could not save printer.", printerTestFailed:"Printer test failed.", savePdfFailed:"Could not save invoice PDF.", checkoutFailed:"Could not complete sale.", noCashiers:"No offline cashier credentials are available.", pairedNoPin:"This POS is paired, but no cashier PIN is provisioned and assigned yet. Last sync:", pairHint:"Pair this POS with a code from Admin → POS Devices. The code is single use and expires after 10 minutes.", askSetup:"This POS needs to be paired before it can sync." },
  ar: { language:"English", app:"نظام نقاط البيع", cashier:"تسجيل دخول الكاشير", pinHint:"أدخل الرقم السري المخصص لهذا الجهاز.", printerSetupButton:"إعداد الطابعة", username:"اسم مستخدم الكاشير", pin:"الرقم السري", signIn:"تسجيل الدخول", offlineReady:"جاهز للعمل دون إنترنت", deviceSetup:"إعداد الجهاز", server:"رابط الخادم السحابي", pairing:"رمز الاقتران لمرة واحدة", terminal:"اسم نقطة البيع", pair:"إقران الجهاز", connecting:"جارٍ الاتصال…", printerSetup:"إعداد الطابعة", printerTitle:"توصيل الطابعة واختيارها", close:"إغلاق", printerHelp:"صِل الطابعة عبر USB أو الشبكة، وثبّت تعريف Windows إذا طُلب، ثم حدّث القائمة.", windowsPrinters:"فتح إعدادات الطابعات في Windows", refreshPrinters:"تحديث قائمة الطابعات", receiptPrinter:"طابعة الفواتير", askPrinter:"اسألني في كل مرة (نافذة Windows)", noPrinter:"لم يتم العثور على طابعة. أضفها من إعدادات Windows ثم حدّث القائمة. يمكنك استخدام الكاشير دون طابعة.", testPrint:"طباعة صفحة اختبار", printing:"جارٍ طباعة الاختبار…", printerSaved:"تم حفظ طابعة الفواتير.", askEach:"سيطلب Windows اختيار الطابعة عند كل فاتورة.", paymentComplete:"اكتملت عملية الدفع", receipt:"الإيصال", totalPaid:"المبلغ المدفوع", savedOffline:"حُفظت العملية على هذا الجهاز. ستتم إعادة المزامنة تلقائياً عند توفر الخادم.", printReceipt:"طباعة الإيصال", savePdf:"حفظ الفاتورة PDF", savingPdf:"جارٍ حفظ PDF…", newSale:"عملية بيع جديدة", pointOfSale:"نقاط البيع", printer:"الطابعة", lock:"قفل", cloudConnected:"متصل بالسحابة", offline:"دون اتصال · البيع المحلي متاح", pending:"معلقة", syncIssue:"مشكلة مزامنة", localCatalog:"الكتالوج المحلي", products:"منتجات", catalogMatch:"الأسعار والمنتجات مطابقة للسحابة · آخر تحقق", recently:"حديثاً", catalogDiff:"الكتالوج المحلي يختلف عن آخر تحقق سحابي. حدّث لتنزيل الأسعار والمنتجات الحالية؛ البيع دون اتصال متاح.", catalogUnknown:"لم يتم التحقق من الكتالوج مع السحابة بعد. يستخدم البيع دون اتصال البيانات المحفوظة محلياً.", refreshCatalog:"تحديث الكتالوج", refreshing:"جارٍ التحديث…", search:"ابحث عن منتج أو امسح الباركود", noMatch:"لا توجد منتجات مطابقة", emptyCatalog:"الكتالوج فارغ", trySearch:"جرّب اسماً أو رمزاً أو باركوداً آخر.", connectAdmin:"اتصل بنظام الإدارة لتنزيل كتالوج المنتجات المحلي.", currentOrder:"الطلب الحالي", cart:"السلة", clear:"مسح", each:"للقطعة", emptyCart:"سيظهر طلبك هنا", addProducts:"أضف منتجات للبدء", discount:"الخصم اليدوي (بالوحدات الصغرى)", discountReason:"سبب الخصم", coupon:"رمز الكوبون", applyCoupon:"تطبيق الكوبون", couponApplied:"تم تطبيق الكوبون", couponInvalid:"الكوبون غير صالح أو غير متاح دون اتصال. حدّث المزامنة.", supervisor:"اسم المستخدم للمشرف", supervisorPin:"الرقم السري للمشرف", total:"الإجمالي", cashPayment:"دفع نقدي · عملية محلية", completeSale:"إتمام البيع نقداً", saving:"جارٍ الحفظ…", signInFailed:"فشل تسجيل الدخول.", deviceSetupFailed:"فشل إعداد الجهاز.", refreshFailed:"فشل تحديث الكتالوج.", readPrintersFailed:"تعذرت قراءة طابعات Windows.", printerSaveFailed:"تعذر حفظ الطابعة.", printerTestFailed:"فشل اختبار الطابعة.", savePdfFailed:"تعذر حفظ الفاتورة PDF.", checkoutFailed:"تعذر إتمام البيع.", noCashiers:"لا توجد بيانات دخول محلية للكاشير.", pairedNoPin:"هذا الجهاز مقترن، لكن لم يتم تخصيص رقم سري للكاشير. آخر مزامنة:", pairHint:"اقرن الجهاز باستخدام رمز من الإدارة ← أجهزة نقاط البيع. الرمز صالح لمرة واحدة وينتهي خلال 10 دقائق.", askSetup:"يجب إقران الجهاز قبل مزامنته." }
} as const;
const money = (minor: number, currency = "ILS", language: Language = "en") => new Intl.NumberFormat(language === "ar" ? "ar-PS" : "en", { style: "currency", currency }).format(minor / 100);
function Brand({ compact = false, subtitle = "Restaurant" }: { compact?: boolean; subtitle?: string }) { return <span className={`brand-logo${compact ? " compact" : ""}`}><img src={brandIcon} alt=""/><span><b dir="rtl">شيخ الكار</b><small>{subtitle}</small></span></span>; }

export function PosApp() {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem("pos-language") === "ar" ? "ar" : "en");
  const t = copy[language];
  const productName = (product: ProductSummary) => language === "ar" ? (product.nameAr || product.nameEn) : product.nameEn;
  const formatDate = (value: string) => new Date(value).toLocaleString(language === "ar" ? "ar-PS" : "en");
  const languageButton = <button className="language-toggle" onClick={() => setLanguage(language === "ar" ? "en" : "ar")} aria-label={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}>{t.language}</button>;
  useEffect(() => { localStorage.setItem("pos-language", language); document.documentElement.lang = language; document.documentElement.dir = language === "ar" ? "rtl" : "ltr"; }, [language]);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof window.pos.getLocalStatus>> | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [policy, setPolicy] = useState<{canDiscount:boolean;maxDiscountPercent:number;maxDiscountMinor:number}|null>(null);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [deviceName, setDeviceName] = useState("POS Terminal");
  const [discountMinor, setDiscountMinor] = useState(0);
  const [discountReason, setDiscountReason] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{number:string;total:number;items:CartLine[]}|null>(null);
  const [busy, setBusy] = useState(false);
  const [catalogRefreshing, setCatalogRefreshing] = useState(false);
  const [printerSetupOpen, setPrinterSetupOpen] = useState(false);
  const [printers, setPrinters] = useState<{name:string;displayName:string;description:string}[]>([]);
  const [printerNotice, setPrinterNotice] = useState("");
  const [printerBusy, setPrinterBusy] = useState(false);
  const [pdfSaving, setPdfSaving] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => setStatus(await window.pos.getLocalStatus()), []);
  useEffect(() => {
    let current = true;
    void window.pos.getLocalStatus().then((snapshot) => { if (current) setStatus(snapshot); });
    return () => { current = false; };
  }, []);
  useEffect(() => {
    if (!user) return;
    const timer = window.setInterval(() => { void window.pos.getLocalStatus().then(setStatus); }, 15_000);
    return () => window.clearInterval(timer);
  }, [user]);
  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      void window.pos.listProducts(query).then(setProducts).catch((e: unknown) => setError(String(e)));
    }, 100);
    return () => window.clearTimeout(timer);
  }, [query, user]);
  const subtotal = useMemo(() => cart.reduce((sum, line) => sum + line.product.priceMinor * line.quantity, 0), [cart]);
  const total = subtotal - Math.min(discountMinor, subtotal);
  const discountLimit = policy?.canDiscount ? Math.min(Math.floor(subtotal * policy.maxDiscountPercent / 100), policy.maxDiscountMinor) : 0;

  async function signIn(event: React.FormEvent) {
    event.preventDefault(); setError("");
    try { const result = await window.pos.login(username, pin); setUser(result.name); setPolicy(result); setPin(""); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : t.signInFailed); }
  }
  async function enroll(event: React.FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try { await window.pos.enroll(serverUrl, pairingCode, deviceName); setPairingCode(""); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : t.deviceSetupFailed); }
    finally { setBusy(false); }
  }
  async function refreshCatalog() {
    setCatalogRefreshing(true); setError("");
    try { await window.pos.refreshCatalog(); await refresh(); setProducts(await window.pos.listProducts(query)); }
    catch (e) { setError(e instanceof Error ? e.message : t.refreshFailed); }
    finally { setCatalogRefreshing(false); }
  }
  async function refreshPrinters() {
    try { setPrinters(await window.pos.listPrinters()); setPrinterNotice(""); await refresh(); }
    catch (e) { setPrinterNotice(e instanceof Error ? e.message : t.readPrintersFailed); }
  }
  async function choosePrinter(name: string) {
    try { await window.pos.selectPrinter(name || null); await refresh(); setPrinterNotice(name ? t.printerSaved : t.askEach); }
    catch (e) { setPrinterNotice(e instanceof Error ? e.message : t.printerSaveFailed); }
  }
  async function testPrinter() {
    setPrinterBusy(true); setPrinterNotice("");
    try { const result=await window.pos.testPrinter(); setPrinterNotice(result.printedTo?`Test page sent to ${result.printedTo}.`:"Test page sent to the Windows printer dialog."); }
    catch (e) { setPrinterNotice(e instanceof Error ? e.message : t.printerTestFailed); }
    finally { setPrinterBusy(false); }
  }
  async function saveInvoicePdf() {
    if (!receipt) return;
    setPdfSaving(true); setPdfMessage(""); setError("");
    try { const result=await window.pos.saveInvoicePdf(receipt.number); if(result.saved) setPdfMessage(`Invoice PDF saved: ${result.filePath}`); }
    catch (e) { setError(e instanceof Error ? e.message : t.savePdfFailed); }
    finally { setPdfSaving(false); }
  }
  function add(product: ProductSummary) {
    setCart((items) => {
      const found = items.find((line) => line.product.id === product.id);
      return found ? items.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...items, { product, quantity: 1 }];
    });
    searchRef.current?.focus(); setQuery("");
  }
  function applyCoupon() {
    setCouponMessage("");
    const code = couponCode.trim().toUpperCase();
    const coupon = status?.coupons?.find((item) => item.code === code && item.active && Date.parse(item.startsAt) <= Date.now() && Date.parse(item.endsAt) >= Date.now() && (item.maxUses === null || item.usedCount < item.maxUses));
    if (!coupon || !subtotal) { setCouponApplied(false); setCouponMessage(t.couponInvalid); return; }
    const amount = coupon.type === "PERCENTAGE" ? Math.floor(subtotal * coupon.value / 100) : Math.round(coupon.value * 100);
    setDiscountMinor(Math.min(amount, subtotal)); setDiscountReason(`Coupon ${code}`); setCouponCode(code); setCouponApplied(true); setCouponMessage(t.couponApplied);
  }
  async function checkout() {
    if (!cart.length || busy) return;
    setBusy(true); setError("");
    try {
      const result = await window.pos.checkout({ idempotencyKey: crypto.randomUUID(), deviceId: "local-device", currencyCode: "ILS",
        discountMinor, discountReason,
        ...(couponApplied ? { couponCode: couponCode.trim().toUpperCase() } : {}),
        items: cart.map(({product, quantity}) => ({productId: product.id, quantity})),
        payments: [{method:"CASH", amountMinor: total, currencyCode:"ILS"}] });
      setReceipt({ number: result.receiptNumber, total: result.totalMinor, items: cart }); setCart([]); setDiscountMinor(0); setDiscountReason(""); setCouponApplied(false); setCouponCode(""); await refresh(); void window.pos.syncNow();
    } catch (e) { setError(e instanceof Error ? e.message : t.checkoutFailed); }
    finally { setBusy(false); }
  }

  const printerPanel = printerSetupOpen ? <section className="printer-setup" aria-label={t.printerSetup}><div className="printer-setup-head"><div><p className="eyebrow">{t.printerSetup}</p><h2>{t.printerTitle}</h2></div><button className="text-btn" onClick={()=>setPrinterSetupOpen(false)}>{t.close}</button></div><p className="muted">{t.printerHelp}</p><div className="printer-setup-actions"><button className="secondary" onClick={()=>void window.pos.openPrinterSettings()}>{t.windowsPrinters}</button><button className="secondary" onClick={()=>void refreshPrinters()}>{t.refreshPrinters}</button></div><label>{t.receiptPrinter}<select className="printer-select" value={status?.selectedPrinterName||""} onChange={(event)=>void choosePrinter(event.target.value)}><option value="">{t.askPrinter}</option>{printers.map((printer)=><option key={printer.name} value={printer.name}>{printer.displayName}</option>)}</select></label>{printers.length===0&&<p className="printer-empty">{t.noPrinter}</p>}<div className="printer-setup-actions"><button onClick={()=>void testPrinter()} disabled={printerBusy}>{printerBusy?t.printing:t.testPrint}</button></div>{printerNotice&&<p className="printer-notice" role="status">{printerNotice}</p>}</section>:null;

  if (receipt) return <main className="receipt"><div className="receipt-card">{languageButton}<Brand compact/><p className="eyebrow">{t.paymentComplete}</p><h1>{t.receipt}</h1><p className="receipt-no">{receipt.number}</p><div className="receipt-items">{receipt.items.map((line)=><div key={line.product.id}><span>{line.quantity} × {productName(line.product)}</span><b>{money(line.product.priceMinor*line.quantity,line.product.currencyCode,language)}</b></div>)}</div><div className="receipt-total"><span>{t.totalPaid}</span><strong>{money(receipt.total,"ILS",language)}</strong></div><p className="muted">{t.savedOffline}</p><div className="actions"><button className="secondary" onClick={() => void window.pos.printReceipt().catch((e)=>setError(String(e)))}>{t.printReceipt}</button><button className="secondary" disabled={pdfSaving} onClick={()=>void saveInvoicePdf()}>{pdfSaving?t.savingPdf:t.savePdf}</button><button onClick={() => {setReceipt(null); searchRef.current?.focus();}}>{t.newSale}</button></div>{pdfMessage&&<p className="pdf-message" role="status">{pdfMessage}</p>}{error&&<p className="error">{error}</p>}</div></main>;

  if (!user) return <main className="login-wrap"><section className="login-card">{languageButton}<Brand subtitle={t.app}/><p className="eyebrow">{t.offlineReady}</p><h1>{t.cashier}</h1><p className="muted">{t.pinHint}</p><button className="secondary-wide printer-open" onClick={()=>{setPrinterSetupOpen((open)=>!open);void refreshPrinters();}}>{t.printerSetupButton}</button>{printerPanel}
    <form onSubmit={signIn}><label>{t.username}<input autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required /></label><label>{t.pin}<input inputMode="numeric" autoComplete="current-password" type="password" value={pin} onChange={(e) => setPin(e.target.value)} required /></label>{error && <p className="error">{error}</p>}<button className="wide" disabled={!status?.cashierCount}>{t.signIn}</button></form>
    <p className="setup-note">{status?.cashierCount ? (language === "ar" ? `${status.cashierCount} بيانات دخول محلية متاحة · آخر مزامنة ${status.lastSyncAt ? formatDate(status.lastSyncAt) : "أبداً"}.` : `${status.cashierCount} offline cashier credential(s) available · last sync ${status.lastSyncAt ? formatDate(status.lastSyncAt) : "never"}.`) : status?.deviceEnrolled ? `${t.pairedNoPin} ${status.lastSyncAt ? formatDate(status.lastSyncAt) : "—"}.` : t.pairHint}</p>
    {!status?.deviceEnrolled && <form className="enroll-form" onSubmit={(event)=>void enroll(event)}><p className="eyebrow">{t.deviceSetup}</p><label>{t.server}<input type="url" placeholder="https://pos.example.com" value={serverUrl} onChange={(e)=>setServerUrl(e.target.value)} required /></label><label>{t.pairing}<input autoCapitalize="characters" value={pairingCode} onChange={(e)=>setPairingCode(e.target.value.toUpperCase())} required /></label><label>{t.terminal}<input value={deviceName} onChange={(e)=>setDeviceName(e.target.value)} required /></label>{error && <p className="error">{error}</p>}<button className="secondary-wide" disabled={busy}>{busy?t.connecting:t.pair}</button></form>}
  </section></main>;

  const isCloudOnline = Boolean(status?.deviceEnrolled && status.lastSyncAt && !status.lastSyncError);
  return <main className="app-shell"><header><Brand subtitle={t.pointOfSale}/><div className="top-status"><span className={`dot ${isCloudOnline ? "online" : ""}`}/>{isCloudOnline ? t.cloudConnected : t.offline}<span className="divider"/>{status?.pendingCount ?? 0} {t.pending}{status?.lastSyncError ? <span title={status.lastSyncError} className="sync-error">{t.syncIssue}</span> : null}</div><div className="cashier">{languageButton}<button className="text-btn" onClick={()=>{setPrinterSetupOpen((open)=>!open);void refreshPrinters();}}>{t.printer}</button>{user}<button className="logout" onClick={async()=>{await window.pos.logout();setUser(null);setCart([]);}}>{t.lock}</button></div></header>{printerPanel}
    <div className="workspace"><section className="catalog"><div className="section-head"><div><p className="eyebrow">{t.localCatalog}</p><h1>{t.newSale}</h1></div><span className="count">{status?.catalogCount ?? 0} {t.products}</span></div><div className="catalog-sync-row"><p className="catalog-sync" role="status">{status?.catalogMatchesCloud===true?`${t.catalogMatch} ${status.catalogSyncedAt?formatDate(status.catalogSyncedAt):t.recently}.`:status?.catalogMatchesCloud===false?t.catalogDiff:t.catalogUnknown}</p><button className="secondary catalog-refresh" onClick={()=>void refreshCatalog()} disabled={!status?.deviceEnrolled||catalogRefreshing}>{catalogRefreshing?t.refreshing:t.refreshCatalog}</button></div><div className="search"><span>⌕</span><input ref={searchRef} autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"&&products.length===1){e.preventDefault();add(products[0]);}}} placeholder={t.search}/><kbd>ENTER</kbd></div>
      {products.length ? <div className="product-grid">{products.map((p)=><button className="product" key={p.id} onClick={()=>add(p)}><span className="product-icon">{productName(p).slice(0,1).toUpperCase()}</span><span className="product-name">{productName(p)}</span><span className="product-sku">{p.sku}</span><b>{money(p.priceMinor,p.currencyCode,language)}</b></button>)}</div> : <div className="empty"><div className="empty-icon">⌕</div><h3>{query ? t.noMatch : t.emptyCatalog}</h3><p>{query ? t.trySearch : t.connectAdmin}</p></div>}</section>
      <aside className="cart"><div className="cart-head"><div><p className="eyebrow">{t.currentOrder}</p><h2>{t.cart} <span>{cart.reduce((n,l)=>n+l.quantity,0)}</span></h2></div><button className="text-btn" onClick={()=>{setCart([]);setDiscountMinor(0);}} disabled={!cart.length}>{t.clear}</button></div><div className="cart-lines">{cart.map(({product,quantity})=><div className="line" key={product.id}><div className="line-icon">{productName(product).slice(0,1)}</div><div className="line-info"><b>{productName(product)}</b><small>{money(product.priceMinor,product.currencyCode,language)} {t.each}</small><div className="qty"><button onClick={()=>setCart((xs)=>xs.flatMap(x=>x.product.id!==product.id?[x]:x.quantity>1?[{...x,quantity:x.quantity-1}]:[]))}>−</button><span>{quantity}</span><button onClick={()=>setCart((xs)=>xs.map(x=>x.product.id===product.id?{...x,quantity:x.quantity+1}:x))}>+</button></div></div><strong>{money(product.priceMinor*quantity,product.currencyCode,language)}</strong></div>)}</div>{!cart.length&&<div className="cart-empty">{t.emptyCart}<br/>{t.addProducts}</div>}<div className="cart-bottom"><label>{t.discount}<input type="number" min="0" max={discountLimit} value={couponApplied?0:discountMinor} disabled={couponApplied} onChange={(e)=>setDiscountMinor(Math.min(discountLimit,Math.max(0,Number(e.target.value)||0)))}/></label><label>{t.coupon}<div className="coupon-row"><input value={couponCode} onChange={(e)=>{setCouponCode(e.target.value.toUpperCase());setCouponApplied(false);setDiscountMinor(0);}}/><button type="button" className="secondary" onClick={applyCoupon}>{t.applyCoupon}</button></div></label>{couponMessage&&<p className="coupon-message">{couponMessage}</p>}{discountMinor>0&&!couponApplied&&<label>{t.discountReason}<input value={discountReason} onChange={(e)=>setDiscountReason(e.target.value)} required/></label>}<div className="total-row"><span>{t.total}</span><strong>{money(total,"ILS",language)}</strong></div><p className="cash-note">{t.cashPayment}</p>{error&&<p className="error">{error}</p>}<button className="checkout" disabled={!cart.length||busy} onClick={()=>void checkout()}>{busy?t.saving:`${t.completeSale} · ${money(total,"ILS",language)}`}</button></div></aside></div>
  </main>;
}
