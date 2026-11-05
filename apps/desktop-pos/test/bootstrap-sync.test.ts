import { afterEach, beforeEach, test } from "node:test";
import { strict as assert } from "node:assert";
import Database from "better-sqlite3";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PosDatabase } from "../electron/database";
import type { BootstrapSnapshot, AuthorizedCheckoutInput } from "../electron/shared";

let directory:string;
let pos:PosDatabase;
let raw:Database.Database;
const migration=resolve("database/migrations/001-initial.sql");
const snapshot=(priceMinor:number, cashier=true):BootstrapSnapshot=>({
  device:{id:"device-1",branchId:"branch-1",registerId:"register-1"},
  branch:{id:"branch-1",code:"MAIN",name:"Main",nameAr:"الرئيسي",address:null},
  register:{id:"register-1",number:"01",name:"Front"},serverTime:new Date().toISOString(),catalogVersion:Date.now(),
  categories:[{id:"cat-1",cloudId:"cat-1",nameEn:"Food",nameAr:"طعام",sortOrder:0,active:true,serverVersion:Date.now()}],
  products:[{id:"prod-1",cloudId:"prod-1",sku:"MEAL-1",barcode:"123456",nameEn:"Meal",nameAr:"وجبة",categoryId:"cat-1",priceMinor,currencyCode:"ILS",active:true,serverVersion:Date.now(),sizes:[],addons:[]}],
  cashiers:cashier?[{id:"cashier-1",cloudId:"cashier-1",username:"maya@example.com",displayName:"Maya",credentialHash:"a".repeat(128),credentialSalt:"b".repeat(32),verifierKind:"scrypt-v1",policyVersion:2,offlineExpiresAt:new Date(Date.now()+86400000).toISOString(),canDiscount:false,maxDiscountPercent:0,maxDiscountMinor:0,supervisor:false,offlinePolicyToken:"signed-policy-token"}]:[],
});

beforeEach(()=>{directory=mkdtempSync(join(tmpdir(),"restaurant-bootstrap-test-"));pos=new PosDatabase(join(directory,"pos.sqlite"),migration);raw=new Database(join(directory,"pos.sqlite"));});
afterEach(()=>{raw.close();pos.close();rmSync(directory,{recursive:true,force:true});});

test("cloud bootstrap atomically replaces local catalog and cashier permissions",()=>{
  pos.applyBootstrap(snapshot(2550));
  assert.equal(pos.listProducts("123456")[0].priceMinor,2550);
  assert.equal(pos.getCashierCount(),1);
  pos.applyBootstrap(snapshot(2700,false));
  assert.equal(pos.listProducts("123456")[0].priceMinor,2700);
  assert.equal(pos.getCashierCount(),0);
  assert.equal((raw.prepare("SELECT COUNT(*) AS n FROM products").get() as {n:number}).n,1);
  assert.equal(raw.prepare("SELECT value FROM sync_metadata WHERE key='catalog_version'").get()!==undefined,true);
  assert.equal((raw.prepare("SELECT value FROM sync_metadata WHERE key='catalog_hash'").get() as {value:string}).value,pos.getCatalogHash());
});

test("catalog reconciliation detects a cloud price change and keeps SQLite sales and outbox",()=>{
  pos.applyBootstrap(snapshot(2550));
  const input:AuthorizedCheckoutInput={idempotencyKey:"catalog-preserve-000001",deviceId:"device-1",currencyCode:"ILS",cashierPolicyToken:"signed-policy-token",items:[{productId:"prod-1",quantity:1}],payments:[{method:"CASH",amountMinor:2550,currencyCode:"ILS"}]};
  const sale=pos.checkout(input,"cashier-1");
  const queued=pos.getPendingCount();
  const before=pos.getCatalogHash();
  pos.applyBootstrap(snapshot(2750,false));
  const after=pos.getCatalogHash();
  assert.notEqual(before,after);
  assert.equal((raw.prepare("SELECT value FROM sync_metadata WHERE key='catalog_hash'").get() as {value:string}).value,after);
  assert.equal(pos.listProducts("123456")[0].priceMinor,2750);
  assert.equal(pos.getPendingCount(),queued);
  assert.equal((raw.prepare("SELECT COUNT(*) AS n FROM orders WHERE id=?").get(sale.orderId) as {n:number}).n,1);
  assert.equal((raw.prepare("SELECT COUNT(*) AS n FROM sync_queue WHERE entity_id=?").get(sale.orderId) as {n:number}).n,1);
});

test("sync queue recovers processing entries after restart and marks confirmed orders",()=>{
  pos.applyBootstrap(snapshot(2550));
  const input:AuthorizedCheckoutInput={idempotencyKey:"sale-sync-00000001",deviceId:"device-1",currencyCode:"ILS",cashierPolicyToken:"signed-policy-token",items:[{productId:"prod-1",quantity:1}],payments:[{method:"CASH",amountMinor:2550,currencyCode:"ILS"}]};
  const sale=pos.checkout(input,"cashier-1");
  const first=pos.claimSyncBatch(); assert.equal(first.length,1); assert.equal(first[0].entityId,sale.orderId);
  pos.close(); pos=new PosDatabase(join(directory,"pos.sqlite"),migration); raw.close(); raw=new Database(join(directory,"pos.sqlite"));
  pos.recoverInterruptedSync();
  const recovered=pos.claimSyncBatch(); assert.equal(recovered.length,1);
  pos.markSyncSucceeded(recovered[0].id,"cloud-invoice-1","MAIN-01-2026-000001");
  assert.equal(pos.getPendingCount(),0);
  const order=raw.prepare("SELECT sync_status,cloud_id,server_number FROM orders WHERE id=?").get(sale.orderId) as {sync_status:string;cloud_id:string;server_number:string};
  assert.deepEqual(order,{sync_status:"synced",cloud_id:"cloud-invoice-1",server_number:"MAIN-01-2026-000001"});
});

test("permanent sync errors stay queued for inspection and are not automatically claimed",()=>{
  pos.applyBootstrap(snapshot(2550));
  const input:AuthorizedCheckoutInput={idempotencyKey:"sale-sync-00000002",deviceId:"device-1",currencyCode:"ILS",cashierPolicyToken:"signed-policy-token",items:[{productId:"prod-1",quantity:1}],payments:[{method:"CASH",amountMinor:2550,currencyCode:"ILS"}]};
  pos.checkout(input,"cashier-1");
  const [row]=pos.claimSyncBatch();
  pos.markSyncFailure(row.id,"Cashier assignment revoked",true,row.attempts);
  assert.equal(pos.claimSyncBatch().length,0);
  assert.equal(pos.getPendingCount(),1);
  assert.equal((raw.prepare("SELECT status,error_message FROM sync_queue WHERE id=?").get(row.id) as {status:string;error_message:string}).status,"failed");
});
