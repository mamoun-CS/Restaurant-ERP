import { strictEqual, ok } from "node:assert";
import { printerSchema } from "../src/lib/printing/validation";

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (error: unknown) {
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    console.log(`    ${(error as Error).message}`);
    process.exitCode = 1;
  }
}

console.log("Printer connection and paper width validation tests:");

const baseValidPrinter = {
  branchId: "branch-1",
  printDeviceId: "device-1",
  printerType: "CASHIER" as const,
  displayName: "Main Cashier",
  localPrinterName: "POS-80",
  copies: 1,
  paperWidth: "W80" as const,
  enabled: true,
  autoPrint: true,
  openCashDrawer: false,
};

test("accepts valid USB printer with local printer name", () => {
  const result = printerSchema.safeParse({
    ...baseValidPrinter,
    connectionType: "USB",
  });
  ok(result.success, "Should accept valid USB printer");
  strictEqual(result.data.connectionType, "USB");
});

test("accepts valid LAN printer with IP address and default port", () => {
  const result = printerSchema.safeParse({
    ...baseValidPrinter,
    connectionType: "LAN",
    ipAddress: "192.168.1.200",
  });
  ok(result.success, "Should accept valid LAN printer");
  strictEqual(result.data.connectionType, "LAN");
  strictEqual(result.data.ipAddress, "192.168.1.200");
  strictEqual(result.data.port, 9100);
});

test("accepts LAN printer with custom port", () => {
  const result = printerSchema.safeParse({
    ...baseValidPrinter,
    connectionType: "LAN",
    ipAddress: "192.168.1.201",
    port: 9200,
  });
  ok(result.success, "Should accept valid LAN printer with custom port");
  strictEqual(result.data.port, 9200);
});

test("rejects LAN printer when IP address is missing", () => {
  const result = printerSchema.safeParse({
    ...baseValidPrinter,
    connectionType: "LAN",
    ipAddress: "",
  });
  ok(!result.success, "Should reject LAN printer without IP address");
});

test("rejects invalid connectionType", () => {
  const result = printerSchema.safeParse({
    ...baseValidPrinter,
    connectionType: "BLUETOOTH",
  });
  ok(!result.success, "Should reject unknown connectionType");
});

test("accepts W58 paper width", () => {
  const result = printerSchema.safeParse({
    ...baseValidPrinter,
    paperWidth: "W58",
  });
  ok(result.success, "Should accept W58 paper width");
  strictEqual(result.data.paperWidth, "W58");
});

test("accepts CUSTOM paper width with positive customWidthMm", () => {
  const result = printerSchema.safeParse({
    ...baseValidPrinter,
    paperWidth: "CUSTOM",
    customWidthMm: 72,
  });
  ok(result.success, "Should accept CUSTOM paper width with valid mm");
  strictEqual(result.data.customWidthMm, 72);
});

test("rejects CUSTOM paper width when customWidthMm is missing or 0", () => {
  const result = printerSchema.safeParse({
    ...baseValidPrinter,
    paperWidth: "CUSTOM",
    customWidthMm: 0,
  });
  ok(!result.success, "Should reject CUSTOM paper width with 0 mm");
});

console.log("All printer connection validation tests completed.\n");
