/**
 * Unit tests for amount conversion utilities
 * Run: npx ts-node tests/unit/calculations.test.ts
 */

import {
  ucoreToCORE,
  coreToUCORE,
  subunitToUnit,
  unitToSubunit,
  parseFloatToRoyaltyRate,
} from "../../src/utils/calculations";

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

console.log("\nTesting calculation utilities\n");

assert(ucoreToCORE("1000000") === "1", "converts ucore to CORE");
assert(coreToUCORE("1") === "1000000", "converts CORE to ucore");
assert(subunitToUnit("1000000", 6) === "1", "converts subunit to unit");
assert(unitToSubunit("1", 6) === "1000000", "converts unit to subunit");
assert(
  parseFloatToRoyaltyRate("10") === "100000000000000000",
  "converts royalty percentage"
);

assertThrows(() => ucoreToCORE("-1"), "rejects negative ucore");
assertThrows(() => coreToUCORE("abc"), "rejects invalid core amount");
assertThrows(() => subunitToUnit("1", 99), "rejects invalid precision");
assertThrows(() => parseFloatToRoyaltyRate("-1"), "rejects negative royalty");

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
