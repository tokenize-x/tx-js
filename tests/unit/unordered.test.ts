/**
 * Unit tests for unordered transaction encoding and timeout issuance
 * Run: npx ts-node tests/unit/unordered.test.ts
 */

import { BinaryReader } from "cosmjs-types/binary";
import { Timestamp } from "cosmjs-types/google/protobuf/timestamp";
import { TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {
  DEFAULT_UNORDERED_TIMEOUT_MS,
  MAX_UNORDERED_TIMEOUT_MS,
  UnorderedTimeoutClock,
  assertUnorderedTimeout,
  encodeUnorderedTxBody,
} from "../../src/utils/unordered";

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

function assertThrows(fn: () => unknown, message: string) {
  try {
    fn();
    assert(false, message);
  } catch {
    assert(true, message);
  }
}

/** Field numbers in encoding order, plus the decoded `unordered` and `timeout_timestamp`. */
function readFields(bytes: Uint8Array) {
  const reader = new BinaryReader(bytes);
  const order: number[] = [];
  let unordered: boolean | undefined;
  let timeout: Timestamp | undefined;
  while (reader.pos < reader.len) {
    const tag = reader.uint32();
    const field = tag >>> 3;
    order.push(field);
    if (field === 4) {
      unordered = reader.bool();
    } else if (field === 5) {
      timeout = Timestamp.decode(reader, reader.uint32());
    } else {
      reader.skipType(tag & 7);
    }
  }
  return { order, unordered, timeout };
}

const sendMsg = {
  typeUrl: "/cosmos.bank.v1beta1.MsgSend",
  value: new Uint8Array([10, 3, 97, 98, 99]),
};

console.log("Testing: encodeUnorderedTxBody");

{
  const timeoutTimestampNanos = BigInt("1760000000123456789");
  const bytes = encodeUnorderedTxBody({
    messages: [sendMsg],
    memo: "burst",
    timeoutTimestampNanos,
  });
  const { order, unordered, timeout } = readFields(bytes);

  assert(unordered === true, "sets unordered = true (field 4)");
  assert(
    timeout?.seconds === BigInt(1760000000) && timeout?.nanos === 123456789,
    "sets timeout_timestamp (field 5) to the exact seconds and nanos"
  );
  assert(
    order.every((field, i) => i === 0 || order[i - 1] <= field),
    "writes fields in ascending field order"
  );

  const decoded = TxBody.decode(bytes);
  assert(
    decoded.messages.length === 1 &&
      decoded.messages[0].typeUrl === sendMsg.typeUrl,
    "keeps the messages readable by the existing TxBody codec"
  );
  assert(decoded.memo === "burst", "keeps the memo");
}

assertThrows(
  () =>
    encodeUnorderedTxBody({
      messages: [sendMsg],
      memo: "",
      timeoutTimestampNanos: BigInt(0),
    }),
  "rejects a zero timeout timestamp"
);

console.log("\nTesting: UnorderedTimeoutClock");

{
  const now = 1_760_000_000_000;
  const clock = new UnorderedTimeoutClock(0);
  const first = clock.next(now);
  assert(
    first === BigInt(now + DEFAULT_UNORDERED_TIMEOUT_MS) * BigInt(1_000_000),
    "defaults to now + 5 minutes, in nanoseconds"
  );

  const second = clock.next(now);
  const third = clock.next(now);
  assert(
    second === first + BigInt(1) && third === second + BigInt(1),
    "never repeats a timeout within the same millisecond"
  );

  const later = clock.next(now + 1000);
  assert(
    later === BigInt(now + 1000 + DEFAULT_UNORDERED_TIMEOUT_MS) * BigInt(1_000_000),
    "follows the wall clock again once time moves past the last timeout"
  );

  const shorter = clock.next(now + 2000, 30_000);
  assert(shorter > later, "stays strictly increasing when a shorter TTL is requested");

  const custom = new UnorderedTimeoutClock(0).next(now, 60_000);
  assert(
    custom === BigInt(now + 60_000) * BigInt(1_000_000),
    "uses an explicit TTL"
  );

  const offset = new UnorderedTimeoutClock(4321).next(now);
  assert(
    offset === first + BigInt(4321),
    "adds the clock's sub-millisecond offset"
  );

  const a = new UnorderedTimeoutClock(1).next(now);
  const b = new UnorderedTimeoutClock(2).next(now);
  assert(a !== b, "two clocks with different offsets differ in the same millisecond");

  const random = new UnorderedTimeoutClock().next(now);
  const base = BigInt(now + DEFAULT_UNORDERED_TIMEOUT_MS) * BigInt(1_000_000);
  assert(
    random >= base && random < base + BigInt(1_000_000),
    "a default clock stays within the same millisecond as its TTL"
  );

  assertThrows(() => new UnorderedTimeoutClock(1_000_000), "rejects an offset of a full millisecond");
  assertThrows(() => new UnorderedTimeoutClock(-1), "rejects a negative offset");
}

console.log("\nTesting: assertUnorderedTimeout");

assertThrows(() => assertUnorderedTimeout(0), "rejects a zero TTL");
assertThrows(() => assertUnorderedTimeout(-1), "rejects a negative TTL");
assertThrows(() => assertUnorderedTimeout(1.5), "rejects a fractional TTL");
assertThrows(
  () => assertUnorderedTimeout(MAX_UNORDERED_TIMEOUT_MS + 1),
  "rejects a TTL above the 10-minute chain maximum"
);
assert(
  (() => {
    assertUnorderedTimeout(MAX_UNORDERED_TIMEOUT_MS);
    return true;
  })(),
  "accepts exactly the 10-minute chain maximum"
);

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
