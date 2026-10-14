import { MultisigThresholdPubkey, StdFee } from "@cosmjs/amino";

export interface MultisigAccount {
  pubkey: MultisigThresholdPubkey;
  address: string;
  threshold: number;
}

export enum WalletMethods {
  OFFLINE = "offline",
  COSMOSTATION = "cosmostation",
  MNEMONIC = "mnemonic",
  LEAP = "leap",
}

export interface FeeCalculation {
  fee: StdFee;
  gas_wanted: number;
}

export interface FeeOptions {
  address?: string;
  gasLimit?: number;
}

export enum ExtensionWallets {
  KEPLR = "keplr",
  COSMOSTATION = "cosmostation",
  LEAP = "leap",
}

export interface UnorderedTxOptions {
  /**
   * TTL of the transaction from now, in milliseconds. Defaults to 5 minutes; the chain
   * rejects anything above 10 minutes.
   */
  timeoutMs?: number;
  /**
   * Exact timeout to sign with instead of one derived from `timeoutMs`. It must be unique per
   * signer and within 10 minutes of block time; the chain, not this client, validates it.
   */
  timeoutTimestamp?: Date;
}

export interface SendTxOptions extends UnorderedTxOptions {
  /**
   * Sign an unordered transaction (Cosmos SDK v0.53, ADR-070): no account sequence, so
   * several transactions from one signer can be broadcast in parallel. Needs a direct signer.
   */
  unordered?: boolean;
}
