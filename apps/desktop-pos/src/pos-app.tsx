import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProductSummary } from "../electron/shared";

type CartLine = { product: ProductSummary; quantity: number };
const money = (minor: number, currency = "ILS") => new Intl.NumberFormat("en", { style: "currency", currency }).format(minor / 100);

export function PosApp() {
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
  const [supervisorUsername, setSupervisorUsername] = useState("");
  const [supervisorPin, setSupervisorPin] = useState("");
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
    catch (e) { setError(e instanceof Error ? e.message : "Sign-in failed."); }
  }
  async function enroll(event: React.FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try { await window.pos.enroll(serverUrl, pairingCode, deviceName); setPairingCode(""); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Device setup failed."); }
    finally { setBusy(false); }
  }
  async function refreshCatalog() {
    setCatalogRefreshing(true); setError("");
    try { await window.pos.refreshCatalog(); await refresh(); setProducts(await window.pos.listProducts(query)); }
    catch (e) { setError(e instanceof Error ? e.message : "Catalog refresh failed."); }
    finally { setCatalogRefreshing(false); }
  }
  async function refreshPrinters() {
    try { setPrinters(await window.pos.listPrinters()); setPrinterNotice(""); await refresh(); }
    catch (e) { setPrinterNotice(e instanceof Error ? e.message : "Could not read Windows printers."); }
  }
  async function choosePrinter(name: string) {
    try { await window.pos.selectPrinter(name || null); await refresh(); setPrinterNotice(name ? "Receipt printer saved." : "Windows will ask which printer to use for each receipt."); }
    catch (e) { setPrinterNotice(e instanceof Error ? e.message : "Could not save printer."); }
  }
  async function testPrinter() {
    setPrinterBusy(true); setPrinterNotice("");
    try { const result=await window.pos.testPrinter(); setPrinterNotice(result.printedTo?`Test page sent to ${result.printedTo}.`:"Test page sent to the Windows printer dialog."); }
    catch (e) { setPrinterNotice(e instanceof Error ? e.message : "Printer test failed."); }
    finally { setPrinterBusy(false); }
  }
  async function saveInvoicePdf() {
    if (!receipt) return;
    setPdfSaving(true); setPdfMessage(""); setError("");
    try { const result=await window.pos.saveInvoicePdf(receipt.number); if(result.saved) setPdfMessage(`Invoice PDF saved: ${result.filePath}`); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save invoice PDF."); }
    finally { setPdfSaving(false); }
  }
  function add(product: ProductSummary) {
    setCart((items) => {
      const found = items.find((line) => line.product.id === product.id);
      return found ? items.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...items, { product, quantity: 1 }];
    });
    searchRef.current?.focus(); setQuery("");
  }
  async function checkout() {
    if (!cart.length || busy) return;
    setBusy(true); setError("");
    try {
      const result = await window.pos.checkout({ idempotencyKey: crypto.randomUUID(), deviceId: "local-device", currencyCode: "ILS",
        discountMinor, discountReason,
        ...(discountMinor > discountLimit ? { supervisorAuthorization: { username: supervisorUsername, pin: supervisorPin } } : {}),
        items: cart.map(({product, quantity}) => ({productId: product.id, quantity})),
        payments: [{method:"CASH", amountMinor: total, currencyCode:"ILS"}] });
      setReceipt({ number: result.receiptNumber, total: result.totalMinor, items: cart }); setCart([]); setDiscountMinor(0); setDiscountReason(""); setSupervisorPin(""); await refresh(); void window.pos.syncNow();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not complete sale."); }
    finally { setBusy(false); }
  }

  const printerPanel = printerSetupOpen ? <section className="printer-setup" aria-label="Printer setup"><div className="printer-setup-head"><div><p className="eyebrow">PRINTER SETUP</p><h2>Connect and choose a printer</h2></div><button className="text-btn" onClick={()=>setPrinterSetupOpen(false)}>Close</button></div><p className="muted">Connect the printer by USB or network, install its Windows driver if prompted, then refresh this list.</p><div className="printer-setup-actions"><button className="secondary" onClick={()=>void window.pos.openPrinterSettings()}>Open Windows printer settings</button><button className="secondary" onClick={()=>void refreshPrinters()}>Refresh printer list</button></div><label>Receipt printer<select className="printer-select" value={status?.selectedPrinterName||""} onChange={(event)=>void choosePrinter(event.target.value)}><option value="">Ask me each time (Windows dialog)</option>{printers.map((printer)=><option key={printer.name} value={printer.name}>{printer.displayName}</option>)}</select></label>{printers.length===0&&<p className="printer-empty">No printer found yet. Add one in Windows settings, then press “Refresh printer list”. You can keep using the cashier without a printer.</p>}<div className="printer-setup-actions"><button onClick={()=>void testPrinter()} disabled={printerBusy}>{printerBusy?"Printing test…":"Print test page"}</button></div>{printerNotice&&<p className="printer-notice" role="status">{printerNotice}</p>}</section>:null;

  if (receipt) return <main className="receipt"><div className="receipt-card"><div className="mark">SK</div><p className="eyebrow">PAYMENT COMPLETE</p><h1>Receipt</h1><p className="receipt-no">{receipt.number}</p><div className="receipt-items">{receipt.items.map((line)=><div key={line.product.id}><span>{line.quantity} × {line.product.nameEn}</span><b>{money(line.product.priceMinor*line.quantity,line.product.currencyCode)}</b></div>)}</div><div className="receipt-total"><span>Total paid</span><strong>{money(receipt.total)}</strong></div><p className="muted">Saved on this device. Cloud sync will retry automatically when the server is available.</p><div className="actions"><button className="secondary" onClick={() => void window.pos.printReceipt().catch((e)=>setError(String(e)))}>Print receipt</button><button className="secondary" disabled={pdfSaving} onClick={()=>void saveInvoicePdf()}>{pdfSaving?"Saving PDF…":"Save invoice PDF"}</button><button onClick={() => {setReceipt(null); searchRef.current?.focus();}}>New sale</button></div>{pdfMessage&&<p className="pdf-message" role="status">{pdfMessage}</p>}{error&&<p className="error">{error}</p>}</div></main>;

  if (!user) return <main className="login-wrap"><section className="login-card"><div className="brand"><span className="mark">SK</span><span><b>Sheikh Al Kar</b><small>Restaurant POS</small></span></div><p className="eyebrow">OFFLINE READY</p><h1>Cashier sign in</h1><p className="muted">Use a cashier PIN provisioned to this device.</p><button className="secondary-wide printer-open" onClick={()=>{setPrinterSetupOpen((open)=>!open);void refreshPrinters();}}>Set up a printer</button>{printerPanel}
    <form onSubmit={signIn}><label>Cashier username<input autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required /></label><label>PIN<input inputMode="numeric" autoComplete="current-password" type="password" value={pin} onChange={(e) => setPin(e.target.value)} required /></label>{error && <p className="error">{error}</p>}<button className="wide" disabled={!status?.cashierCount}>Sign in</button></form>
    <p className="setup-note">{status?.cashierCount ? `${status.cashierCount} offline cashier credential(s) available · last sync ${status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString() : "never"}.` : status?.deviceEnrolled ? `This POS is paired, but no cashier PIN is provisioned and assigned yet. Last sync: ${status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString() : "never"}.` : "Pair this POS with a code from Admin → POS Devices. The code is single use and expires after 10 minutes."}</p>
    {!status?.deviceEnrolled && <form className="enroll-form" onSubmit={(event)=>void enroll(event)}><p className="eyebrow">DEVICE SETUP</p><label>Cloud server URL<input type="url" placeholder="https://pos.example.com" value={serverUrl} onChange={(e)=>setServerUrl(e.target.value)} required /></label><label>One-time pairing code<input autoCapitalize="characters" value={pairingCode} onChange={(e)=>setPairingCode(e.target.value.toUpperCase())} required /></label><label>Terminal name<input value={deviceName} onChange={(e)=>setDeviceName(e.target.value)} required /></label>{error && <p className="error">{error}</p>}<button className="secondary-wide" disabled={busy}>{busy?"Connecting…":"Pair this terminal"}</button></form>}
  </section></main>;

  const isCloudOnline = Boolean(status?.deviceEnrolled && status.lastSyncAt && !status.lastSyncError);
  return <main className="app-shell"><header><div className="brand"><span className="mark">SK</span><span><b>Sheikh Al Kar</b><small>Point of sale</small></span></div><div className="top-status"><span className={`dot ${isCloudOnline ? "online" : ""}`}/>{isCloudOnline ? "Cloud connected" : "Offline · local sales enabled"}<span className="divider"/>{status?.pendingCount ?? 0} pending{status?.lastSyncError ? <span title={status.lastSyncError} className="sync-error">Sync issue</span> : null}</div><div className="cashier"><button className="text-btn" onClick={()=>{setPrinterSetupOpen((open)=>!open);void refreshPrinters();}}>Printer</button>{user}<button className="logout" onClick={async()=>{await window.pos.logout();setUser(null);setCart([]);}}>Lock</button></div></header>{printerPanel}
    <div className="workspace"><section className="catalog"><div className="section-head"><div><p className="eyebrow">LOCAL CATALOG</p><h1>New sale</h1></div><span className="count">{status?.catalogCount ?? 0} products</span></div><div className="catalog-sync-row"><p className="catalog-sync" role="status">{status?.catalogMatchesCloud===true?`Prices and products match the cloud · checked ${status.catalogSyncedAt?new Date(status.catalogSyncedAt).toLocaleString():"recently"}.`:status?.catalogMatchesCloud===false?"Local catalog differs from the last cloud check. Refresh to download current prices and products; offline checkout remains available.":"Catalog has not yet been verified against the cloud. Offline checkout uses the saved local catalog."}</p><button className="secondary catalog-refresh" onClick={()=>void refreshCatalog()} disabled={!status?.deviceEnrolled||catalogRefreshing}>{catalogRefreshing?"Refreshing…":"Refresh catalog"}</button></div><div className="search"><span>⌕</span><input ref={searchRef} autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"&&products.length===1){e.preventDefault();add(products[0]);}}} placeholder="Search product or scan barcode"/><kbd>ENTER</kbd></div>
      {products.length ? <div className="product-grid">{products.map((p)=><button className="product" key={p.id} onClick={()=>add(p)}><span className="product-icon">{p.nameEn.slice(0,1).toUpperCase()}</span><span className="product-name">{p.nameEn}</span><span className="product-sku">{p.sku}</span><b>{money(p.priceMinor,p.currencyCode)}</b></button>)}</div> : <div className="empty"><div className="empty-icon">⌕</div><h3>{query ? "No matching products" : "Catalog is empty"}</h3><p>{query ? "Try another name, SKU, or barcode." : "Connect to the admin system to download the local product catalog."}</p></div>}</section>
      <aside className="cart"><div className="cart-head"><div><p className="eyebrow">CURRENT ORDER</p><h2>Cart <span>{cart.reduce((n,l)=>n+l.quantity,0)}</span></h2></div><button className="text-btn" onClick={()=>{setCart([]);setDiscountMinor(0);}} disabled={!cart.length}>Clear</button></div><div className="cart-lines">{cart.map(({product,quantity})=><div className="line" key={product.id}><div className="line-icon">{product.nameEn.slice(0,1)}</div><div className="line-info"><b>{product.nameEn}</b><small>{money(product.priceMinor,product.currencyCode)} each</small><div className="qty"><button onClick={()=>setCart((xs)=>xs.flatMap(x=>x.product.id!==product.id?[x]:x.quantity>1?[{...x,quantity:x.quantity-1}]:[]))}>−</button><span>{quantity}</span><button onClick={()=>setCart((xs)=>xs.map(x=>x.product.id===product.id?{...x,quantity:x.quantity+1}:x))}>+</button></div></div><strong>{money(product.priceMinor*quantity,product.currencyCode)}</strong></div>)}</div>{!cart.length&&<div className="cart-empty">Your order will appear here<br/>Add products to get started</div>}<div className="cart-bottom"><label>Discount amount (minor units)<input type="number" min="0" max={subtotal} value={discountMinor} onChange={(e)=>setDiscountMinor(Math.max(0,Number(e.target.value)||0))}/></label>{discountMinor>0&&<><label>Reason for discount<input value={discountReason} onChange={(e)=>setDiscountReason(e.target.value)} required/></label>{discountMinor>discountLimit&&<><label>Supervisor username<input value={supervisorUsername} onChange={(e)=>setSupervisorUsername(e.target.value)} required/></label><label>Supervisor PIN<input type="password" value={supervisorPin} onChange={(e)=>setSupervisorPin(e.target.value)} required/></label></>}</>}<div className="total-row"><span>Total</span><strong>{money(total)}</strong></div><p className="cash-note">Cash payment · Local transaction</p>{error&&<p className="error">{error}</p>}<button className="checkout" disabled={!cart.length||busy} onClick={()=>void checkout()}>{busy?"Saving…":`Complete cash sale · ${money(total)}`}</button></div></aside></div>
  </main>;
}
