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

console.log("Validation schemas:");

const { cashDrawerTestSchema } = require("../src/lib/printing/validation");

test("accepts valid cash drawer test request", () => {
  const result = cashDrawerTestSchema.safeParse({ command: "OPEN_CASH_DRAWER", printerId: "printer-123" });
  ok(result.success);
  deepEqual(result.data, { command: "OPEN_CASH_DRAWER", printerId: "printer-123" });
});

test("rejects missing printerId", () => {
  const result = cashDrawerTestSchema.safeParse({ command: "OPEN_CASH_DRAWER" });
  ok(!result.success);
});

test("rejects invalid command", () => {
  const result = cashDrawerTestSchema.safeParse({ command: "INVALID", printerId: "printer-123" });
  ok(!result.success);
});

test("rejects empty printerId", () => {
  const result = cashDrawerTestSchema.safeParse({ command: "OPEN_CASH_DRAWER", printerId: "" });
  ok(!result.success);
});

console.log("\nAll validation tests completed.");
