/**
 * Unit tests for CosmWasm and IBC message builders
 * Run: npx ts-node tests/unit/messages/wasm.test.ts
 */

import { CosmWasm, IBC } from "../../../src/wasm/v1";
import { assertMessage } from "../../helpers/messageAssertions";
import { printSummary, exitWithStatus, test } from "../../helpers/testRunner";
import { TEST_ADDRESS, TEST_CONTRACT } from "../../helpers/fixtures";

async function run() {
  console.log("\nWasm message builder tests\n");

  await test("IBC messages", () => {
    assertMessage(
      "IBC.IBCSend",
      IBC.IBCSend({
        sender: TEST_ADDRESS,
        contract: TEST_CONTRACT,
        channel: "channel-0",
        timeoutHeight: { revisionNumber: 0, revisionHeight: 0 },
        timeoutTimestamp: 0,
        data: new Uint8Array(),
      } as never),
      "/cosmwasm.wasm.v1.MsgIBCSend"
    );
    assertMessage(
      "IBC.IBCCloseChannel",
      IBC.IBCCloseChannel({ sender: TEST_ADDRESS, channel: "channel-0" } as never),
      "/cosmwasm.wasm.v1.MsgIBCCloseChannel"
    );
  });

  await test("CosmWasm messages", () => {
    assertMessage(
      "CosmWasm.StoreAndInstantiateContract",
      CosmWasm.StoreAndInstantiateContract({
        authority: TEST_ADDRESS,
        wasmByteCode: new Uint8Array(),
        msg: new Uint8Array(),
        label: "test",
        admin: TEST_ADDRESS,
        funds: [],
      } as never),
      "/cosmwasm.wasm.v1.MsgStoreAndInstantiateContract"
    );
    assertMessage(
      "CosmWasm.UnpinCodes",
      CosmWasm.UnpinCodes({ authority: TEST_ADDRESS, codeIds: [1] } as never),
      "/cosmwasm.wasm.v1.MsgUnpinCodes"
    );
    assertMessage(
      "CosmWasm.PinCodes",
      CosmWasm.PinCodes({ authority: TEST_ADDRESS, codeIds: [1] } as never),
      "/cosmwasm.wasm.v1.MsgPinCodes"
    );
    assertMessage(
      "CosmWasm.SudoContract",
      CosmWasm.SudoContract({
        authority: TEST_ADDRESS,
        contract: TEST_CONTRACT,
        msg: new Uint8Array(),
      } as never),
      "/cosmwasm.wasm.v1.MsgSudoContract"
    );
    assertMessage(
      "CosmWasm.UpdateParams",
      CosmWasm.UpdateParams({ authority: TEST_ADDRESS, params: undefined } as never),
      "/cosmwasm.wasm.v1.MsgUpdateParams"
    );
    assertMessage(
      "CosmWasm.UpdateInstantiateConfig",
      CosmWasm.UpdateInstantiateConfig({
        authority: TEST_ADDRESS,
        codeId: 1,
        instantiatePermission: undefined,
      } as never),
      "/cosmwasm.wasm.v1.MsgUpdateInstantiateConfig"
    );
    assertMessage(
      "CosmWasm.StoreCode",
      CosmWasm.StoreCode({
        sender: TEST_ADDRESS,
        wasmByteCode: new Uint8Array(),
        instantiatePermission: undefined,
      } as never),
      "/cosmwasm.wasm.v1.MsgStoreCode"
    );
    assertMessage(
      "CosmWasm.InstantiateContract",
      CosmWasm.InstantiateContract({
        sender: TEST_ADDRESS,
        admin: TEST_ADDRESS,
        codeId: 1,
        label: "test",
        msg: new Uint8Array(),
        funds: [],
      } as never),
      "/cosmwasm.wasm.v1.MsgInstantiateContract"
    );
    assertMessage(
      "CosmWasm.InstantiateContract2",
      CosmWasm.InstantiateContract2({
        sender: TEST_ADDRESS,
        admin: TEST_ADDRESS,
        codeId: 1,
        label: "test",
        msg: new Uint8Array(),
        funds: [],
        salt: new Uint8Array(),
        fixMsg: false,
      } as never),
      "/cosmwasm.wasm.v1.MsgInstantiateContract2"
    );
    assertMessage(
      "CosmWasm.ClearAdmin",
      CosmWasm.ClearAdmin({ sender: TEST_ADDRESS, contract: TEST_CONTRACT } as never),
      "/cosmwasm.wasm.v1.MsgClearAdmin"
    );
    assertMessage(
      "CosmWasm.UpdateAdmin",
      CosmWasm.UpdateAdmin({
        sender: TEST_ADDRESS,
        newAdmin: TEST_ADDRESS,
        contract: TEST_CONTRACT,
      } as never),
      "/cosmwasm.wasm.v1.MsgUpdateAdmin"
    );
    assertMessage(
      "CosmWasm.ExecuteContract",
      CosmWasm.ExecuteContract({
        sender: TEST_ADDRESS,
        contract: TEST_CONTRACT,
        msg: new Uint8Array(),
        funds: [],
      } as never),
      "/cosmwasm.wasm.v1.MsgExecuteContract"
    );
    assertMessage(
      "CosmWasm.MigrateContract",
      CosmWasm.MigrateContract({
        sender: TEST_ADDRESS,
        contract: TEST_CONTRACT,
        codeId: 1,
        msg: new Uint8Array(),
      } as never),
      "/cosmwasm.wasm.v1.MsgMigrateContract"
    );
  });

  printSummary("Wasm Message Tests");
  exitWithStatus();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
