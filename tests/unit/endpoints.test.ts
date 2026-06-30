/**
 * Unit tests for endpoint validation
 * Run: npx ts-node tests/unit/endpoints.test.ts
 */

import {
  validateRpcEndpoint,
  validateWsEndpoint,
} from "../../src/utils/endpoints";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`✓ ${message}`);
  } else {
    failed++;
    console.error(`✗ ${message}`);
  }
}

function assertThrows(fn: () => void, message: string) {
  try {
    fn();
    failed++;
    console.error(`✗ ${message} (did not throw)`);
  } catch {
    passed++;
    console.log(`✓ ${message}`);
  }
}

console.log("\nTesting endpoint validation\n");

assert(
  validateRpcEndpoint("https://full-node.testnet-1.coreum.dev:26657") ===
    "https://full-node.testnet-1.coreum.dev:26657",
  "accepts valid https RPC endpoint"
);
assert(
  validateWsEndpoint("wss://full-node.testnet-1.coreum.dev:26657") ===
    "wss://full-node.testnet-1.coreum.dev:26657",
  "accepts valid wss endpoint"
);

assertThrows(
  () => validateRpcEndpoint("http://example.com:26657"),
  "rejects insecure http RPC by default"
);
assertThrows(
  () => validateWsEndpoint("ws://example.com:26657"),
  "rejects insecure ws by default"
);
assertThrows(
  () => validateRpcEndpoint("ftp://example.com"),
  "rejects unsupported RPC scheme"
);

assert(
  validateRpcEndpoint("http://127.0.0.1:26657", {
    allowInsecure: true,
    blockPrivateHosts: false,
  }) === "http://127.0.0.1:26657",
  "allows insecure localhost when explicitly configured"
);

assertThrows(
  () => validateRpcEndpoint("http://127.0.0.1:26657", { allowInsecure: true }),
  "blocks private hosts in Node runtime by default"
);

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
