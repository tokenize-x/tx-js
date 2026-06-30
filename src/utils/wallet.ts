import {
  DirectSecp256k1HdWallet,
  OfflineDirectSigner,
} from "@cosmjs/proto-signing";
import { stringToPath } from "@cosmjs/crypto";
import { bech32 } from "bech32";
import { CoreumPrefixes } from "../types/coreum";
import { createMultisigThresholdPubkey, pubkeyToAddress } from "@cosmjs/amino";
import { MultisigAccount } from "../types";
import { TxJsError } from "../errors";

/**
 *
 * @param address String representing an address on the Coreum blockchain
 * @param expectedPrefix Optional bech32 prefix that must match the active network
 * @returns A boolean defining if the passed address is a valid address on the Coreum Blockchain
 */
export const isValidCoreumAddress = (
  address: string,
  expectedPrefix?: CoreumPrefixes | string
): boolean => {
  try {
    const { prefix = null } = bech32.decode(address);

    if (
      prefix !== CoreumPrefixes.MAINNET &&
      prefix !== CoreumPrefixes.DEVNET &&
      prefix !== CoreumPrefixes.TESTNET
    ) {
      return false;
    }

    if (expectedPrefix && prefix !== expectedPrefix) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

export const assertValidCoreumAddress = (
  address: string,
  expectedPrefix?: CoreumPrefixes | string
): void => {
  if (!isValidCoreumAddress(address, expectedPrefix)) {
    throw new Error(`Invalid Coreum address: ${address}`);
  }
};

export const validateMnemonic = (mnemonic: string): void => {
  const words = mnemonic.trim().split(/\s+/);

  if (words.length !== 12 && words.length !== 24) {
    throw new Error("Mnemonic must contain 12 or 24 words");
  }

  if (words.some((word) => word.length === 0)) {
    throw new Error("Mnemonic contains empty words");
  }
};

/**
 *
 * @param mnemonic Mnemonic words of a Cosmos SDK wallet
 * @param prefix The prefix to use - "core" | "testcore" | "devcore"
 * @returns A wallet with the default hdPath for the Coreum Blockchain, and with the selected prefix.
 */
export const generateWalletFromMnemonic = async (
  mnemonic: string,
  prefix: CoreumPrefixes
): Promise<OfflineDirectSigner> => {
  validateMnemonic(mnemonic);

  const hdPath = "m/44'/990'/0'/0/0";

  try {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix,
      hdPaths: [stringToPath(hdPath)],
    });

    return wallet;
  } catch (error) {
    throw new TxJsError("generateWalletFromMnemonic", error);
  }
};

export const generateMultisigFromPubkeys = (
  pubkeys: string[],
  threshold: number,
  prefix: string
): MultisigAccount => {
  const secpPubkeys = pubkeys.map((p) => {
    return {
      type: "tendermint/PubKeySecp256k1",
      value: p,
    };
  });

  const multisigPubkey = createMultisigThresholdPubkey(secpPubkeys, threshold);

  return {
    pubkey: multisigPubkey,
    address: pubkeyToAddress(multisigPubkey, prefix),
    threshold,
  };
};
