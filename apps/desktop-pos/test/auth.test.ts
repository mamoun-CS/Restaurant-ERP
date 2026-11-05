import { afterEach, beforeEach, test } from "node:test";
import { strict as assert } from "node:assert";
import Database from "better-sqlite3";
import { scrypt as scryptCallback, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PosDatabase } from "../electron/database";

const scrypt = promisify(scryptCallback);
let directory: string;
let pos: PosDatabase;
let raw: Database.Database;
const migration = resolve("database/migrations/001-initial.sql");

beforeEach(async () => {
  directory = mkdtempSync(join(tmpdir(), "restaurant-auth-test-"));
  pos = new PosDatabase(join(directory, "pos.sqlite"), migration);
  raw = new Database(join(directory, "pos.sqlite"));
  const salt = randomBytes(16);
  const hash = (await scrypt("7351", salt, 64)) as Buffer;
  raw.prepare(`INSERT INTO cashiers(id,username,display_name,credential_hash,credential_salt,verifier_kind,policy_version,offline_expires_at,policy_token)
    VALUES('cashier-1','maya','Maya',?,?,'scrypt-v1',1,?,'signed-policy')`).run(hash.toString("hex"), salt.toString("hex"), new Date(Date.now() + 60_000).toISOString());
});

afterEach(() => { raw.close(); pos.close(); rmSync(directory, { recursive: true, force: true }); });

test("offline PIN verification returns a cashier without exposing credential material", async () => {
  const user = await pos.authenticate("MAYA", "7351");
  assert.equal(user?.id, "cashier-1");
  assert.equal(user?.policyToken, "signed-policy");
  const row = raw.prepare("SELECT credential_hash,credential_salt FROM cashiers WHERE id='cashier-1'").get() as {credential_hash:string;credential_salt:string};
  assert.notEqual(row.credential_hash, "7351");
  assert.equal(row.credential_salt.length, 32);
});

test("five invalid PIN attempts persist a temporary lockout", async () => {
  for (let attempt = 0; attempt < 5; attempt++) assert.equal(await pos.authenticate("maya", "0000"), null);
  assert.equal(await pos.authenticate("maya", "7351"), null);
  const row = raw.prepare("SELECT failed_attempts,locked_until FROM cashiers WHERE id='cashier-1'").get() as {failed_attempts:number;locked_until:string};
  assert.equal(row.failed_attempts, 5);
  assert.ok(Date.parse(row.locked_until) > Date.now());
});

test("expired offline credentials cannot authenticate", async () => {
  raw.prepare("UPDATE cashiers SET offline_expires_at=? WHERE id='cashier-1'").run(new Date(Date.now() - 1000).toISOString());
  assert.equal(await pos.authenticate("maya", "7351"), null);
});
