import { toBech32 } from "@cosmjs/encoding";

const addressBytes = new Uint8Array(20).fill(2);

/** Example testnet account address */
export const ADDRESS = toBech32("testcore", addressBytes);

/** Example validator operator address */
export const VALIDATOR = toBech32("testcorevaloper", addressBytes);

/** Native testnet staking denom */
export const DENOM = "utestcore";

export const CLASS_ID = "my-nft-class";
export const NFT_ID = "my-nft-1";
export const CONTRACT = "testcore1contract000000000000000000000000000";
export const ORDER_ID = "order-1";
export const QUOTE_DENOM = "utest2";

export const coin = (amount = "1000", denom = DENOM) => ({ denom, amount });
export const coins = (amount = "1000", denom = DENOM) => [coin(amount, denom)];
