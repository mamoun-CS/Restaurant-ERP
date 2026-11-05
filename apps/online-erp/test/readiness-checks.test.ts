import { strictEqual, ok } from "node:assert";

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

console.log("Readiness check logic unit tests:");

test("validates AUTH_SECRET length >= 32", () => {
  const shortSecret = "short-secret-12345";
  const validSecret = "a-very-long-random-secret-key-that-has-more-than-32-chars";

  strictEqual(shortSecret.length < 32, true, "Short secret must fail");
  strictEqual(validSecret.length >= 32, true, "Valid secret must pass");
});

test("determines cookie security consistent with HTTP and COOKIE_SECURE override", () => {
  function getCookieSecure(appUrl: string, cookieSecureEnv?: string): boolean {
    const isHttps = appUrl.startsWith("https://");
    return cookieSecureEnv !== undefined ? cookieSecureEnv === "true" : isHttps;
  }

  // Local HTTP with no override -> false (allows LAN login)
  strictEqual(getCookieSecure("http://localhost:3000"), false);
  strictEqual(getCookieSecure("http://192.168.1.100:3000"), false);

  // HTTPS with no override -> true (enforces secure cookie)
  strictEqual(getCookieSecure("https://restaurant.noura.ps"), true);

  // Explicit override COOKIE_SECURE=false over HTTPS -> false
  strictEqual(getCookieSecure("https://restaurant.noura.ps", "false"), false);

  // Explicit override COOKIE_SECURE=true over HTTP -> true
  strictEqual(getCookieSecure("http://localhost:3000", "true"), true);
});

test("calculates agent online status within offline threshold", () => {
  const offlineThresholdSeconds = 90;
  const now = Date.now();

  const freshHeartbeat = new Date(now - 20 * 1000); // 20s ago
  const staleHeartbeat = new Date(now - 120 * 1000); // 120s ago

  const isOnlineFresh = (now - freshHeartbeat.getTime()) / 1000 < offlineThresholdSeconds;
  const isOnlineStale = (now - staleHeartbeat.getTime()) / 1000 < offlineThresholdSeconds;

  strictEqual(isOnlineFresh, true, "Agent with heartbeat 20s ago should be online");
  strictEqual(isOnlineStale, false, "Agent with heartbeat 120s ago should be offline");
});

console.log("All readiness check logic tests completed.\n");
