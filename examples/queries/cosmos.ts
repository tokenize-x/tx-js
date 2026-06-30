/**
 * Cosmos module query examples (bank, gov, distribution)
 */

import { Client } from "../../src/client/index";
import { ProposalStatus } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { ADDRESS, DENOM, VALIDATOR } from "../shared/constants";

type QueryClient = NonNullable<Client["queryClients"]>;

export const cosmosQueryExamples = {
  "bank.balance": (q: QueryClient) => q.bank.balance(ADDRESS, DENOM),
  "bank.allBalances": (q: QueryClient) => q.bank.allBalances(ADDRESS),
  "bank.totalSupply": (q: QueryClient) => q.bank.totalSupply(),
  "bank.supplyOf": (q: QueryClient) => q.bank.supplyOf(DENOM),
  "bank.denomMetadata": (q: QueryClient) => q.bank.denomMetadata(DENOM),
  "bank.denomsMetadata": (q: QueryClient) => q.bank.denomsMetadata(),

  "gov.params.voting": (q: QueryClient) => q.gov.params("voting"),
  "gov.params.deposit": (q: QueryClient) => q.gov.params("deposit"),
  "gov.params.tallying": (q: QueryClient) => q.gov.params("tallying"),
  "gov.proposals": (q: QueryClient) =>
    q.gov.proposals(ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED, "", ""),
  "gov.proposal": (q: QueryClient) => q.gov.proposal(BigInt(1)),
  "gov.deposits": (q: QueryClient) => q.gov.deposits(BigInt(1)),
  "gov.deposit": (q: QueryClient) => q.gov.deposit(BigInt(1), ADDRESS),
  "gov.tally": (q: QueryClient) => q.gov.tally(BigInt(1)),
  "gov.votes": (q: QueryClient) => q.gov.votes(BigInt(1)),
  "gov.vote": (q: QueryClient) => q.gov.vote(BigInt(1), ADDRESS),

  "distribution.params": (q: QueryClient) => q.distribution.params(),
  "distribution.communityPool": (q: QueryClient) => q.distribution.communityPool(),
  "distribution.delegationRewards": (q: QueryClient) =>
    q.distribution.delegationRewards(ADDRESS, VALIDATOR),
  "distribution.delegationTotalRewards": (q: QueryClient) =>
    q.distribution.delegationTotalRewards(ADDRESS),
  "distribution.delegatorValidators": (q: QueryClient) =>
    q.distribution.delegatorValidators(ADDRESS),
  "distribution.delegatorWithdrawAddress": (q: QueryClient) =>
    q.distribution.delegatorWithdrawAddress(ADDRESS),
  "distribution.validatorCommission": (q: QueryClient) =>
    q.distribution.validatorCommission(VALIDATOR),
  "distribution.validatorOutstandingRewards": (q: QueryClient) =>
    q.distribution.validatorOutstandingRewards(VALIDATOR),
  "distribution.validatorSlashes": (q: QueryClient) =>
    q.distribution.validatorSlashes(VALIDATOR, BigInt(1), BigInt(100)),
};
