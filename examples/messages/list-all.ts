/**
 * Lists every message example and its typeUrl.
 * Run: npx ts-node examples/messages/list-all.ts
 */

import { Client } from "../../src/client/index";
import { allMessageExamples } from "./index";

console.log("Message examples\n");

for (const [name, message] of Object.entries(allMessageExamples)) {
  try {
    const encoded = Client.getRegistry().encode(message);
    console.log(`✓ ${name}`);
    console.log(`  typeUrl: ${message.typeUrl}`);
    console.log(`  encoded bytes: ${encoded.length}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`○ ${name}`);
    console.log(`  typeUrl: ${message.typeUrl}`);
    console.log(`  note: ${msg.includes("Unregistered") ? "not in default registry" : msg}`);
  }
}

console.log(`\nTotal: ${Object.keys(allMessageExamples).length} messages`);
