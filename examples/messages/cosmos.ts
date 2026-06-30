/**
 * Cosmos module message builder examples
 *
 * Usage:
 *   import { cosmosMessageExamples } from "./messages/cosmos";
 *   await client.sendTx([cosmosMessageExamples["Bank.Send"]]);
 */

import { EncodeObject } from "@cosmjs/proto-signing";
import {
  Authz,
  Staking,
  Governance,
  Feegrant,
  Bank,
  Distribution,
  Vesting,
} from "../../src/cosmos";
import { ADDRESS, DENOM, VALIDATOR, coins } from "../shared/constants";

export const cosmosMessageExamples: Record<string, EncodeObject> = {
  "Authz.Grant": Authz.Grant({
    granter: ADDRESS,
    grantee: ADDRESS,
  } as never),
  "Authz.Exec": Authz.Exec({ grantee: ADDRESS, msgs: [] }),
  "Authz.Revoke": Authz.Revoke({
    granter: ADDRESS,
    grantee: ADDRESS,
    msgTypeUrl: "/cosmos.bank.v1beta1.MsgSend",
  }),

  "Staking.Delegate": Staking.Delegate({
    delegatorAddress: ADDRESS,
    validatorAddress: VALIDATOR,
    amount: { denom: DENOM, amount: "1000" },
  }),
  "Staking.Undelegate": Staking.Undelegate({
    delegatorAddress: ADDRESS,
    validatorAddress: VALIDATOR,
    amount: { denom: DENOM, amount: "1000" },
  }),
  "Staking.BeginRedelegate": Staking.BeginRedelegate({
    delegatorAddress: ADDRESS,
    validatorSrcAddress: VALIDATOR,
    validatorDstAddress: VALIDATOR,
    amount: { denom: DENOM, amount: "1000" },
  }),
  "Staking.CancelUnbondingDelegation": Staking.CancelUnbondingDelegation({
    delegatorAddress: ADDRESS,
    validatorAddress: VALIDATOR,
    amount: { denom: DENOM, amount: "1000" },
    creationHeight: BigInt(1),
  }),
  "Staking.CreateValidator": Staking.CreateValidator({
    description: undefined,
    commission: undefined,
    minSelfDelegation: "1",
    delegatorAddress: ADDRESS,
    validatorAddress: VALIDATOR,
    pubkey: undefined,
    value: { denom: DENOM, amount: "1000000" },
  } as never),
  "Staking.EditValidator": Staking.EditValidator({
    description: undefined,
    commissionRate: "0.1",
    minSelfDelegation: "1",
    validatorAddress: VALIDATOR,
  }),
  "Staking.UpdateParams": Staking.UpdateParams({
    authority: ADDRESS,
    params: undefined,
  }),

  "Governance.Deposit": Governance.Deposit({
    depositor: ADDRESS,
    proposalId: BigInt(1),
    amount: coins("1000"),
  }),
  "Governance.SubmitProposal": Governance.SubmitProposal({
    content: undefined,
    initialDeposit: coins("1000"),
    proposer: ADDRESS,
  } as never),
  "Governance.Vote": Governance.Vote({
    voter: ADDRESS,
    proposalId: BigInt(1),
    option: 1,
  }),
  "Governance.VoteWeighted": Governance.VoteWeighted({
    voter: ADDRESS,
    proposalId: BigInt(1),
    options: [],
  }),

  "Feegrant.GrantAllowance": Feegrant.GrantAllowance({
    granter: ADDRESS,
    grantee: ADDRESS,
  } as never),
  "Feegrant.RevokeAllowance": Feegrant.RevokeAllowance({
    granter: ADDRESS,
    grantee: ADDRESS,
  }),

  "Bank.Send": Bank.Send({
    fromAddress: ADDRESS,
    toAddress: ADDRESS,
    amount: coins("1000"),
  }),
  "Bank.MultiSend": Bank.MultiSend({
    inputs: [{ address: ADDRESS, coins: coins("1000") }],
    outputs: [{ address: ADDRESS, coins: coins("1000") }],
  }),
  "Bank.SetSendEnabled": Bank.SetSendEnabled({
    authority: ADDRESS,
    sendEnabled: [],
    useDefaultFor: [],
  }),
  "Bank.UpdateParams": Bank.UpdateParams({
    authority: ADDRESS,
    params: undefined,
  }),

  "Distribution.WithdrawDelegatorReward": Distribution.WithdrawDelegatorReward({
    delegatorAddress: ADDRESS,
    validatorAddress: VALIDATOR,
  }),
  "Distribution.WithdrawValidatorCommission":
    Distribution.WithdrawValidatorCommission({
      validatorAddress: VALIDATOR,
    }),
  "Distribution.CommunityPoolSpend": Distribution.CommunityPoolSpend({
    authority: ADDRESS,
    recipient: ADDRESS,
    amount: coins("1000"),
  }),
  "Distribution.FundCommunityPool": Distribution.FundCommunityPool({
    depositor: ADDRESS,
    amount: coins("1000"),
  }),
  "Distribution.SetWithdrawAddress": Distribution.SetWithdrawAddress({
    delegatorAddress: ADDRESS,
    withdrawAddress: ADDRESS,
  }),
  "Distribution.UpdateParams": Distribution.UpdateParams({
    authority: ADDRESS,
    params: undefined,
  }),

  "Vesting.CreateVestingAccount": Vesting.CreateVestingAccount({
    fromAddress: ADDRESS,
    toAddress: ADDRESS,
    amount: coins("1000"),
    endTime: BigInt(0),
    delayed: false,
  }),
  "Vesting.CreatePeriodicVestingAccount": Vesting.CreatePeriodicVestingAccount({
    fromAddress: ADDRESS,
    toAddress: ADDRESS,
    startTime: BigInt(0),
    vestingPeriods: [],
  } as never),
  "Vesting.CreatePermanentLockedAccount": Vesting.CreatePermanentLockedAccount({
    fromAddress: ADDRESS,
    toAddress: ADDRESS,
    amount: coins("1000"),
  }),
};
