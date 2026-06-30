/**
 * Coreum query examples (ft, nft, nftbeta, dex)
 */

import { Client } from "../../src/client/index";
import { Side } from "../../src/coreum/dex/v1/order";
import {
  ADDRESS,
  CLASS_ID,
  CONTRACT,
  DENOM,
  NFT_ID,
  QUOTE_DENOM,
} from "../shared/constants";

type QueryClient = NonNullable<Client["queryClients"]>;

export async function runCoreumQueryExamples(q: QueryClient) {
  // FT
  await q.ft.params();
  await q.ft.tokens(ADDRESS);
  await q.ft.token(DENOM);
  await q.ft.frozenBalances(ADDRESS);
  await q.ft.frozenBalance(ADDRESS, DENOM);
  await q.ft.whitelistedBalances(ADDRESS);
  await q.ft.whitelistedBalance(ADDRESS, DENOM);

  // NFT (assetnft)
  await q.nft.params();
  await q.nft.class(CLASS_ID);
  await q.nft.frozen(NFT_ID, CLASS_ID);
  await q.nft.whitelisted(NFT_ID, CLASS_ID, ADDRESS);
  await q.nft.whitelistedAccountsForNFT(NFT_ID, CLASS_ID);

  // NFT beta
  await q.nftbeta.classes();
  await q.nftbeta.class(CLASS_ID);
  await q.nftbeta.balance(CLASS_ID, ADDRESS);
  await q.nftbeta.owner(CLASS_ID, NFT_ID);
  await q.nftbeta.supply(CLASS_ID);
  await q.nftbeta.nfts(CLASS_ID, ADDRESS);
  await q.nftbeta.nft(NFT_ID, CLASS_ID);

  // DEX
  await q.dex.params({});
  await q.dex.orders({ creator: ADDRESS, pagination: undefined });
  await q.dex.order({ creator: ADDRESS, id: "1" });
  await q.dex.ordersCountByDenomAndAccount({ account: ADDRESS, denom: DENOM });
  await q.dex.orderbook({
    baseDenom: DENOM,
    quoteDenom: QUOTE_DENOM,
    side: Side.SIDE_UNSPECIFIED,
    pagination: undefined,
  });
  await q.dex.orderbooks({ pagination: undefined });
  await q.dex.orderbookParams({ baseDenom: DENOM, quoteDenom: QUOTE_DENOM });
}

export const coreumQueryExamples = {
  "ft.params": (q: QueryClient) => q.ft.params(),
  "ft.tokens": (q: QueryClient) => q.ft.tokens(ADDRESS),
  "ft.token": (q: QueryClient) => q.ft.token(DENOM),
  "ft.frozenBalances": (q: QueryClient) => q.ft.frozenBalances(ADDRESS),
  "ft.frozenBalance": (q: QueryClient) => q.ft.frozenBalance(ADDRESS, DENOM),
  "ft.whitelistedBalances": (q: QueryClient) => q.ft.whitelistedBalances(ADDRESS),
  "ft.whitelistedBalance": (q: QueryClient) => q.ft.whitelistedBalance(ADDRESS, DENOM),
  "nft.params": (q: QueryClient) => q.nft.params(),
  "nft.class": (q: QueryClient) => q.nft.class(CLASS_ID),
  "nft.frozen": (q: QueryClient) => q.nft.frozen(NFT_ID, CLASS_ID),
  "nft.whitelisted": (q: QueryClient) => q.nft.whitelisted(NFT_ID, CLASS_ID, ADDRESS),
  "nft.whitelistedAccountsForNFT": (q: QueryClient) =>
    q.nft.whitelistedAccountsForNFT(NFT_ID, CLASS_ID),
  "nftbeta.classes": (q: QueryClient) => q.nftbeta.classes(),
  "nftbeta.class": (q: QueryClient) => q.nftbeta.class(CLASS_ID),
  "nftbeta.balance": (q: QueryClient) => q.nftbeta.balance(CLASS_ID, ADDRESS),
  "nftbeta.owner": (q: QueryClient) => q.nftbeta.owner(CLASS_ID, NFT_ID),
  "nftbeta.supply": (q: QueryClient) => q.nftbeta.supply(CLASS_ID),
  "nftbeta.nfts": (q: QueryClient) => q.nftbeta.nfts(CLASS_ID, ADDRESS),
  "nftbeta.nft": (q: QueryClient) => q.nftbeta.nft(NFT_ID, CLASS_ID),
  "dex.params": (q: QueryClient) => q.dex.params({}),
  "dex.orders": (q: QueryClient) => q.dex.orders({ creator: ADDRESS, pagination: undefined }),
  "dex.order": (q: QueryClient) => q.dex.order({ creator: ADDRESS, id: "1" }),
  "dex.ordersCountByDenomAndAccount": (q: QueryClient) =>
    q.dex.ordersCountByDenomAndAccount({ account: ADDRESS, denom: DENOM }),
  "dex.orderbook": (q: QueryClient) =>
    q.dex.orderbook({
      baseDenom: DENOM,
      quoteDenom: QUOTE_DENOM,
      side: Side.SIDE_UNSPECIFIED,
      pagination: undefined,
    }),
  "dex.orderbooks": (q: QueryClient) => q.dex.orderbooks({ pagination: undefined }),
  "dex.orderbookParams": (q: QueryClient) =>
    q.dex.orderbookParams({ baseDenom: DENOM, quoteDenom: QUOTE_DENOM }),
};
