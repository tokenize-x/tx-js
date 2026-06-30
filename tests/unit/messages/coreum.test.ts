/**
 * Unit tests for Coreum message builders (FT, NFT, DEX)
 * Run: npx ts-node tests/unit/messages/coreum.test.ts
 */

import { FT, NFT, DEX } from "../../../src/coreum";
import { assertMessage } from "../../helpers/messageAssertions";
import { printSummary, exitWithStatus, test } from "../../helpers/testRunner";
import { TEST_ADDRESS, TEST_CLASS_ID, TEST_DENOM, TEST_NFT_ID } from "../../helpers/fixtures";

async function run() {
  console.log("\nCoreum message builder tests\n");

  await test("FT messages", () => {
    assertMessage("FT.Mint", FT.Mint({ sender: TEST_ADDRESS, coin: { denom: TEST_DENOM, amount: "1" } }), "/coreum.asset.ft.v1.MsgMint");
    assertMessage("FT.Issue", FT.Issue({ issuer: TEST_ADDRESS, symbol: "TEST", subunit: "utest", precision: 6, initialAmount: "0", description: "test", features: [], burnRate: "0", sendCommissionRate: "0" }), "/coreum.asset.ft.v1.MsgIssue");
    assertMessage("FT.Burn", FT.Burn({ sender: TEST_ADDRESS, coin: { denom: TEST_DENOM, amount: "1" } }), "/coreum.asset.ft.v1.MsgBurn");
    assertMessage("FT.Freeze", FT.Freeze({ sender: TEST_ADDRESS, account: TEST_ADDRESS, coin: { denom: TEST_DENOM, amount: "1" } }), "/coreum.asset.ft.v1.MsgFreeze");
    assertMessage("FT.GloballyFreeze", FT.GloballyFreeze({ sender: TEST_ADDRESS, denom: TEST_DENOM }), "/coreum.asset.ft.v1.MsgGloballyFreeze");
    assertMessage("FT.GloballyUnfreeze", FT.GloballyUnfreeze({ sender: TEST_ADDRESS, denom: TEST_DENOM }), "/coreum.asset.ft.v1.MsgGloballyUnfreeze");
    assertMessage("FT.Unfreeze", FT.Unfreeze({ sender: TEST_ADDRESS, account: TEST_ADDRESS, coin: { denom: TEST_DENOM, amount: "1" } }), "/coreum.asset.ft.v1.MsgUnfreeze");
    assertMessage("FT.SetWhitelistedLimit", FT.SetWhitelistedLimit({ sender: TEST_ADDRESS, account: TEST_ADDRESS, coin: { denom: TEST_DENOM, amount: "1000" } }), "/coreum.asset.ft.v1.MsgSetWhitelistedLimit");
    assertMessage("FT.Clawback", FT.Clawback({ sender: TEST_ADDRESS, account: TEST_ADDRESS, coin: { denom: TEST_DENOM, amount: "1" } }), "/coreum.asset.ft.v1.MsgClawback");
    assertMessage("FT.UpdateDEXUnifiedRefAmount", FT.UpdateDEXUnifiedRefAmount({ sender: TEST_ADDRESS, denom: TEST_DENOM, unifiedRefAmount: "1" }), "/coreum.asset.ft.v1.MsgUpdateDEXUnifiedRefAmount");
    assertMessage("FT.UpdateDEXWhitelistedDenoms", FT.UpdateDEXWhitelistedDenoms({ sender: TEST_ADDRESS, denom: TEST_DENOM, whitelistedDenoms: [TEST_DENOM] }), "/coreum.asset.ft.v1.MsgUpdateDEXWhitelistedDenoms");
  });

  await test("NFT messages", () => {
    assertMessage("NFT.Mint", NFT.Mint({ sender: TEST_ADDRESS, recipient: TEST_ADDRESS, classId: TEST_CLASS_ID, id: TEST_NFT_ID, uri: "", uriHash: "", data: undefined }), "/coreum.asset.nft.v1.MsgMint");
    assertMessage("NFT.AddToWhitelist", NFT.AddToWhitelist({ sender: TEST_ADDRESS, classId: TEST_CLASS_ID, id: TEST_NFT_ID, account: TEST_ADDRESS }), "/coreum.asset.nft.v1.MsgAddToWhitelist");
    assertMessage("NFT.RemoveFromWhitelist", NFT.RemoveFromWhitelist({ sender: TEST_ADDRESS, classId: TEST_CLASS_ID, id: TEST_NFT_ID, account: TEST_ADDRESS }), "/coreum.asset.nft.v1.MsgRemoveFromWhitelist");
    assertMessage("NFT.Burn", NFT.Burn({ sender: TEST_ADDRESS, classId: TEST_CLASS_ID, id: TEST_NFT_ID }), "/coreum.asset.nft.v1.MsgBurn");
    assertMessage("NFT.Freeze", NFT.Freeze({ sender: TEST_ADDRESS, classId: TEST_CLASS_ID, id: TEST_NFT_ID }), "/coreum.asset.nft.v1.MsgFreeze");
    assertMessage("NFT.Unfreeze", NFT.Unfreeze({ sender: TEST_ADDRESS, classId: TEST_CLASS_ID, id: TEST_NFT_ID }), "/coreum.asset.nft.v1.MsgUnfreeze");
    assertMessage("NFT.IssueClass", NFT.IssueClass({ issuer: TEST_ADDRESS, symbol: "NFT", name: "Test Class", description: "test", uri: "", uriHash: "", data: undefined, features: [], royaltyRate: "0" }), "/coreum.asset.nft.v1.MsgIssueClass");
    assertMessage("NFT.Send", NFT.Send({ sender: TEST_ADDRESS, classId: TEST_CLASS_ID, id: TEST_NFT_ID, receiver: TEST_ADDRESS }), "/cosmos.nft.v1beta1.MsgSend");
  });

  await test("DEX messages", () => {
    assertMessage("DEX.PlaceOrder", DEX.PlaceOrder({ sender: TEST_ADDRESS, type: 1, id: "order-1", baseDenom: TEST_DENOM, quoteDenom: "utest2", price: "1", quantity: "1", side: 1, goodTil: { goodTilBlockHeight: 100, goodTilBlockTime: undefined }, timeInForce: 1 }), "/coreum.dex.v1.MsgPlaceOrder");
    assertMessage("DEX.CancelOrder", DEX.CancelOrder({ sender: TEST_ADDRESS, id: "order-1" }), "/coreum.dex.v1.MsgCancelOrder");
    assertMessage("DEX.UpdateParams", DEX.UpdateParams({ authority: TEST_ADDRESS, params: undefined }), "/coreum.dex.v1.MsgUpdateParams");
    assertMessage("DEX.CancelOrdersByDenom", DEX.CancelOrdersByDenom({ sender: TEST_ADDRESS, account: TEST_ADDRESS, denom: TEST_DENOM }), "/coreum.dex.v1.MsgCancelOrdersByDenom");
  });

  printSummary("Coreum Message Tests");
  exitWithStatus();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
