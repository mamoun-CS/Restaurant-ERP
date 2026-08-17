const { strictEqual, deepEqual, ok } = require("node:assert");

function test(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (error) {
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${error.message}`);
    process.exitCode = 1;
  }
}

console.log("Cash drawer flag logic (unit tests):");

function shouldOpenDrawer({ paymentMethod, openCashDrawer, isReprint = false, invoiceStatus = "PAID" }) {
  if (invoiceStatus !== "PAID") return false;
  if (isReprint) return false;
  if (paymentMethod !== "CASH") return false;
  return Boolean(openCashDrawer);
}

test("opens drawer for CASH payment with drawer enabled", () => {
  ok(shouldOpenDrawer({ paymentMethod: "CASH", openCashDrawer: true }));
});

test("does not open drawer for CARD payment", () => {
  ok(!shouldOpenDrawer({ paymentMethod: "CREDIT_CARD", openCashDrawer: true }));
});

test("does not open drawer for BANK payment", () => {
  ok(!shouldOpenDrawer({ paymentMethod: "BANK", openCashDrawer: true }));
});

test("does not open drawer when cash drawer is disabled", () => {
  ok(!shouldOpenDrawer({ paymentMethod: "CASH", openCashDrawer: false }));
});

test("does not open drawer for reprints", () => {
  ok(!shouldOpenDrawer({ paymentMethod: "CASH", openCashDrawer: true, isReprint: true }));
});

test("does not open drawer for unpaid invoice", () => {
  ok(!shouldOpenDrawer({ paymentMethod: "CASH", openCashDrawer: true, invoiceStatus: "PENDING" }));
});

test("does not open drawer for voided invoice", () => {
  ok(!shouldOpenDrawer({ paymentMethod: "CASH", openCashDrawer: true, invoiceStatus: "VOID" }));
});

console.log("\nAll cash drawer logic tests completed.");
