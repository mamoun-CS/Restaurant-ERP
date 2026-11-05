import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { strictEqual, ok } from "node:assert";
import { LocalJobQueue } from "../print-agent/src/queue";
import type { PrintJobDto } from "../print-agent/src/types";

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

console.log("Job idempotency and queue persistence tests:");

const testDir = path.join(os.tmpdir(), `test-queue-${Date.now()}`);

const sampleJob1: PrintJobDto = {
  id: "job-101",
  branchId: "branch-1",
  jobType: "CUSTOMER_RECEIPT",
  contentType: "HTML",
  content: "<h1>Test Receipt</h1>",
  copies: 1,
  paperWidth: "W80",
  status: "PENDING",
  attempts: 0,
  maxAttempts: 3,
  openCashDrawer: false,
  idempotencyKey: "invoice:inv-001:receipt:printer-1",
  createdAt: new Date().toISOString(),
};

test("enqueues new job with unseen idempotencyKey", () => {
  const queue = new LocalJobQueue(testDir);
  const enqueued = queue.enqueue(sampleJob1);
  ok(enqueued, "Job should be enqueued successfully");
  strictEqual(queue.getQueuedCount(), 1);
});

test("rejects duplicate enqueue with identical idempotencyKey", () => {
  const queue = new LocalJobQueue(testDir);
  const duplicate = queue.enqueue({
    ...sampleJob1,
    id: "job-102-diff-id-same-key",
  });
  ok(!duplicate, "Job with same idempotency key must be rejected");
  strictEqual(queue.getQueuedCount(), 1);
});

test("marks job printed and preserves idempotency after completion", () => {
  const queue = new LocalJobQueue(testDir);
  queue.markPrinting("job-101");
  queue.markCompleted("job-101", sampleJob1.idempotencyKey);
  ok(queue.isAlreadyPrinted(sampleJob1.idempotencyKey));
});

test("persists queue and printed keys across fresh LocalJobQueue reload", () => {
  // Create fresh instance pointing to same disk directory
  const reloadedQueue = new LocalJobQueue(testDir);
  ok(
    reloadedQueue.isAlreadyPrinted(sampleJob1.idempotencyKey),
    "Reloaded queue must still know key was printed",
  );

  const reEnqueued = reloadedQueue.enqueue(sampleJob1);
  ok(!reEnqueued, "Must not re-enqueue already printed key even after restart");
});

// Clean up
try {
  fs.rmSync(testDir, { recursive: true, force: true });
} catch {
  // ignore
}

console.log("All job idempotency and queue persistence tests completed.\n");
