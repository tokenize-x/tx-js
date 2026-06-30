/**
 * CosmJS built-in query examples (staking, auth, mint, feegrant, ibc, tx, wasm)
 */

import { Client } from "../../src/client/index";
import { ADDRESS, CONTRACT, VALIDATOR } from "../shared/constants";

type QueryClient = NonNullable<Client["queryClients"]>;

export const cosmjsQueryExamples = {
  "staking.validators": (q: QueryClient) => q.staking.validators("BOND_STATUS_BONDED"),
  "staking.pool": (q: QueryClient) => q.staking.pool(),
  "staking.params": (q: QueryClient) => q.staking.params(),
  "staking.delegation": (q: QueryClient) => q.staking.delegation(ADDRESS, VALIDATOR),
  "staking.delegatorDelegations": (q: QueryClient) => q.staking.delegatorDelegations(ADDRESS),
  "staking.delegatorValidators": (q: QueryClient) => q.staking.delegatorValidators(ADDRESS),
  "staking.delegatorValidator": (q: QueryClient) =>
    q.staking.delegatorValidator(ADDRESS, VALIDATOR),
  "staking.delegatorUnbondingDelegations": (q: QueryClient) =>
    q.staking.delegatorUnbondingDelegations(ADDRESS),
  "staking.unbondingDelegation": (q: QueryClient) =>
    q.staking.unbondingDelegation(ADDRESS, VALIDATOR),
  "staking.validator": (q: QueryClient) => q.staking.validator(VALIDATOR),
  "staking.validatorDelegations": (q: QueryClient) =>
    q.staking.validatorDelegations(VALIDATOR),
  "staking.validatorUnbondingDelegations": (q: QueryClient) =>
    q.staking.validatorUnbondingDelegations(VALIDATOR),
  "staking.redelegations": (q: QueryClient) =>
    q.staking.redelegations(ADDRESS, VALIDATOR, VALIDATOR),

  "auth.account": (q: QueryClient) => q.auth.account(ADDRESS),

  "mint.params": (q: QueryClient) => q.mint.params(),
  "mint.inflation": (q: QueryClient) => q.mint.inflation(),
  "mint.annualProvisions": (q: QueryClient) => q.mint.annualProvisions(),

  "feegrant.allowance": (q: QueryClient) => q.feegrant.allowance(ADDRESS, ADDRESS),
  "feegrant.allowances": (q: QueryClient) => q.feegrant.allowances(ADDRESS),

  "ibc.client.state": (q: QueryClient) => q.ibc.client.state("07-tendermint-0"),
  "ibc.client.allStates": (q: QueryClient) => q.ibc.client.allStates(),
  "ibc.client.consensusState": (q: QueryClient) =>
    q.ibc.client.consensusState("07-tendermint-0"),
  "ibc.client.params": (q: QueryClient) => q.ibc.client.params(),
  "ibc.connection.connection": (q: QueryClient) =>
    q.ibc.connection.connection("connection-0"),
  "ibc.connection.allConnections": (q: QueryClient) => q.ibc.connection.allConnections(),
  "ibc.channel.allChannels": (q: QueryClient) => q.ibc.channel.allChannels(),
  "ibc.transfer.params": (q: QueryClient) => q.ibc.transfer.params(),
  "ibc.transfer.allDenomTraces": (q: QueryClient) => q.ibc.transfer.allDenomTraces(),

  "tx.getTx": (q: QueryClient) =>
    q.tx.getTx("0000000000000000000000000000000000000000000000000000000000000000"),

  "wasm.listCodeInfo": (q: QueryClient) => q.wasm.listCodeInfo(),
  "wasm.getCode": (q: QueryClient) => q.wasm.getCode(1),
  "wasm.listContractsByCodeId": (q: QueryClient) => q.wasm.listContractsByCodeId(1),
  "wasm.listContractsByCreator": (q: QueryClient) => q.wasm.listContractsByCreator(ADDRESS),
  "wasm.getContractInfo": (q: QueryClient) => q.wasm.getContractInfo(CONTRACT),
  "wasm.getContractCodeHistory": (q: QueryClient) => q.wasm.getContractCodeHistory(CONTRACT),
  "wasm.getAllContractState": (q: QueryClient) => q.wasm.getAllContractState(CONTRACT),
  "wasm.queryContractRaw": (q: QueryClient) =>
    q.wasm.queryContractRaw(CONTRACT, new Uint8Array()),
  "wasm.queryContractSmart": (q: QueryClient) => q.wasm.queryContractSmart(CONTRACT, {}),
};
