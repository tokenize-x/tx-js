/**
 * Proto wasm query examples (src/wasm/v1/extensions/wasm.ts)
 *
 * These use the low-level protobuf query client, separate from CosmJS wasm helpers.
 */

import { QueryClient } from "@cosmjs/stargate";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
import { setupWasmExtension as setupProtoWasmExtension } from "../../src/wasm/v1/extensions/wasm";
import { ADDRESS, CONTRACT } from "../shared/constants";

export async function createProtoWasmQueryClient(rpcEndpoint: string) {
  const tm = await Tendermint37Client.connect(rpcEndpoint);
  const client = QueryClient.withExtensions(tm, setupProtoWasmExtension);
  return { client, disconnect: () => tm.disconnect() };
}

export const protoWasmQueryExamples = {
  "proto.wasm.params": (q: QueryClient) => q.wasm.params({}),
  "proto.wasm.codes": (q: QueryClient) => q.wasm.codes({ pagination: undefined }),
  "proto.wasm.code": (q: QueryClient) => q.wasm.code({ codeId: 1 }),
  "proto.wasm.pinnedCodes": (q: QueryClient) =>
    q.wasm.pinnedCodes({ pagination: undefined }),
  "proto.wasm.contractsByCode": (q: QueryClient) =>
    q.wasm.contractsByCode({ codeId: 1, pagination: undefined }),
  "proto.wasm.contractsByCreator": (q: QueryClient) =>
    q.wasm.contractsByCreator({ creatorAddress: ADDRESS, pagination: undefined }),
  "proto.wasm.contractInfo": (q: QueryClient) =>
    q.wasm.contractInfo({ address: CONTRACT }),
  "proto.wasm.contractHistory": (q: QueryClient) =>
    q.wasm.contractHistory({ address: CONTRACT, pagination: undefined }),
  "proto.wasm.allContractState": (q: QueryClient) =>
    q.wasm.allContractState({ address: CONTRACT, pagination: undefined }),
  "proto.wasm.rawContractState": (q: QueryClient) =>
    q.wasm.rawContractState({ address: CONTRACT, queryData: new Uint8Array() }),
  "proto.wasm.smartContractState": (q: QueryClient) =>
    q.wasm.smartContractState({
      address: CONTRACT,
      queryData: new Uint8Array([123, 125]),
    }),
};
