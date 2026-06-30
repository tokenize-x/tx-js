# Examples

Runnable examples for every message builder and query extension in `@tokenize-x/tx-js`.

## Messages

Build transaction messages with typed SDK helpers:

```typescript
import { Client, Bank, FT } from "@tokenize-x/tx-js";
import { allMessageExamples } from "./messages";

// Use a specific example
await client.sendTx([allMessageExamples["Bank.Send"]]);

// Or build manually
await client.sendTx([
  FT.Issue({
    issuer: "testcore1...",
    symbol: "MYTOKEN",
    subunit: "umytoken",
    precision: 6,
    initialAmount: "1000000",
    description: "My token",
    features: [],
    burnRate: "0",
    sendCommissionRate: "0",
  }),
]);
```

| File | Coverage |
|------|----------|
| `messages/coreum.ts` | FT (11), NFT (8), DEX (4) |
| `messages/cosmos.ts` | Authz, Staking, Gov, Feegrant, Bank, Distribution, Vesting |
| `messages/wasm.ts` | CosmWasm (13), IBC (2) |
| `messages/index.ts` | Combined `allMessageExamples` export |

List all messages:

```bash
npx ts-node examples/messages/list-all.ts
```

## Queries

Query chain state via `client.queryClients` after `connect()`:

```typescript
import { Client, CoreumNetwork } from "@tokenize-x/tx-js";

const client = new Client({ network: CoreumNetwork.TESTNET });
await client.connect();

const balance = await client.queryClients!.bank.balance("testcore1...", "utestcore");
const ftParams = await client.queryClients!.ft.params();
```

| File | Coverage |
|------|----------|
| `queries/coreum.ts` | ft, nft, nftbeta, dex |
| `queries/cosmos.ts` | bank, gov, distribution |
| `queries/cosmjs.ts` | staking, auth, mint, feegrant, ibc, tx, wasm (CosmJS) |
| `queries/wasm-proto.ts` | wasm proto queries |
| `queries/index.ts` | Combined exports |

Run all query examples against testnet:

```bash
npx ts-node examples/queries/run-all.ts
```

## Other examples

- `amino-types-usage.ts` — Coreum Amino type conversion for Ledger-compatible signing

## Shared constants

Replace placeholder addresses in `shared/constants.ts` with your own before broadcasting transactions.
