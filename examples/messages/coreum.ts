/**
 * Coreum message builder examples (FT, NFT, DEX)
 *
 * Usage:
 *   import { coreumMessageExamples } from "./messages/coreum";
 *   await client.sendTx([coreumMessageExamples["FT.Issue"]]);
 */

import { EncodeObject } from "@cosmjs/proto-signing";
import { FT, NFT, DEX } from "../../src/coreum";
import {
  ADDRESS,
  CLASS_ID,
  DENOM,
  NFT_ID,
  ORDER_ID,
  QUOTE_DENOM,
} from "../shared/constants";

export const coreumMessageExamples: Record<string, EncodeObject> = {
  "FT.Mint": FT.Mint({
    sender: ADDRESS,
    coin: { denom: DENOM, amount: "1000" },
  }),
  "FT.Issue": FT.Issue({
    issuer: ADDRESS,
    symbol: "MYTOKEN",
    subunit: "umytoken",
    precision: 6,
    initialAmount: "1000000",
    description: "Example fungible token",
    features: [],
    burnRate: "0",
    sendCommissionRate: "0",
  }),
  "FT.Burn": FT.Burn({
    sender: ADDRESS,
    coin: { denom: DENOM, amount: "100" },
  }),
  "FT.Freeze": FT.Freeze({
    sender: ADDRESS,
    account: ADDRESS,
    coin: { denom: DENOM, amount: "100" },
  }),
  "FT.GloballyFreeze": FT.GloballyFreeze({
    sender: ADDRESS,
    denom: "umytoken-issuer",
  }),
  "FT.GloballyUnfreeze": FT.GloballyUnfreeze({
    sender: ADDRESS,
    denom: "umytoken-issuer",
  }),
  "FT.Unfreeze": FT.Unfreeze({
    sender: ADDRESS,
    account: ADDRESS,
    coin: { denom: DENOM, amount: "100" },
  }),
  "FT.SetWhitelistedLimit": FT.SetWhitelistedLimit({
    sender: ADDRESS,
    account: ADDRESS,
    coin: { denom: "umytoken-issuer", amount: "1000000" },
  }),
  "FT.Clawback": FT.Clawback({
    sender: ADDRESS,
    account: ADDRESS,
    coin: { denom: "umytoken-issuer", amount: "100" },
  }),
  "FT.UpdateDEXUnifiedRefAmount": FT.UpdateDEXUnifiedRefAmount({
    sender: ADDRESS,
    denom: "umytoken-issuer",
    unifiedRefAmount: "1",
  }),
  "FT.UpdateDEXWhitelistedDenoms": FT.UpdateDEXWhitelistedDenoms({
    sender: ADDRESS,
    denom: "umytoken-issuer",
    whitelistedDenoms: [DENOM, QUOTE_DENOM],
  }),

  "NFT.Mint": NFT.Mint({
    sender: ADDRESS,
    recipient: ADDRESS,
    classId: CLASS_ID,
    id: NFT_ID,
    uri: "https://example.com/nft/1",
    uriHash: "",
    data: undefined,
  }),
  "NFT.IssueClass": NFT.IssueClass({
    issuer: ADDRESS,
    symbol: "MYNFT",
    name: "My NFT Collection",
    description: "Example NFT class",
    uri: "https://example.com/class",
    uriHash: "",
    data: undefined,
    features: [],
    royaltyRate: "0",
  }),
  "NFT.Send": NFT.Send({
    sender: ADDRESS,
    classId: CLASS_ID,
    id: NFT_ID,
    receiver: ADDRESS,
  }),
  "NFT.Burn": NFT.Burn({
    sender: ADDRESS,
    classId: CLASS_ID,
    id: NFT_ID,
  }),
  "NFT.Freeze": NFT.Freeze({
    sender: ADDRESS,
    classId: CLASS_ID,
    id: NFT_ID,
  }),
  "NFT.Unfreeze": NFT.Unfreeze({
    sender: ADDRESS,
    classId: CLASS_ID,
    id: NFT_ID,
  }),
  "NFT.AddToWhitelist": NFT.AddToWhitelist({
    sender: ADDRESS,
    classId: CLASS_ID,
    id: NFT_ID,
    account: ADDRESS,
  }),
  "NFT.RemoveFromWhitelist": NFT.RemoveFromWhitelist({
    sender: ADDRESS,
    classId: CLASS_ID,
    id: NFT_ID,
    account: ADDRESS,
  }),

  "DEX.PlaceOrder": DEX.PlaceOrder({
    sender: ADDRESS,
    type: 1,
    id: ORDER_ID,
    baseDenom: DENOM,
    quoteDenom: QUOTE_DENOM,
    price: "1",
    quantity: "100",
    side: 1,
    goodTil: { goodTilBlockHeight: 1_000_000, goodTilBlockTime: undefined },
    timeInForce: 1,
  }),
  "DEX.CancelOrder": DEX.CancelOrder({
    sender: ADDRESS,
    id: ORDER_ID,
  }),
  "DEX.UpdateParams": DEX.UpdateParams({
    authority: ADDRESS,
    params: undefined,
  }),
  "DEX.CancelOrdersByDenom": DEX.CancelOrdersByDenom({
    sender: ADDRESS,
    account: ADDRESS,
    denom: DENOM,
  }),
};
