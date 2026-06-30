/**
 * Integration tests for all query extensions against Coreum testnet
 * Run: npx ts-node tests/integration/queries.test.ts
 */

import { Client } from "../../src/client/index";
import { CoreumNetwork } from "../../src/types/coreum";
import { Side } from "../../src/coreum/dex/v1/order";
import { ProposalStatus } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { QueryClient } from "@cosmjs/stargate";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
import { setupWasmExtension as setupProtoWasmExtension } from "../../src/wasm/v1/extensions/wasm";
import {
  printSummary,
  exitWithStatus,
  test,
  testQuery,
} from "../helpers/testRunner";
import {
  TEST_ADDRESS,
  TEST_CLASS_ID,
  TEST_CONTRACT,
  TEST_DENOM,
  TEST_NFT_ID,
  TEST_VALIDATOR,
} from "../helpers/fixtures";

async function run() {
  console.log("\nQuery extension integration tests (testnet)\n");

  const client = new Client({ network: CoreumNetwork.TESTNET });

  try {
    await client.connect();
  } catch (error) {
    console.error("Failed to connect to testnet RPC. Skipping query tests.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(0);
  }

  const q = client.queryClients!;

  await test("FT queries", async () => {
    await testQuery("ft.params", () => q.ft.params());
    await testQuery("ft.tokens", () => q.ft.tokens(TEST_ADDRESS));
    await testQuery("ft.token", () => q.ft.token(TEST_DENOM));
    await testQuery("ft.frozenBalances", () => q.ft.frozenBalances(TEST_ADDRESS));
    await testQuery("ft.frozenBalance", () => q.ft.frozenBalance(TEST_ADDRESS, TEST_DENOM));
    await testQuery("ft.whitelistedBalances", () => q.ft.whitelistedBalances(TEST_ADDRESS));
    await testQuery("ft.whitelistedBalance", () => q.ft.whitelistedBalance(TEST_ADDRESS, TEST_DENOM));
  });

  await test("NFT queries", async () => {
    await testQuery("nft.params", () => q.nft.params());
    await testQuery("nft.class", () => q.nft.class(TEST_CLASS_ID));
    await testQuery("nft.frozen", () => q.nft.frozen(TEST_NFT_ID, TEST_CLASS_ID));
    await testQuery("nft.whitelisted", () => q.nft.whitelisted(TEST_NFT_ID, TEST_CLASS_ID, TEST_ADDRESS));
    await testQuery("nft.whitelistedAccountsForNFT", () => q.nft.whitelistedAccountsForNFT(TEST_NFT_ID, TEST_CLASS_ID));
  });

  await test("NFT beta queries", async () => {
    await testQuery("nftbeta.classes", () => q.nftbeta.classes());
    await testQuery("nftbeta.class", () => q.nftbeta.class(TEST_CLASS_ID));
    await testQuery("nftbeta.balance", () => q.nftbeta.balance(TEST_CLASS_ID, TEST_ADDRESS));
    await testQuery("nftbeta.owner", () => q.nftbeta.owner(TEST_CLASS_ID, TEST_NFT_ID));
    await testQuery("nftbeta.supply", () => q.nftbeta.supply(TEST_CLASS_ID));
    await testQuery("nftbeta.nfts", () => q.nftbeta.nfts(TEST_CLASS_ID, TEST_ADDRESS));
    await testQuery("nftbeta.nft", () => q.nftbeta.nft(TEST_NFT_ID, TEST_CLASS_ID));
  });

  await test("DEX queries", async () => {
    await testQuery("dex.params", () => q.dex.params({}));
    await testQuery("dex.orders", () => q.dex.orders({ creator: TEST_ADDRESS, pagination: undefined }));
    await testQuery("dex.order", () => q.dex.order({ creator: TEST_ADDRESS, id: "1" }));
    await testQuery("dex.ordersCountByDenomAndAccount", () =>
      q.dex.ordersCountByDenomAndAccount({ account: TEST_ADDRESS, denom: TEST_DENOM })
    );
    await testQuery("dex.orderbook", () =>
      q.dex.orderbook({
        baseDenom: TEST_DENOM,
        quoteDenom: "utest2",
        side: Side.SIDE_UNSPECIFIED,
        pagination: undefined,
      })
    );
    await testQuery("dex.orderbooks", () => q.dex.orderbooks({ pagination: undefined }));
    await testQuery("dex.orderbookParams", () =>
      q.dex.orderbookParams({ baseDenom: TEST_DENOM, quoteDenom: "utest2" })
    );
  });

  await test("Bank queries", async () => {
    await testQuery("bank.balance", () => q.bank.balance(TEST_ADDRESS, TEST_DENOM));
    await testQuery("bank.allBalances", () => q.bank.allBalances(TEST_ADDRESS));
    await testQuery("bank.totalSupply", () => q.bank.totalSupply());
    await testQuery("bank.supplyOf", () => q.bank.supplyOf(TEST_DENOM));
    await testQuery("bank.denomMetadata", () => q.bank.denomMetadata(TEST_DENOM));
    await testQuery("bank.denomsMetadata", () => q.bank.denomsMetadata());
  });

  await test("Governance queries", async () => {
    await testQuery("gov.params (voting)", () => q.gov.params("voting"));
    await testQuery("gov.params (deposit)", () => q.gov.params("deposit"));
    await testQuery("gov.params (tallying)", () => q.gov.params("tallying"));
    await testQuery("gov.proposals", () =>
      q.gov.proposals(ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED, "", "")
    );
    await testQuery("gov.proposal", () => q.gov.proposal(BigInt(1)));
    await testQuery("gov.deposits", () => q.gov.deposits(BigInt(1)));
    await testQuery("gov.deposit", () => q.gov.deposit(BigInt(1), TEST_ADDRESS));
    await testQuery("gov.tally", () => q.gov.tally(BigInt(1)));
    await testQuery("gov.votes", () => q.gov.votes(BigInt(1)));
    await testQuery("gov.vote", () => q.gov.vote(BigInt(1), TEST_ADDRESS));
  });

  await test("Distribution queries", async () => {
    await testQuery("distribution.params", () => q.distribution.params());
    await testQuery("distribution.communityPool", () => q.distribution.communityPool());
    await testQuery("distribution.delegationRewards", () =>
      q.distribution.delegationRewards(TEST_ADDRESS, TEST_VALIDATOR)
    );
    await testQuery("distribution.delegationTotalRewards", () =>
      q.distribution.delegationTotalRewards(TEST_ADDRESS)
    );
    await testQuery("distribution.delegatorValidators", () =>
      q.distribution.delegatorValidators(TEST_ADDRESS)
    );
    await testQuery("distribution.delegatorWithdrawAddress", () =>
      q.distribution.delegatorWithdrawAddress(TEST_ADDRESS)
    );
    await testQuery("distribution.validatorCommission", () =>
      q.distribution.validatorCommission(TEST_VALIDATOR)
    );
    await testQuery("distribution.validatorOutstandingRewards", () =>
      q.distribution.validatorOutstandingRewards(TEST_VALIDATOR)
    );
    await testQuery("distribution.validatorSlashes", () =>
      q.distribution.validatorSlashes(TEST_VALIDATOR, BigInt(1), BigInt(100))
    );
  });

  await test("CosmJS wasm queries", async () => {
    await testQuery("wasm.listCodeInfo", () => q.wasm.listCodeInfo());
    await testQuery("wasm.getCode", () => q.wasm.getCode(1));
    await testQuery("wasm.listContractsByCodeId", () => q.wasm.listContractsByCodeId(1));
    await testQuery("wasm.listContractsByCreator", () => q.wasm.listContractsByCreator(TEST_ADDRESS));
    await testQuery("wasm.getContractInfo", () => q.wasm.getContractInfo(TEST_CONTRACT));
    await testQuery("wasm.getContractCodeHistory", () => q.wasm.getContractCodeHistory(TEST_CONTRACT));
    await testQuery("wasm.getAllContractState", () => q.wasm.getAllContractState(TEST_CONTRACT));
    await testQuery("wasm.queryContractRaw", () => q.wasm.queryContractRaw(TEST_CONTRACT, new Uint8Array()));
    await testQuery("wasm.queryContractSmart", () => q.wasm.queryContractSmart(TEST_CONTRACT, {}));
  });

  await test("Proto wasm queries", async () => {
    const tm = await Tendermint37Client.connect(
      client.config.chain_rpc_endpoint
    );
    const protoClient = QueryClient.withExtensions(tm, setupProtoWasmExtension);

    await testQuery("proto wasm.params", () => protoClient.wasm.params({}));
    await testQuery("proto wasm.codes", () => protoClient.wasm.codes({ pagination: undefined }));
    await testQuery("proto wasm.code", () => protoClient.wasm.code({ codeId: 1 }));
    await testQuery("proto wasm.pinnedCodes", () => protoClient.wasm.pinnedCodes({ pagination: undefined }));
    await testQuery("proto wasm.contractsByCode", () =>
      protoClient.wasm.contractsByCode({ codeId: 1, pagination: undefined })
    );
    await testQuery("proto wasm.contractsByCreator", () =>
      protoClient.wasm.contractsByCreator({ creatorAddress: TEST_ADDRESS, pagination: undefined })
    );
    await testQuery("proto wasm.contractInfo", () =>
      protoClient.wasm.contractInfo({ address: TEST_CONTRACT })
    );
    await testQuery("proto wasm.contractHistory", () =>
      protoClient.wasm.contractHistory({ address: TEST_CONTRACT, pagination: undefined })
    );
    await testQuery("proto wasm.allContractState", () =>
      protoClient.wasm.allContractState({ address: TEST_CONTRACT, pagination: undefined })
    );
    await testQuery("proto wasm.rawContractState", () =>
      protoClient.wasm.rawContractState({ address: TEST_CONTRACT, queryData: new Uint8Array() })
    );
    await testQuery("proto wasm.smartContractState", () =>
      protoClient.wasm.smartContractState({
        address: TEST_CONTRACT,
        queryData: new Uint8Array([123, 125]),
      })
    );

    tm.disconnect();
  });

  await test("CosmJS staking queries", async () => {
    await testQuery("staking.validators", () => q.staking.validators("BOND_STATUS_BONDED"));
    await testQuery("staking.pool", () => q.staking.pool());
    await testQuery("staking.params", () => q.staking.params());
    await testQuery("staking.delegation", () =>
      q.staking.delegation(TEST_ADDRESS, TEST_VALIDATOR)
    );
    await testQuery("staking.delegatorDelegations", () =>
      q.staking.delegatorDelegations(TEST_ADDRESS)
    );
    await testQuery("staking.delegatorValidators", () =>
      q.staking.delegatorValidators(TEST_ADDRESS)
    );
    await testQuery("staking.delegatorValidator", () =>
      q.staking.delegatorValidator(TEST_ADDRESS, TEST_VALIDATOR)
    );
    await testQuery("staking.delegatorUnbondingDelegations", () =>
      q.staking.delegatorUnbondingDelegations(TEST_ADDRESS)
    );
    await testQuery("staking.unbondingDelegation", () =>
      q.staking.unbondingDelegation(TEST_ADDRESS, TEST_VALIDATOR)
    );
    await testQuery("staking.validator", () => q.staking.validator(TEST_VALIDATOR));
    await testQuery("staking.validatorDelegations", () =>
      q.staking.validatorDelegations(TEST_VALIDATOR)
    );
    await testQuery("staking.validatorUnbondingDelegations", () =>
      q.staking.validatorUnbondingDelegations(TEST_VALIDATOR)
    );
    await testQuery("staking.redelegations", () =>
      q.staking.redelegations(TEST_ADDRESS, TEST_VALIDATOR, TEST_VALIDATOR)
    );
  });

  await test("CosmJS auth queries", async () => {
    await testQuery("auth.account", () => q.auth.account(TEST_ADDRESS));
  });

  await test("CosmJS mint queries", async () => {
    await testQuery("mint.params", () => q.mint.params());
    await testQuery("mint.inflation", () => q.mint.inflation());
    await testQuery("mint.annualProvisions", () => q.mint.annualProvisions());
  });

  await test("CosmJS feegrant queries", async () => {
    await testQuery("feegrant.allowance", () =>
      q.feegrant.allowance(TEST_ADDRESS, TEST_ADDRESS)
    );
    await testQuery("feegrant.allowances", () => q.feegrant.allowances(TEST_ADDRESS));
  });

  await test("CosmJS IBC queries", async () => {
    await testQuery("ibc.client.state", () => q.ibc.client.state("07-tendermint-0"));
    await testQuery("ibc.client.allStates", () => q.ibc.client.allStates());
    await testQuery("ibc.client.consensusState", () =>
      q.ibc.client.consensusState("07-tendermint-0")
    );
    await testQuery("ibc.client.params", () => q.ibc.client.params());
    await testQuery("ibc.connection.connection", () => q.ibc.connection.connection("connection-0"));
    await testQuery("ibc.connection.allConnections", () => q.ibc.connection.allConnections());
    await testQuery("ibc.channel.allChannels", () => q.ibc.channel.allChannels());
    await testQuery("ibc.transfer.params", () => q.ibc.transfer.params());
    await testQuery("ibc.transfer.allDenomTraces", () => q.ibc.transfer.allDenomTraces());
  });

  await test("CosmJS tx queries", async () => {
    await testQuery("tx.getTx", () =>
      q.tx.getTx("0000000000000000000000000000000000000000000000000000000000000000")
    );
  });

  client.disconnect();
  printSummary("Query Integration Tests");
  exitWithStatus();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
