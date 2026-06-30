# Tests

This directory contains tests for the `@pulsara/tx-js` package.

## Test Structure

```
tests/
├── helpers/           # Shared test runner, fixtures, message assertions
├── unit/              # Fast offline tests (no RPC required)
│   ├── messages/      # All message builders (FT, NFT, DEX, Cosmos, Wasm)
│   ├── wallet.test.ts
│   ├── calculations.test.ts
│   └── endpoints.test.ts
├── integration/       # Live testnet RPC tests
│   └── queries.test.ts
└── client/
    └── calculateGas.test.ts
```

## Running Tests

```bash
# Full suite (unit + integration)
npm test

# Unit tests only (messages, utils — no network)
npm run test:unit

# Integration tests (testnet RPC)
npm run test:integration
```

## Coverage

### Message builders (unit)

| Module | Messages tested |
|--------|-----------------|
| **FT** | Mint, Issue, Burn, Freeze, Unfreeze, GloballyFreeze, GloballyUnfreeze, SetWhitelistedLimit, Clawback, UpdateDEXUnifiedRefAmount, UpdateDEXWhitelistedDenoms |
| **NFT** | Mint, IssueClass, Send, Burn, Freeze, Unfreeze, AddToWhitelist, RemoveFromWhitelist |
| **DEX** | PlaceOrder, CancelOrder, UpdateParams, CancelOrdersByDenom |
| **Authz** | Grant, Exec, Revoke |
| **Staking** | Delegate, Undelegate, BeginRedelegate, CreateValidator, EditValidator, CancelUnbondingDelegation, UpdateParams |
| **Governance** | Deposit, SubmitProposal, Vote, VoteWeighted |
| **Feegrant** | GrantAllowance, RevokeAllowance |
| **Bank** | Send, MultiSend, SetSendEnabled, UpdateParams |
| **Distribution** | WithdrawDelegatorReward, WithdrawValidatorCommission, CommunityPoolSpend, FundCommunityPool, SetWithdrawAddress, UpdateParams |
| **Vesting** | CreateVestingAccount, CreatePeriodicVestingAccount, CreatePermanentLockedAccount |
| **CosmWasm** | StoreCode, InstantiateContract, InstantiateContract2, ExecuteContract, MigrateContract, UpdateAdmin, ClearAdmin, StoreAndInstantiateContract, PinCodes, UnpinCodes, SudoContract, UpdateParams, UpdateInstantiateConfig |
| **IBC** | IBCSend, IBCCloseChannel |

Each message test verifies `typeUrl`, value presence, and registry encoding (or notes when the type is not in the default registry).

### Query extensions (integration)

| Extension | Queries tested |
|-----------|----------------|
| **ft** | params, tokens, token, frozenBalances, frozenBalance, whitelistedBalances, whitelistedBalance |
| **nft** | params, class, frozen, whitelisted, whitelistedAccountsForNFT |
| **nftbeta** | classes, class, balance, owner, supply, nfts, nft |
| **dex** | params, orders, order, ordersCountByDenomAndAccount, orderbook, orderbooks, orderbookParams |
| **bank** | balance, allBalances, totalSupply, supplyOf, denomMetadata, denomsMetadata |
| **gov** | params, proposals, proposal, deposits, deposit, tally, votes, vote |
| **distribution** | params, communityPool, delegationRewards, delegationTotalRewards, delegatorValidators, delegatorWithdrawAddress, validatorCommission, validatorOutstandingRewards, validatorSlashes |
| **wasm (CosmJS)** | listCodeInfo, getCode, listContractsByCodeId, listContractsByCreator, getContractInfo, getContractCodeHistory, getAllContractState, queryContractRaw, queryContractSmart |
| **wasm (proto)** | params, codes, code, pinnedCodes, contractsByCode, contractsByCreator, contractInfo, contractHistory, allContractState, rawContractState, smartContractState |
| **staking** | validators, pool, params, delegation, delegatorDelegations, delegatorValidators, delegatorValidator, delegatorUnbondingDelegations, unbondingDelegation, validator, validatorDelegations, validatorUnbondingDelegations, redelegations |
| **auth** | account |
| **mint** | params, inflation, annualProvisions |
| **feegrant** | allowance, allowances |
| **ibc** | client.state, client.allStates, client.consensusState, client.params, connection.connection, connection.allConnections, channel.allChannels, transfer.params, transfer.allDenomTraces |
| **tx** | getTx |

Integration queries that return "not found" for dummy data are counted as **skipped**, not failures.

## Excluded from Build

Tests are excluded from the TypeScript build via `tsconfig.json` and `tsconfig.module.json`.
