const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { strictEqual, deepEqual, ok } = require("node:assert");
const { buildDrawerPulse, uniquePdfPath, uniqueTestPdfPath } = require("../src/printer");

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

console.log("buildDrawerPulse:");

test("generates default ESC/POS pulse command", () => {
  const pulse = buildDrawerPulse({});
  deepEqual(Array.from(pulse), [0x1b, 0x70, 0x00, 25, 250]);
});

test("generates command with custom pin", () => {
  const pulse = buildDrawerPulse({ pin: 1 });
  deepEqual(Array.from(pulse), [0x1b, 0x70, 0x01, 25, 250]);
});

test("generates command with custom pulse timings", () => {
  const pulse = buildDrawerPulse({ pin: 0, pulseOn: 50, pulseOff: 300 });
  deepEqual(Array.from(pulse), [0x1b, 0x70, 0x00, 50, 255]);
});

test("clamps pulseOn to 255 max", () => {
  const pulse = buildDrawerPulse({ pulseOn: 300 });
  deepEqual(Array.from(pulse)[3], 255);
});

test("clamps pulseOn to 1 min", () => {
  const pulse = buildDrawerPulse({ pulseOn: 0 });
  deepEqual(Array.from(pulse)[3], 1);
});

test("clamps pin to 0-255 range", () => {
  const pulse = buildDrawerPulse({ pin: 300 });
  deepEqual(Array.from(pulse)[2], 255);
});

test("clamps pulseOff to 255 max", () => {
  const pulse = buildDrawerPulse({ pulseOff: 500 });
  deepEqual(Array.from(pulse)[4], 255);
});

test("defaults pin to 0 when not provided", () => {
  const pulse = buildDrawerPulse({});
  deepEqual(Array.from(pulse)[2], 0);
});

console.log("\nAll buildDrawerPulse tests completed.");

console.log("\nuniquePdfPath:");

test("generates sanitized invoice PDF filenames", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nova-print-agent-"));
  const filePath = uniquePdfPath(dir, "INV/123:ABC");
  strictEqual(path.dirname(filePath), dir);
  ok(/^invoice-INV-123-ABC-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.pdf$/.test(path.basename(filePath)));
});

test("adds suffix when a generated PDF filename already exists", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nova-print-agent-"));
  const first = uniquePdfPath(dir, "123");
  fs.writeFileSync(first, "");
  const second = uniquePdfPath(dir, "123");
  ok(second.endsWith("-2.pdf"));
});

test("generates test PDF filenames", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nova-print-agent-"));
  const filePath = uniqueTestPdfPath(dir);
  strictEqual(path.dirname(filePath), dir);
  ok(/^test-print-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.pdf$/.test(path.basename(filePath)));
});

console.log("\nAll uniquePdfPath tests completed.");
