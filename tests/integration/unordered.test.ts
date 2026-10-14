/**
 * Integration tests for unordered transactions against TX testnet
 * Run: TX_JS_TEST_MNEMONIC="..." npx ts-node tests/integration/unordered.test.ts
 *
 * Needs a testnet account funded with a few TESTCORE for fees. Every transaction is a
 * 1 utestcore bank send to the same account, so the balance only pays gas.
 * Skipped when TX_JS_TEST_MNEMONIC is not set.
 */

import { EncodeObject } from "@cosmjs/proto-signing";
import { Client } from "../../src/client/index";
import { CoreumNetwork } from "../../src/types/coreum";
import { TxRaw } from "../../src/cosmos";
import {
  assert,
  exitWithStatus,
  printSummary,
  test,
} from "../helpers/testRunner";

const PARALLEL_TXS = 10;

function selfSend(address: string, denom: string): EncodeObject {
  return {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: {
      fromAddress: address,
      toAddress: address,
      amount: [{ denom, amount: "1" }],
    },
  };
}

async function rejects(fn: () => Promise<unknown>): Promise<string | null> {
  try {
    await fn();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

async function run() {
  console.log("\nUnordered transaction integration tests (testnet)\n");

  const mnemonic = process.env.TX_JS_TEST_MNEMONIC;
  if (!mnemonic) {
    console.log("TX_JS_TEST_MNEMONIC is not set. Skipping unordered tx tests.");
    process.exit(0);
  }

  const client = new Client({ network: CoreumNetwork.TESTNET });
  await client.connectWithMnemonic(mnemonic);
  const address = client.address!;
  const msg = selfSend(address, client.config.staking_denom);

  await test(`${PARALLEL_TXS} parallel unordered sends from one account all succeed`, async () => {
    const results = await Promise.all(
      Array.from({ length: PARALLEL_TXS }, () =>
        client.sendTx([msg], "unordered", { unordered: true })
      )
    );
    const failed = results.filter((result) => result.code !== 0);
    assert(failed.length === 0, `all ${PARALLEL_TXS} delivered with code 0`);
    assert(
      new Set(results.map((result) => result.transactionHash)).size === PARALLEL_TXS,
      "every send is a distinct transaction"
    );
  });

  await test("two clients sharing one key send in parallel without colliding", async () => {
    const second = new Client({ network: CoreumNetwork.TESTNET });
    await second.connectWithMnemonic(mnemonic);
    try {
      const results = await Promise.all(
        Array.from({ length: PARALLEL_TXS }, (_, i) =>
          (i % 2 === 0 ? client : second).sendTx([msg], "shared key", {
            unordered: true,
          })
        )
      );
      assert(
        results.every((result) => result.code === 0),
        `all ${PARALLEL_TXS} sends across two clients delivered with code 0`
      );
    } finally {
      second.disconnect();
    }
  });

  await test("a custom timeoutMs is accepted", async () => {
    const result = await client.sendTx([msg], "short ttl", {
      unordered: true,
      timeoutMs: 60 * 1000,
    });
    assert(result.code === 0, "unordered tx with a 1-minute TTL is delivered");
  });

  await test("an out-of-range timeoutMs is refused before signing", async () => {
    const error = await rejects(() =>
      client.sendTx([msg], "", { unordered: true, timeoutMs: 11 * 60 * 1000 })
    );
    assert(
      error !== null && /exceeds the chain maximum/.test(error),
      `11-minute timeoutMs is refused locally (${error})`
    );
  });

  await test("a second unordered tx with the same timeout is rejected", async () => {
    const timeoutTimestamp = new Date(Date.now() + 2 * 60 * 1000);
    const first = await client.sendTx([msg], "first", { unordered: true, timeoutTimestamp });
    assert(first.code === 0, "first tx with that timeout succeeds");

    // A different memo makes a different transaction, so the rejection is the chain's
    // (signer, timeout) replay check and not the node's duplicate-tx cache.
    const replay = await rejects(() =>
      client.sendTx([msg], "second", { unordered: true, timeoutTimestamp })
    );
    assert(
      replay !== null && !/already exists in cache/.test(replay),
      `a different tx with the same signer + timeout is rejected (${replay})`
    );
  });

  await test("a timeout beyond the 10-minute maximum is rejected", async () => {
    const error = await rejects(() =>
      client.sendTx([msg], "", {
        unordered: true,
        timeoutTimestamp: new Date(Date.now() + 11 * 60 * 1000),
      })
    );
    assert(error !== null, `11-minute timeout is rejected (${error})`);
  });

  await test("a timeout in the past is rejected", async () => {
    const error = await rejects(() =>
      client.sendTx([msg], "", {
        unordered: true,
        timeoutTimestamp: new Date(Date.now() - 60 * 1000),
      })
    );
    assert(error !== null, `past timeout is rejected (${error})`);
  });

  await test("signUnorderedTx returns a broadcastable tx", async () => {
    const signed = await client.signUnorderedTx([msg], "signed");
    const result = await client.broadcastTx(TxRaw.encode(signed).finish());
    assert(result.code === 0, "signed unordered tx is delivered");
  });

  await test("an ordered sendTx still works after unordered ones", async () => {
    const result = await client.sendTx([msg], "ordered");
    assert(result.code === 0, "ordered tx is delivered");
  });

  client.disconnect();
  printSummary("Unordered Transaction Test Summary");
  exitWithStatus();
}

run();
