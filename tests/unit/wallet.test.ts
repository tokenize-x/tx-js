/**
 * Unit tests for wallet utilities
 * Run: npx ts-node tests/unit/wallet.test.ts
 */

import {
  isValidCoreumAddress,
  assertValidCoreumAddress,
  validateMnemonic,
} from "../../src/utils/wallet";
import { CoreumPrefixes } from "../../src/types/coreum";

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

console.log("\nTesting wallet utilities\n");

const validMainnetAddress = "core1qyqszqgpqyqszqgpqyqszqgpqyqszqgppae928";
const validTestnetAddress = "testcore1qgpqyqszqgpqyqszqgpqyqszqgpqyqszxdyaw8";

assert(
  isValidCoreumAddress(validMainnetAddress),
  "accepts valid mainnet address format"
);
assert(
  isValidCoreumAddress(validTestnetAddress, CoreumPrefixes.TESTNET),
  "accepts testnet prefix when expected"
);
assert(
  !isValidCoreumAddress(validMainnetAddress, CoreumPrefixes.TESTNET),
  "rejects prefix mismatch"
);
assert(!isValidCoreumAddress("cosmos1abc"), "rejects non-coreum prefix");
assert(!isValidCoreumAddress("not-an-address"), "rejects invalid bech32");

assertThrows(
  () => assertValidCoreumAddress("cosmos1abc"),
  "assertValidCoreumAddress throws on invalid address"
);

assertThrows(
  () => validateMnemonic("one two three"),
  "validateMnemonic rejects short mnemonics"
);

validateMnemonic(Array(12).fill("abandon").join(" "));
assert(true, "validateMnemonic accepts 12-word format");

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
