import { strictEqual } from "node:assert";
import { resolvePaperWidthCss } from "../src/lib/printing/receipt-template";
import { EscPos } from "../print-agent/src/escpos/commands";

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

console.log("Paper width resolution tests:");

test("resolves W58 to 58mm CSS width", () => {
  strictEqual(resolvePaperWidthCss("W58"), "58mm");
});

test("resolves W80 to 80mm CSS width", () => {
  strictEqual(resolvePaperWidthCss("W80"), "80mm");
});

test("resolves A4 to 210mm CSS width", () => {
  strictEqual(resolvePaperWidthCss("A4"), "210mm");
});

test("resolves CUSTOM width in mm", () => {
  strictEqual(resolvePaperWidthCss("CUSTOM", 72), "72mm");
});

test("defaults unspecified width to 80mm", () => {
  strictEqual(resolvePaperWidthCss(undefined), "80mm");
});

test("resolves W58 to 384 printable dots @ 203 DPI", () => {
  strictEqual(EscPos.resolveDotWidth("W58"), 384);
});

test("resolves W80 to 576 printable dots @ 203 DPI", () => {
  strictEqual(EscPos.resolveDotWidth("W80"), 576);
});

test("resolves CUSTOM 72mm to 512 printable dots (byte-aligned)", () => {
  strictEqual(EscPos.resolveDotWidth("CUSTOM", 72), 512);
});

console.log("All paper width resolution tests completed.\n");
