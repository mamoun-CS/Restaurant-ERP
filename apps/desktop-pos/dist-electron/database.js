"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosDatabase = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const node_crypto_1 = require("node:crypto");
const node_crypto_2 = require("node:crypto");
const node_crypto_3 = require("node:crypto");
const node_util_1 = require("node:util");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const shared_business_logic_1 = require("@restaurant/shared-business-logic");
const scrypt = (0, node_util_1.promisify)(node_crypto_3.scrypt);
class PosDatabase {
    db;
    constructor(filePath, migrationPath) {
        this.db = new better_sqlite3_1.default(filePath);
        this.db.pragma("journal_mode = WAL");
        this.db.pragma("foreign_keys = ON");
        this.db.pragma("busy_timeout = 5000");
        this.db.exec((0, node_fs_1.readFileSync)(migrationPath, "utf8"));
        const orderConfirmationMigration = (0, node_path_1.join)((0, node_path_1.dirname)(migrationPath), "002-order-confirmation.sql");
        if (!this.db.prepare("SELECT 1 FROM schema_migrations WHERE version=2").get())
            this.db.exec((0, node_fs_1.readFileSync)(orderConfirmationMigration, "utf8"));
        const offlineAccountMigration = (0, node_path_1.join)((0, node_path_1.dirname)(migrationPath), "003-offline-account-type.sql");
        if (!this.db.prepare("SELECT 1 FROM schema_migrations WHERE version=3").get())
            this.db.exec((0, node_fs_1.readFileSync)(offlineAccountMigration, "utf8"));
        const catalogTagsMigration = (0, node_path_1.join)((0, node_path_1.dirname)(migrationPath), "004-catalog-tags.sql");
        if (!this.db.prepare("SELECT 1 FROM schema_migrations WHERE version=4").get())
            this.db.exec((0, node_fs_1.readFileSync)(catalogTagsMigration, "utf8"));
    }
    listProducts(search = "") {
        const q = search.trim();
        return this.db.prepare(`SELECT id, sku, barcode, name_en AS nameEn, name_ar AS nameAr,
      price_minor AS priceMinor, currency_code AS currencyCode,category_id AS categoryId,
      (SELECT name_en FROM categories WHERE id=products.category_id) AS categoryNameEn,
      (SELECT name_ar FROM categories WHERE id=products.category_id) AS categoryNameAr,tags_json AS tagsJson FROM products
      WHERE active=1 AND (?='' OR sku LIKE ? OR barcode LIKE ? OR name_en LIKE ? OR name_ar LIKE ? OR tags_json LIKE ? OR category_id IN (SELECT id FROM categories WHERE name_ar LIKE ? OR name_en LIKE ? OR tags_json LIKE ?))
      ORDER BY CASE WHEN barcode=? OR sku=? THEN 0 ELSE 1 END, name_en LIMIT 100`).all(q, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, q, q)
            .map((row) => { const item = row; const { tagsJson, ...product } = item; return { ...product, tags: JSON.parse(tagsJson) }; });
    }
    getMetadata(key) {
        const row = this.db.prepare("SELECT value FROM sync_metadata WHERE key=?").get(key);
        return row?.value ?? null;
    }
    setMetadata(key, value) {
        this.db.prepare("INSERT INTO sync_metadata(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(key, value);
    }
    getPendingCount() {
        return this.db.prepare("SELECT COUNT(*) AS count FROM sync_queue WHERE status IN ('pending','processing','failed')").get().count;
    }
    listSyncIssues() {
        return this.db.prepare(`SELECT r.receipt_number AS receiptNumber,q.status,q.attempt_count AS attemptCount,
      q.next_attempt_at AS nextAttemptAt,q.error_message AS errorMessage,o.created_at AS createdAt,o.total_minor AS totalMinor,o.currency_code AS currencyCode
      FROM sync_queue q JOIN orders o ON o.id=q.entity_id JOIN receipts r ON r.order_id=o.id
      WHERE q.status IN ('pending','processing','failed') ORDER BY CASE q.status WHEN 'failed' THEN 0 ELSE 1 END,o.created_at LIMIT 20`)
            .all();
    }
    retryFailedSync() {
        const now = new Date().toISOString();
        const retry = this.db.transaction(() => {
            const failed = this.db.prepare("SELECT entity_id FROM sync_queue WHERE status='failed'").all();
            this.db.prepare("UPDATE sync_queue SET status='pending',next_attempt_at=?,error_message=NULL,updated_at=? WHERE status='failed'").run(now, now);
            for (const row of failed)
                this.db.prepare("UPDATE orders SET sync_status='pending' WHERE id=?").run(row.entity_id);
            this.setMetadata("last_sync_error", "");
        });
        retry.immediate();
    }
    getCashierCount() {
        return this.db.prepare("SELECT COUNT(*) AS count FROM cashiers WHERE active=1 AND offline_expires_at > ?").get(new Date().toISOString()).count;
    }
    getOpenCashSession(cashierId) {
        const session = this.db.prepare("SELECT id,opened_at AS openedAt,opening_minor AS openingMinor,register_cloud_id AS registerCloudId FROM cash_register_sessions WHERE cashier_id=? AND status='OPEN' ORDER BY opened_at DESC LIMIT 1").get(cashierId);
        if (!session)
            return null;
        const sales = this.db.prepare("SELECT COALESCE(SUM(total_minor),0) AS total FROM orders WHERE shift_id=? AND status='COMPLETED'").get(session.id);
        return { ...session, expectedMinor: session.openingMinor + sales.total };
    }
    listRecentOrders() {
        return this.db.prepare(`SELECT o.id,o.created_at AS createdAt,o.total_minor AS totalMinor,r.receipt_number AS receiptNumber,
      c.display_name AS cashierName,o.order_type AS orderType,o.customer_name AS customerName,o.sync_status AS syncStatus
      FROM orders o JOIN receipts r ON r.order_id=o.id JOIN cashiers c ON c.id=o.cashier_id
      ORDER BY o.created_at DESC LIMIT 50`).all();
    }
    openCashSession(cashierId, openingMinor) {
        if (!Number.isSafeInteger(openingMinor) || openingMinor < 0)
            throw new Error("Enter a valid opening cash amount.");
        const transaction = this.db.transaction(() => {
            if (this.db.prepare("SELECT 1 FROM cash_register_sessions WHERE cashier_id=? AND status='OPEN'").get(cashierId))
                throw new Error("This cashier already has an open cash shift.");
            const id = (0, node_crypto_1.randomUUID)(), openedAt = new Date().toISOString(), registerCloudId = this.getMetadata("register_id");
            this.db.prepare("INSERT INTO cash_register_sessions(id,register_cloud_id,cashier_id,opened_at,opening_minor,status) VALUES(?,?,?,?,?,'OPEN')").run(id, registerCloudId, cashierId, openedAt, openingMinor);
            this.db.prepare("INSERT INTO audit_logs(id,actor_id,action,entity_type,entity_id,details_json,created_at) VALUES(?,?,'CASH_SHIFT_OPENED','cash_register_session',?,?,?)").run((0, node_crypto_1.randomUUID)(), cashierId, id, JSON.stringify({ openingMinor, registerCloudId }), openedAt);
            return { id, openedAt, openingMinor, expectedMinor: openingMinor, registerCloudId };
        });
        return transaction.immediate();
    }
    closeCashSession(cashierId, closingMinor) {
        if (!Number.isSafeInteger(closingMinor) || closingMinor < 0)
            throw new Error("Enter a valid counted cash amount.");
        const transaction = this.db.transaction(() => {
            const session = this.getOpenCashSession(cashierId);
            if (!session)
                throw new Error("There is no open cash shift for this cashier.");
            const closedAt = new Date().toISOString(), differenceMinor = closingMinor - session.expectedMinor;
            this.db.prepare("UPDATE cash_register_sessions SET closed_at=?,closing_minor=?,status='CLOSED' WHERE id=? AND status='OPEN'").run(closedAt, closingMinor, session.id);
            this.db.prepare("INSERT INTO audit_logs(id,actor_id,action,entity_type,entity_id,details_json,created_at) VALUES(?,?,'CASH_SHIFT_CLOSED','cash_register_session',?,?,?)").run((0, node_crypto_1.randomUUID)(), cashierId, session.id, JSON.stringify({ openingMinor: session.openingMinor, expectedMinor: session.expectedMinor, closingMinor, differenceMinor }), closedAt);
            return { id: session.id, closedAt, openingMinor: session.openingMinor, expectedMinor: session.expectedMinor, closingMinor, differenceMinor };
        });
        return transaction.immediate();
    }
    listCoupons() {
        return this.db.prepare("SELECT code,type,value,starts_at AS startsAt,ends_at AS endsAt,active,max_uses AS maxUses,used_count AS usedCount FROM discount_coupons").all();
    }
    getCatalogHash() {
        const categories = this.db.prepare(`SELECT id,cloud_id AS cloudId,name_en AS nameEn,name_ar AS nameAr,sort_order AS sortOrder,active,server_version AS serverVersion,tags_json AS tagsJson FROM categories ORDER BY id`).all();
        const normalizedCategories = categories.map(({ tagsJson, ...category }) => ({ ...category, active: Boolean(category.active), tags: JSON.parse(tagsJson) }));
        const products = this.db.prepare(`SELECT id,cloud_id AS cloudId,sku,barcode,name_en AS nameEn,name_ar AS nameAr,category_id AS categoryId,price_minor AS priceMinor,currency_code AS currencyCode,active,server_version AS serverVersion,sizes_json,addons_json,tags_json AS tagsJson FROM products ORDER BY id`).all();
        const normalizedProducts = products.map((product) => ({
            id: product.id, cloudId: product.cloudId, sku: product.sku, barcode: product.barcode, nameEn: product.nameEn, nameAr: product.nameAr,
            categoryId: product.categoryId, priceMinor: product.priceMinor, currencyCode: product.currencyCode, active: Boolean(product.active),
            serverVersion: product.serverVersion, sizes: JSON.parse(product.sizes_json), addons: JSON.parse(product.addons_json), tags: JSON.parse(product.tagsJson),
        }));
        return (0, node_crypto_2.createHash)("sha256").update(JSON.stringify({ categories: normalizedCategories, products: normalizedProducts })).digest("hex");
    }
    applyBootstrap(snapshot) {
        if (!snapshot.device?.id || !Array.isArray(snapshot.categories) || !Array.isArray(snapshot.products) || !Array.isArray(snapshot.cashiers))
            throw new Error("Invalid POS bootstrap response.");
        const apply = this.db.transaction(() => {
            this.db.prepare("DELETE FROM products").run();
            this.db.prepare("DELETE FROM categories").run();
            const category = this.db.prepare(`INSERT INTO categories(id,cloud_id,name_en,name_ar,tags_json,sort_order,active,server_version,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?)`);
            for (const row of snapshot.categories)
                category.run(row.id, row.cloudId, row.nameEn, row.nameAr, JSON.stringify(row.tags ?? []), row.sortOrder, row.active ? 1 : 0, row.serverVersion, new Date(row.serverVersion).toISOString());
            const product = this.db.prepare(`INSERT INTO products(id,cloud_id,sku,barcode,name_en,name_ar,category_id,tags_json,price_minor,currency_code,sizes_json,addons_json,active,server_version,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
            for (const row of snapshot.products)
                product.run(row.id, row.cloudId, row.sku, row.barcode, row.nameEn, row.nameAr, row.categoryId, JSON.stringify(row.tags ?? []), row.priceMinor, row.currencyCode, JSON.stringify(row.sizes), JSON.stringify(row.addons), row.active ? 1 : 0, row.serverVersion, new Date(row.serverVersion).toISOString());
            const provisionedCashiers = snapshot.cashiers.filter((cashier) => cashier.credentialHash && cashier.credentialSalt && cashier.offlinePolicyToken);
            const keepIds = provisionedCashiers.map((cashier) => cashier.id);
            if (keepIds.length) {
                const placeholders = keepIds.map(() => "?").join(",");
                this.db.prepare(`DELETE FROM cashiers WHERE id NOT IN (${placeholders})`).run(...keepIds);
            }
            else
                this.db.prepare("DELETE FROM cashiers").run();
            const cashier = this.db.prepare(`INSERT INTO cashiers(id,cloud_id,username,display_name,credential_hash,credential_salt,verifier_kind,policy_version,offline_expires_at,can_discount,max_discount_percent,max_discount_minor,supervisor,policy_token,active,account_type)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?) ON CONFLICT(id) DO UPDATE SET cloud_id=excluded.cloud_id,username=excluded.username,display_name=excluded.display_name,credential_hash=excluded.credential_hash,credential_salt=excluded.credential_salt,verifier_kind=excluded.verifier_kind,policy_version=excluded.policy_version,offline_expires_at=excluded.offline_expires_at,can_discount=excluded.can_discount,max_discount_percent=excluded.max_discount_percent,max_discount_minor=excluded.max_discount_minor,supervisor=excluded.supervisor,policy_token=excluded.policy_token,active=1,account_type=excluded.account_type`);
            for (const row of provisionedCashiers) {
                cashier.run(row.id, row.cloudId, row.username.toLowerCase(), row.displayName, row.credentialHash, row.credentialSalt, row.verifierKind, row.policyVersion, row.offlineExpiresAt ?? "9999-12-31T23:59:59.999Z", row.canDiscount ? 1 : 0, row.maxDiscountPercent, row.maxDiscountMinor, row.supervisor || row.accountType === "ADMIN" ? 1 : 0, row.offlinePolicyToken, row.accountType ?? "CASHIER");
            }
            this.db.prepare("UPDATE discount_coupons SET active=0").run();
            const coupon = this.db.prepare(`INSERT INTO discount_coupons(code,type,value,starts_at,ends_at,active,max_uses,used_count)
        VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(code) DO UPDATE SET type=excluded.type,value=excluded.value,starts_at=excluded.starts_at,ends_at=excluded.ends_at,active=excluded.active,max_uses=excluded.max_uses,used_count=MAX(discount_coupons.used_count,excluded.used_count)`);
            for (const row of snapshot.coupons ?? [])
                coupon.run(row.code.toUpperCase(), row.type, row.value, row.startsAt, row.endsAt, row.active ? 1 : 0, row.maxUses, row.usedCount);
            this.setMetadata("device_id", snapshot.device.id);
            this.setMetadata("branch_id", snapshot.device.branchId);
            if (snapshot.device.registerId)
                this.setMetadata("register_id", snapshot.device.registerId);
            if (snapshot.branch)
                this.setMetadata("branch", JSON.stringify(snapshot.branch));
            if (snapshot.register)
                this.setMetadata("register", JSON.stringify(snapshot.register));
            this.setMetadata("catalog_version", String(snapshot.catalogVersion));
            this.setMetadata("catalog_hash", this.getCatalogHash());
            this.setMetadata("cloud_catalog_hash", snapshot.catalogHash ?? this.getCatalogHash());
            this.setMetadata("catalog_matches_cloud", String((snapshot.catalogHash ?? this.getCatalogHash()) === this.getCatalogHash()));
            this.setMetadata("last_catalog_sync", snapshot.serverTime);
            this.setMetadata("catalog_verified_at", snapshot.serverTime);
            this.setMetadata("last_sync_error", "");
        });
        apply.immediate();
    }
    claimSyncBatch(limit = 20) {
        const claim = this.db.transaction(() => {
            const rows = this.db.prepare(`SELECT id,entity_id,payload_json,attempt_count FROM sync_queue
        WHERE status='pending' AND next_attempt_at<=? ORDER BY created_at LIMIT ?`).all(new Date().toISOString(), limit);
            const update = this.db.prepare("UPDATE sync_queue SET status='processing',last_attempt_at=?,updated_at=? WHERE id=?");
            const now = new Date().toISOString();
            for (const row of rows) {
                update.run(now, now, row.id);
                this.db.prepare("UPDATE orders SET sync_status='processing' WHERE id=?").run(row.entity_id);
            }
            return rows.map((row) => ({ id: row.id, entityId: row.entity_id, payload: JSON.parse(row.payload_json), attempts: row.attempt_count }));
        });
        return claim.immediate();
    }
    recoverInterruptedSync() {
        const now = new Date().toISOString();
        this.db.prepare("UPDATE sync_queue SET status='pending',next_attempt_at=?,updated_at=?,error_message=COALESCE(error_message,'Recovered interrupted sync.') WHERE status='processing'").run(now, now);
        this.db.prepare("UPDATE orders SET sync_status='pending' WHERE sync_status='processing'").run();
    }
    markSyncSucceeded(queueId, invoiceId, officialNumber) {
        const now = new Date().toISOString();
        const finish = this.db.transaction(() => {
            const entry = this.db.prepare("SELECT entity_id FROM sync_queue WHERE id=?").get(queueId);
            if (!entry)
                return;
            this.db.prepare("UPDATE sync_queue SET status='synced',error_message=NULL,updated_at=? WHERE id=?").run(now, queueId);
            this.db.prepare("UPDATE orders SET cloud_id=?,server_number=?,sync_status='synced',synced_at=? WHERE id=?").run(invoiceId, officialNumber, now, entry.entity_id);
        });
        finish.immediate();
    }
    markSyncFailure(queueId, error, permanent, attempts) {
        const now = new Date();
        const attemptCount = attempts + 1;
        const delay = permanent ? 0 : Math.min(6 * 60 * 60_000, 2_000 * (2 ** Math.min(attemptCount, 10))) + Math.random() * 2_000;
        const next = new Date(now.getTime() + delay).toISOString();
        const state = permanent ? "failed" : "pending";
        const fail = this.db.transaction(() => {
            const entry = this.db.prepare("SELECT entity_id FROM sync_queue WHERE id=?").get(queueId);
            this.db.prepare("UPDATE sync_queue SET status=?,attempt_count=?,next_attempt_at=?,error_message=?,updated_at=? WHERE id=?").run(state, attemptCount, next, error.slice(0, 500), now.toISOString(), queueId);
            if (entry)
                this.db.prepare("UPDATE orders SET sync_status=? WHERE id=?").run(state, entry.entity_id);
            this.setMetadata("last_sync_error", error.slice(0, 500));
        });
        fail.immediate();
    }
    async authenticate(username, pin, supervisorOnly = false) {
        const cashier = this.db.prepare(`SELECT id,display_name,account_type,credential_hash,credential_salt,verifier_kind,offline_expires_at,policy_token,
      can_discount,max_discount_percent,max_discount_minor,supervisor,failed_attempts,locked_until,active FROM cashiers WHERE username=?`).get(username.trim().toLowerCase());
        if (!cashier || !cashier.active || Date.parse(cashier.offline_expires_at) <= Date.now() ||
            (supervisorOnly && cashier.account_type !== "ADMIN" && !cashier.supervisor) || (!supervisorOnly && cashier.account_type === "ADMIN") || (cashier.locked_until && Date.parse(cashier.locked_until) > Date.now()))
            return null;
        if (cashier.verifier_kind !== "scrypt-v1")
            return null;
        const candidate = (await scrypt(pin, Buffer.from(cashier.credential_salt, "hex"), 64));
        const expected = Buffer.from(cashier.credential_hash, "hex");
        const valid = expected.length === candidate.length && (0, node_crypto_3.timingSafeEqual)(candidate, expected);
        if (valid) {
            this.db.prepare("UPDATE cashiers SET failed_attempts=0,locked_until=NULL WHERE id=?").run(cashier.id);
            return { id: cashier.id, name: cashier.display_name, accountType: cashier.account_type, policyToken: cashier.policy_token, canDiscount: Boolean(cashier.can_discount), maxDiscountPercent: cashier.max_discount_percent, maxDiscountMinor: cashier.max_discount_minor, supervisor: Boolean(cashier.supervisor) };
        }
        const attempts = cashier.failed_attempts + 1;
        const lockedUntil = attempts >= 5 ? new Date(Date.now() + 5 * 60_000).toISOString() : null;
        this.db.prepare("UPDATE cashiers SET failed_attempts=?,locked_until=? WHERE id=?").run(attempts, lockedUntil, cashier.id);
        return null;
    }
    getOfflineAdminCredentialState(username) {
        const row = this.db.prepare("SELECT account_type,supervisor,active,offline_expires_at,locked_until FROM cashiers WHERE username=?").get(username.trim().toLowerCase());
        if (!row)
            return "missing";
        if (!row.active)
            return "inactive";
        if (row.account_type !== "ADMIN" && !row.supervisor)
            return "not-admin";
        if (!row.offline_expires_at || Date.parse(row.offline_expires_at) <= Date.now())
            return "expired";
        if (row.locked_until && Date.parse(row.locked_until) > Date.now())
            return "locked";
        return "ready";
    }
    checkout(input, cashierId) {
        if (!input.items.length)
            throw new Error("Add at least one product before checkout.");
        const db = this.db;
        const commit = db.transaction(() => {
            const now = new Date().toISOString();
            const prior = db.prepare(`SELECT o.id,o.total_minor AS totalMinor,r.receipt_number AS receiptNumber
        FROM orders o JOIN receipts r ON r.order_id=o.id WHERE o.idempotency_key=?`).get(input.idempotencyKey);
            if (prior)
                return { orderId: prior.id, receiptNumber: prior.receiptNumber, totalMinor: prior.totalMinor };
            const orderId = (0, node_crypto_1.randomUUID)();
            const openShift = this.db.prepare("SELECT id FROM cash_register_sessions WHERE cashier_id=? AND status='OPEN' ORDER BY opened_at DESC LIMIT 1").get(cashierId);
            const items = input.items.map((line) => {
                const product = db.prepare("SELECT id, cloud_id, name_en, price_minor, active FROM products WHERE id=?").get(line.productId);
                if (!product || !product.active)
                    throw new Error("A selected product is no longer available in the local catalog.");
                if (!Number.isSafeInteger(line.quantity) || line.quantity < 1)
                    throw new Error("Product quantity must be a positive whole number.");
                const unitPriceMinor = product.price_minor;
                if (!Number.isSafeInteger(unitPriceMinor) || unitPriceMinor < 0)
                    throw new Error("Invalid product price.");
                return { ...line, product, unitPriceMinor, lineTotalMinor: unitPriceMinor * line.quantity };
            });
            const subtotalMinor = items.reduce((sum, item) => sum + item.lineTotalMinor, 0);
            if (!Number.isSafeInteger(subtotalMinor))
                throw new Error("Sale total exceeds supported range.");
            const discountMinor = input.discountMinor ?? 0;
            const taxMinor = input.taxMinor ?? 0;
            if (![discountMinor, taxMinor].every(Number.isSafeInteger) || discountMinor < 0 || discountMinor > subtotalMinor || taxMinor < 0)
                throw new Error("Invalid discount or tax amount.");
            if (taxMinor !== 0)
                throw new Error("Tax configuration is not provisioned on this device.");
            const cashier = db.prepare("SELECT policy_version,policy_token,can_discount,max_discount_percent,max_discount_minor FROM cashiers WHERE id=? AND active=1").get(cashierId);
            if (!cashier || input.cashierPolicyToken !== cashier.policy_token)
                throw new Error("Cashier permission snapshot is unavailable or out of date. Sync this device.");
            const cashierDiscountLimit = (0, shared_business_logic_1.discountLimitMinor)(subtotalMinor, Boolean(cashier.can_discount), cashier.max_discount_percent, cashier.max_discount_minor);
            let coupon;
            if (input.couponCode) {
                coupon = db.prepare("SELECT code,type,value,starts_at,ends_at,active,max_uses,used_count FROM discount_coupons WHERE code=?").get(input.couponCode.trim().toUpperCase());
                if (!coupon || !coupon.active || Date.parse(coupon.starts_at) > Date.now() || Date.parse(coupon.ends_at) < Date.now() || (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses))
                    throw new Error("Coupon is invalid, expired, or has reached its usage limit. Sync the terminal and try again.");
                const expected = coupon.type === "PERCENTAGE" ? Math.floor(subtotalMinor * coupon.value / 100) : Math.round(coupon.value * 100);
                if (discountMinor !== Math.min(expected, subtotalMinor))
                    throw new Error("Coupon discount does not match its configured value.");
            }
            else if (discountMinor > cashierDiscountLimit)
                throw new Error("This discount exceeds your permitted limit.");
            if (discountMinor > 0 && !coupon && (!input.discountReason?.trim() || input.discountReason.trim().length > 250))
                throw new Error("A discount reason is required.");
            if (input.supervisorId) {
                const supervisor = db.prepare("SELECT supervisor,active,offline_expires_at,policy_token FROM cashiers WHERE id=?").get(input.supervisorId);
                if (!supervisor?.supervisor || !supervisor.active || Date.parse(supervisor.offline_expires_at) <= Date.now() || supervisor.policy_token !== input.supervisorPolicyToken)
                    throw new Error("Supervisor approval is invalid or expired.");
            }
            const totalMinor = (0, shared_business_logic_1.saleTotals)(subtotalMinor, discountMinor, taxMinor).totalMinor;
            const paidMinor = input.payments.reduce((sum, p) => sum + p.amountMinor, 0);
            if (!input.payments.length || !input.payments.every((p) => Number.isSafeInteger(p.amountMinor) && p.amountMinor > 0) || paidMinor !== totalMinor)
                throw new Error("Payment total must equal the sale total.");
            if (input.payments.some((payment) => payment.method !== "CASH"))
                throw new Error("Only cash payments are enabled until payment terminals are configured.");
            db.prepare(`INSERT INTO orders(id,idempotency_key,device_id,cashier_id,shift_id,status,currency_code,
        subtotal_minor,discount_minor,tax_minor,total_minor,created_at,order_type,customer_name,customer_phone,customer_address,customer_notes) VALUES(?,?,?,?,?,'COMPLETED',?,?,?,?,?,?,?,?,?,?,?)`)
                .run(orderId, input.idempotencyKey, input.deviceId, cashierId, input.shiftId ?? openShift?.id ?? null, input.currencyCode, subtotalMinor, discountMinor, taxMinor, totalMinor, now, input.orderType ?? "PICKUP", input.customerName?.trim() || null, input.customerPhone?.trim() || null, input.customerAddress?.trim() || null, input.customerNotes?.trim() || null);
            const addItem = db.prepare(`INSERT INTO order_items(id,order_id,product_id,product_cloud_id,product_name_snapshot,
        quantity,unit_price_minor,line_total_minor,options_json) VALUES(?,?,?,?,?,?,?,?,?)`);
            const addMovement = db.prepare(`INSERT INTO inventory_movements(id,order_id,product_id,quantity_delta,source,created_at)
        VALUES(?,?,? ,?,'SALE',?)`);
            for (const item of items) {
                addItem.run((0, node_crypto_1.randomUUID)(), orderId, item.product.id, item.product.cloud_id, item.product.name_en, item.quantity, item.unitPriceMinor, item.lineTotalMinor, JSON.stringify(item.options ?? []));
                addMovement.run((0, node_crypto_1.randomUUID)(), orderId, item.product.id, -item.quantity, now);
            }
            const addPayment = db.prepare(`INSERT INTO payments(id,order_id,method,amount_minor,currency_code,processor_reference,created_at)
        VALUES(?,?,?,?,?,?,?)`);
            for (const payment of input.payments)
                addPayment.run((0, node_crypto_1.randomUUID)(), orderId, payment.method, payment.amountMinor, payment.currencyCode, payment.processorReference ?? null, now);
            if (discountMinor > 0)
                db.prepare(`INSERT INTO discount_events(id,order_id,cashier_id,supervisor_id,amount_minor,reason,policy_version,created_at)
        VALUES(?,?,?,?,?,?,?,?)`).run((0, node_crypto_1.randomUUID)(), orderId, cashierId, input.supervisorId ?? null, discountMinor, coupon ? `COUPON:${coupon.code}` : input.discountReason.trim(), cashier.policy_version, now);
            if (coupon)
                db.prepare("UPDATE discount_coupons SET used_count=used_count+1 WHERE code=?").run(coupon.code);
            const receiptNumber = `OFFLINE-${orderId.replaceAll("-", "").slice(0, 10).toUpperCase()}`;
            db.prepare("INSERT INTO receipts(id,order_id,receipt_number,updated_at) VALUES(?,?,?,?)").run((0, node_crypto_1.randomUUID)(), orderId, receiptNumber, now);
            const payload = JSON.stringify({
                id: orderId, idempotencyKey: input.idempotencyKey, cashierId, createdAt: now,
                orderType: input.orderType ?? "PICKUP", customerName: input.customerName?.trim() || undefined, customerPhone: input.customerPhone?.trim() || undefined, customerAddress: input.customerAddress?.trim() || undefined, customerNotes: input.customerNotes?.trim() || undefined,
                currencyCode: input.currencyCode, subtotalMinor, discountMinor, taxMinor, totalMinor,
                items: items.map((item) => ({ productId: item.product.cloud_id || item.product.id, productName: item.product.name_en, quantity: item.quantity, unitPriceMinor: item.unitPriceMinor, options: item.options ?? [] })),
                payments: input.payments, discountReason: input.discountReason, couponCode: input.couponCode?.trim().toUpperCase(), cashierPolicyToken: cashier.policy_token,
                supervisorId: input.supervisorId, supervisorPolicyToken: input.supervisorPolicyToken,
            });
            db.prepare(`INSERT INTO sync_queue(id,entity_type,entity_id,operation,payload_json,idempotency_key,next_attempt_at,created_at,updated_at)
        VALUES(?,'order',?,'create',?,?,?, ?,?)`).run((0, node_crypto_1.randomUUID)(), orderId, payload, input.idempotencyKey, now, now, now);
            db.prepare("INSERT INTO audit_logs(id,actor_id,action,entity_type,entity_id,created_at) VALUES(?,?,'ORDER_COMPLETED','order',?,?)")
                .run((0, node_crypto_1.randomUUID)(), cashierId, orderId, now);
            return { orderId, receiptNumber, totalMinor };
        });
        return commit.immediate();
    }
    close() { this.db.close(); }
}
exports.PosDatabase = PosDatabase;
