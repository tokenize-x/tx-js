/**
 * All SDK query examples
 */

import { coreumQueryExamples } from "./coreum";
import { cosmosQueryExamples } from "./cosmos";
import { cosmjsQueryExamples } from "./cosmjs";
import { protoWasmQueryExamples } from "./wasm-proto";
import { Client } from "../../src/client/index";

export { coreumQueryExamples } from "./coreum";
export { cosmosQueryExamples } from "./cosmos";
export { cosmjsQueryExamples } from "./cosmjs";
export { protoWasmQueryExamples, createProtoWasmQueryClient } from "./wasm-proto";

type QueryRunner = (q: NonNullable<Client["queryClients"]>) => Promise<unknown>;

export const allClientQueryExamples: Record<string, QueryRunner> = {
  ...coreumQueryExamples,
  ...cosmosQueryExamples,
  ...cosmjsQueryExamples,
};

export const allQueryExamples: Record<string, QueryRunner> = {
  ...allClientQueryExamples,
  ...protoWasmQueryExamples,
};
