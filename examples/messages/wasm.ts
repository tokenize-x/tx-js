/**
 * CosmWasm and IBC message builder examples
 *
 * Usage:
 *   import { wasmMessageExamples } from "./messages/wasm";
 *   await client.sendTx([wasmMessageExamples["CosmWasm.ExecuteContract"]]);
 */

import { EncodeObject } from "@cosmjs/proto-signing";
import { CosmWasm, IBC } from "../../src/wasm/v1";
import { ADDRESS, CONTRACT } from "../shared/constants";

export const wasmMessageExamples: Record<string, EncodeObject> = {
  "IBC.IBCSend": IBC.IBCSend({
    sender: ADDRESS,
    contract: CONTRACT,
    channel: "channel-0",
    timeoutHeight: { revisionNumber: 0, revisionHeight: 0 },
    timeoutTimestamp: 0,
    data: new Uint8Array(),
  } as never),
  "IBC.IBCCloseChannel": IBC.IBCCloseChannel({
    sender: ADDRESS,
    channel: "channel-0",
  } as never),

  "CosmWasm.StoreCode": CosmWasm.StoreCode({
    sender: ADDRESS,
    wasmByteCode: new Uint8Array(),
    instantiatePermission: undefined,
  } as never),
  "CosmWasm.InstantiateContract": CosmWasm.InstantiateContract({
    sender: ADDRESS,
    admin: ADDRESS,
    codeId: 1,
    label: "my-contract",
    msg: new Uint8Array(),
    funds: [],
  } as never),
  "CosmWasm.InstantiateContract2": CosmWasm.InstantiateContract2({
    sender: ADDRESS,
    admin: ADDRESS,
    codeId: 1,
    label: "my-contract",
    msg: new Uint8Array(),
    funds: [],
    salt: new Uint8Array(),
    fixMsg: false,
  } as never),
  "CosmWasm.ExecuteContract": CosmWasm.ExecuteContract({
    sender: ADDRESS,
    contract: CONTRACT,
    msg: new Uint8Array([123, 125]),
    funds: [],
  } as never),
  "CosmWasm.MigrateContract": CosmWasm.MigrateContract({
    sender: ADDRESS,
    contract: CONTRACT,
    codeId: 2,
    msg: new Uint8Array(),
  } as never),
  "CosmWasm.UpdateAdmin": CosmWasm.UpdateAdmin({
    sender: ADDRESS,
    newAdmin: ADDRESS,
    contract: CONTRACT,
  } as never),
  "CosmWasm.ClearAdmin": CosmWasm.ClearAdmin({
    sender: ADDRESS,
    contract: CONTRACT,
  } as never),
  "CosmWasm.StoreAndInstantiateContract": CosmWasm.StoreAndInstantiateContract({
    authority: ADDRESS,
    wasmByteCode: new Uint8Array(),
    msg: new Uint8Array(),
    label: "my-contract",
    admin: ADDRESS,
    funds: [],
  } as never),
  "CosmWasm.PinCodes": CosmWasm.PinCodes({
    authority: ADDRESS,
    codeIds: [1],
  } as never),
  "CosmWasm.UnpinCodes": CosmWasm.UnpinCodes({
    authority: ADDRESS,
    codeIds: [1],
  } as never),
  "CosmWasm.SudoContract": CosmWasm.SudoContract({
    authority: ADDRESS,
    contract: CONTRACT,
    msg: new Uint8Array(),
  } as never),
  "CosmWasm.UpdateParams": CosmWasm.UpdateParams({
    authority: ADDRESS,
    params: undefined,
  } as never),
  "CosmWasm.UpdateInstantiateConfig": CosmWasm.UpdateInstantiateConfig({
    authority: ADDRESS,
    codeId: 1,
    instantiatePermission: undefined,
  } as never),
};
