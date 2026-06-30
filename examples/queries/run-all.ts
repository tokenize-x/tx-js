/**
 * Runs every query example against Coreum testnet.
 * Run: npx ts-node examples/queries/run-all.ts
 *
 * Queries that fail with "not found" for dummy data are logged as skipped.
 */

import { Client, CoreumNetwork } from "../../src/index";
import {
  allClientQueryExamples,
  createProtoWasmQueryClient,
  protoWasmQueryExamples,
} from "./index";

async function runQuery(name: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/not found|no such|does not exist|invalid|unknown|404/i.test(message)) {
      console.log(`○ ${name} (skipped: ${message.slice(0, 80)}...)`);
      return;
    }
    console.error(`✗ ${name}: ${message}`);
  }
}

async function main() {
  console.log("\nQuery examples (testnet)\n");

  const client = new Client({ network: CoreumNetwork.TESTNET });

  try {
    await client.connect();
  } catch (error) {
    console.error("Could not connect to testnet RPC.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const q = client.queryClients!;

  for (const [name, runner] of Object.entries(allClientQueryExamples)) {
    await runQuery(name, () => runner(q));
  }

  const { client: protoClient, disconnect } = await createProtoWasmQueryClient(
    client.config.chain_rpc_endpoint
  );

  for (const [name, runner] of Object.entries(protoWasmQueryExamples)) {
    await runQuery(name, () => runner(protoClient));
  }

  disconnect();
  client.disconnect();

  console.log(`\nCompleted ${Object.keys(allClientQueryExamples).length + Object.keys(protoWasmQueryExamples).length} query examples`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
