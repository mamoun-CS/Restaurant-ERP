import { afterEach, beforeEach, test } from "node:test";
import { strict as assert } from "node:assert";
import Database from "better-sqlite3";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PosDatabase } from "../electron/database";
import type { AuthorizedCheckoutInput } from "../electron/shared";

let directory: string;
let pos: PosDatabase;
let raw: Database.Database;
const migration = resolve("database/migrations/001-initial.sql");

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "restaurant-pos-test-"));
  pos = new PosDatabase(join(directory, "pos.sqlite"), migration);
  raw = new Database(join(directory, "pos.sqlite"));
  raw.prepare(`INSERT INTO categories(id,name_en,name_ar,updated_at) VALUES('c1','Food','طعام',?)`).run(new Date().toISOString());
  raw.prepare(`INSERT INTO products(id,sku,name_en,name_ar,category_id,price_minor,currency_code,updated_at)
    VALUES('p1','SKU-1','Meal','وجبة','c1',2550,'ILS',?)`).run(new Date().toISOString());
  raw.prepare(`INSERT INTO cashiers(id,cloud_id,username,display_name,credential_hash,credential_salt,verifier_kind,policy_version,offline_expires_at,policy_token)
    VALUES('cashier-1','cashier-1','maya','Maya','hash','salt','scrypt-v1',1,?,'policy-token')`).run(new Date(Date.now()+60_000).toISOString());
});

afterEach(() => { raw.close(); pos.close(); rmSync(directory, { recursive: true, force: true }); });

function input(key: string, amount = 2550): AuthorizedCheckoutInput {
  return { idempotencyKey: key, deviceId: "device-1", currencyCode: "ILS", cashierPolicyToken:"policy-token",
    items: [{ productId: "p1", quantity: 1 }],
    payments: [{ method: "CASH", amountMinor: amount, currencyCode: "ILS" }] };
}

test("checkout persists order, lines, payment, movement, receipt, audit and outbox atomically", () => {
  const saved = pos.checkout(input("sale-key-00000001"), "cashier-1");
  assert.equal(saved.totalMinor, 2550);
  assert.equal((raw.prepare("SELECT COUNT(*) AS n FROM orders").get() as {n:number}).n, 1);
  assert.equal((raw.prepare("SELECT COUNT(*) AS n FROM order_items").get() as {n:number}).n, 1);
  assert.equal((raw.prepare("SELECT COUNT(*) AS n FROM payments").get() as {n:number}).n, 1);
  assert.equal((raw.prepare("SELECT quantity_delta AS q FROM inventory_movements").get() as {q:number}).q, -1);
  assert.equal((raw.prepare("SELECT COUNT(*) AS n FROM receipts").get() as {n:number}).n, 1);
  assert.equal((raw.prepare("SELECT COUNT(*) AS n FROM audit_logs").get() as {n:number}).n, 1);
  assert.equal(pos.getPendingCount(), 1);
});

test("invalid payment rolls back every checkout write", () => {
  assert.throws(() => pos.checkout(input("sale-key-00000002", 100), "cashier-1"), /Payment total/);
  for (const table of ["orders", "order_items", "payments", "inventory_movements", "receipts", "audit_logs", "sync_queue"]) {
    assert.equal((raw.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as {n:number}).n, 0, `${table} should roll back`);
  }
});

test("cashier policy allows configured discounts and records the reason", () => {
  raw.prepare("UPDATE cashiers SET can_discount=1,max_discount_percent=10,max_discount_minor=500 WHERE id='cashier-1'").run();
  const result = pos.checkout({ ...input("sale-key-00000005", 2300), discountMinor: 250, discountReason: "Customer recovery" }, "cashier-1");
  assert.equal(result.totalMinor, 2300);
  assert.equal((raw.prepare("SELECT reason FROM discount_events").get() as {reason:string}).reason, "Customer recovery");
});

test("discount over cashier limit requires a provisioned supervisor", () => {
  raw.prepare("UPDATE cashiers SET can_discount=1,max_discount_percent=5,max_discount_minor=500 WHERE id='cashier-1'").run();
  assert.throws(() => pos.checkout({ ...input("sale-key-00000006", 2000), discountMinor: 550, discountReason: "Service issue" }, "cashier-1"), /Supervisor approval/);
  raw.prepare(`INSERT INTO cashiers(id,username,display_name,credential_hash,credential_salt,verifier_kind,policy_version,offline_expires_at,supervisor,policy_token)
    VALUES('supervisor-1','lead','Lead','hash','salt','scrypt-v1',1,?,1,'supervisor-policy')`).run(new Date(Date.now()+60_000).toISOString());
  const result = pos.checkout({ ...input("sale-key-00000007", 2000), discountMinor: 550, discountReason: "Service issue", supervisorId:"supervisor-1", supervisorPolicyToken:"supervisor-policy" }, "cashier-1");
  assert.equal(result.totalMinor, 2000);
  assert.equal((raw.prepare("SELECT supervisor_id FROM discount_events").get() as {supervisor_id:string}).supervisor_id, "supervisor-1");
});

test("repeated idempotency key returns the original offline receipt without duplicate sale", () => {
  const first = pos.checkout(input("sale-key-00000003"), "cashier-1");
  const retry = pos.checkout(input("sale-key-00000003"), "cashier-1");
  assert.deepEqual(retry, first);
  assert.equal((raw.prepare("SELECT COUNT(*) AS n FROM orders").get() as {n:number}).n, 1);
  assert.equal(pos.getPendingCount(), 1);
});

test("completed sale and queue survive closing and reopening SQLite", () => {
  const saved = pos.checkout(input("sale-key-00000004"), "cashier-1");
  raw.close(); pos.close();
  pos = new PosDatabase(join(directory, "pos.sqlite"), migration);
  raw = new Database(join(directory, "pos.sqlite"));
  assert.equal((raw.prepare("SELECT id FROM orders WHERE id=?").get(saved.orderId) as {id:string}).id, saved.orderId);
  assert.equal(pos.getPendingCount(), 1);
});
