import { toBech32 } from "@cosmjs/encoding";

const addressBytes = new Uint8Array(20).fill(2);

export const TEST_ADDRESS = toBech32("testcore", addressBytes);
export const TEST_VALIDATOR = toBech32("testcorevaloper", addressBytes);
export const TEST_DENOM = "utestcore";
export const TEST_CLASS_ID = "test-class-id";
export const TEST_NFT_ID = "test-nft-id";
export const TEST_CONTRACT = "testcore1contract000000000000000000000000000";
export const TEST_CODE_ID = 1;

export const coin = (amount = "1000", denom = TEST_DENOM) => ({
  denom,
  amount,
});

export const coins = (amount = "1000", denom = TEST_DENOM) => [coin(amount, denom)];
