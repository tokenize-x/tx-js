/**
 * Unit tests for Cosmos module message builders
 * Run: npx ts-node tests/unit/messages/cosmos.test.ts
 */

import {
  Authz,
  Staking,
  Governance,
  Feegrant,
  Bank,
  Distribution,
  Vesting,
} from "../../../src/cosmos";
import { assertMessage } from "../../helpers/messageAssertions";
import { printSummary, exitWithStatus, test } from "../../helpers/testRunner";
import { TEST_ADDRESS, TEST_VALIDATOR, TEST_DENOM, coins } from "../../helpers/fixtures";

async function run() {
  console.log("\nCosmos message builder tests\n");

  await test("Authz messages", () => {
    assertMessage("Authz.Grant", Authz.Grant({ granter: TEST_ADDRESS, grantee: TEST_ADDRESS } as never), "/cosmos.authz.v1beta1.MsgGrant");
    assertMessage("Authz.Exec", Authz.Exec({ grantee: TEST_ADDRESS, msgs: [] }), "/cosmos.authz.v1beta1.MsgExec");
    assertMessage("Authz.Revoke", Authz.Revoke({ granter: TEST_ADDRESS, grantee: TEST_ADDRESS, msgTypeUrl: "/cosmos.bank.v1beta1.MsgSend" }), "/cosmos.authz.v1beta1.MsgRevoke");
  });

  await test("Staking messages", () => {
    assertMessage("Staking.BeginRedelegate", Staking.BeginRedelegate({ delegatorAddress: TEST_ADDRESS, validatorSrcAddress: TEST_VALIDATOR, validatorDstAddress: TEST_VALIDATOR, amount: { denom: TEST_DENOM, amount: "1" } }), "/cosmos.staking.v1beta1.MsgBeginRedelegate");
    assertMessage("Staking.CancelUnbondingDelegation", Staking.CancelUnbondingDelegation({ delegatorAddress: TEST_ADDRESS, validatorAddress: TEST_VALIDATOR, amount: { denom: TEST_DENOM, amount: "1" }, creationHeight: BigInt(1) }), "/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation");
    assertMessage("Staking.CreateValidator", Staking.CreateValidator({ description: undefined, commission: undefined, minSelfDelegation: "1", delegatorAddress: TEST_ADDRESS, validatorAddress: TEST_VALIDATOR, pubkey: undefined, value: { denom: TEST_DENOM, amount: "1" } } as never), "/cosmos.staking.v1beta1.MsgCreateValidator");
    assertMessage("Staking.Delegate", Staking.Delegate({ delegatorAddress: TEST_ADDRESS, validatorAddress: TEST_VALIDATOR, amount: { denom: TEST_DENOM, amount: "1" } }), "/cosmos.staking.v1beta1.MsgDelegate");
    assertMessage("Staking.EditValidator", Staking.EditValidator({ description: undefined, commissionRate: "0.1", minSelfDelegation: "1", validatorAddress: TEST_VALIDATOR }), "/cosmos.staking.v1beta1.MsgEditValidator");
    assertMessage("Staking.Undelegate", Staking.Undelegate({ delegatorAddress: TEST_ADDRESS, validatorAddress: TEST_VALIDATOR, amount: { denom: TEST_DENOM, amount: "1" } }), "/cosmos.staking.v1beta1.MsgUndelegate");
    assertMessage("Staking.UpdateParams", Staking.UpdateParams({ authority: TEST_ADDRESS, params: undefined }), "/cosmos.staking.v1beta1.MsgUpdateParams");
  });

  await test("Governance messages", () => {
    assertMessage("Governance.Deposit", Governance.Deposit({ depositor: TEST_ADDRESS, proposalId: BigInt(1), amount: coins() }), "/cosmos.gov.v1beta1.MsgDeposit");
    assertMessage("Governance.SubmitProposal", Governance.SubmitProposal({ content: undefined, initialDeposit: coins(), proposer: TEST_ADDRESS } as never), "/cosmos.gov.v1beta1.MsgSubmitProposal");
    assertMessage("Governance.Vote", Governance.Vote({ voter: TEST_ADDRESS, proposalId: BigInt(1), option: 1 }), "/cosmos.gov.v1beta1.MsgVote");
    assertMessage("Governance.VoteWeighted", Governance.VoteWeighted({ voter: TEST_ADDRESS, proposalId: BigInt(1), options: [] }), "/cosmos.gov.v1beta1.MsgVoteWeighted");
  });

  await test("Feegrant messages", () => {
    assertMessage("Feegrant.GrantAllowance", Feegrant.GrantAllowance({ granter: TEST_ADDRESS, grantee: TEST_ADDRESS } as never), "/cosmos.feegrant.v1beta1.MsgGrantAllowance");
    assertMessage("Feegrant.RevokeAllowance", Feegrant.RevokeAllowance({ granter: TEST_ADDRESS, grantee: TEST_ADDRESS }), "/cosmos.feegrant.v1beta1.MsgRevokeAllowance");
  });

  await test("Bank messages", () => {
    assertMessage(
      "Bank.MultiSend",
      Bank.MultiSend({
        inputs: [{ address: TEST_ADDRESS, coins: coins() }],
        outputs: [{ address: TEST_ADDRESS, coins: coins() }],
      }),
      "/cosmos.bank.v1beta1.MsgMultiSend"
    );
    assertMessage("Bank.Send", Bank.Send({ fromAddress: TEST_ADDRESS, toAddress: TEST_ADDRESS, amount: coins() }), "/cosmos.bank.v1beta1.MsgSend");
    assertMessage("Bank.SetSendEnabled", Bank.SetSendEnabled({ authority: TEST_ADDRESS, sendEnabled: [], useDefaultFor: [] }), "/cosmos.bank.v1beta1.MsgSetSendEnabled");
    assertMessage("Bank.UpdateParams", Bank.UpdateParams({ authority: TEST_ADDRESS, params: undefined }), "/cosmos.bank.v1beta1.MsgUpdateParams");
  });

  await test("Distribution messages", () => {
    assertMessage("Distribution.WithdrawDelegatorReward", Distribution.WithdrawDelegatorReward({ delegatorAddress: TEST_ADDRESS, validatorAddress: TEST_VALIDATOR }), "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward");
    assertMessage("Distribution.UpdateParams", Distribution.UpdateParams({ authority: TEST_ADDRESS, params: undefined }), "/cosmos.distribution.v1beta1.MsgUpdateParams");
    assertMessage("Distribution.WithdrawValidatorCommission", Distribution.WithdrawValidatorCommission({ validatorAddress: TEST_VALIDATOR }), "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission");
    assertMessage("Distribution.CommunityPoolSpend", Distribution.CommunityPoolSpend({ authority: TEST_ADDRESS, recipient: TEST_ADDRESS, amount: coins() }), "/cosmos.distribution.v1beta1.MsgCommunityPoolSpend");
    assertMessage("Distribution.FundCommunityPool", Distribution.FundCommunityPool({ depositor: TEST_ADDRESS, amount: coins() }), "/cosmos.distribution.v1beta1.MsgFundCommunityPool");
    assertMessage("Distribution.SetWithdrawAddress", Distribution.SetWithdrawAddress({ delegatorAddress: TEST_ADDRESS, withdrawAddress: TEST_ADDRESS }), "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress");
  });

  await test("Vesting messages", () => {
    assertMessage("Vesting.CreateVestingAccount", Vesting.CreateVestingAccount({ fromAddress: TEST_ADDRESS, toAddress: TEST_ADDRESS, amount: coins(), endTime: BigInt(0), delayed: false }), "/cosmos.vesting.v1beta1.MsgCreateVestingAccount");
    assertMessage("Vesting.CreatePeriodicVestingAccount", Vesting.CreatePeriodicVestingAccount({ fromAddress: TEST_ADDRESS, toAddress: TEST_ADDRESS, startTime: BigInt(0), vestingPeriods: [] } as never), "/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount");
    assertMessage("Vesting.CreatePermanentLockedAccount", Vesting.CreatePermanentLockedAccount({ fromAddress: TEST_ADDRESS, toAddress: TEST_ADDRESS, amount: coins() }), "/cosmos.vesting.v1beta1.MsgCreatePermanentLockedAccount");
  });

  printSummary("Cosmos Message Tests");
  exitWithStatus();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
