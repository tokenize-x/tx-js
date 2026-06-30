/**
 * All SDK message builder examples
 *
 * Run: npx ts-node examples/messages/list-all.ts
 */

import { EncodeObject } from "@cosmjs/proto-signing";
import { coreumMessageExamples } from "./coreum";
import { cosmosMessageExamples } from "./cosmos";
import { wasmMessageExamples } from "./wasm";

export { coreumMessageExamples } from "./coreum";
export { cosmosMessageExamples } from "./cosmos";
export { wasmMessageExamples } from "./wasm";

export const allMessageExamples: Record<string, EncodeObject> = {
  ...coreumMessageExamples,
  ...cosmosMessageExamples,
  ...wasmMessageExamples,
};
