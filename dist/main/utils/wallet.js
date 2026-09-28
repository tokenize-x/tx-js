"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMultisigFromPubkeys = exports.generateWalletFromMnemonic = exports.validateMnemonic = exports.assertValidCoreumAddress = exports.isValidCoreumAddress = void 0;
const proto_signing_1 = require("@cosmjs/proto-signing");
const crypto_1 = require("@cosmjs/crypto");
const bech32_1 = require("bech32");
const coreum_1 = require("../types/coreum");
const amino_1 = require("@cosmjs/amino");
const errors_1 = require("../errors");
/**
 *
 * @param address String representing an address on the Coreum blockchain
 * @param expectedPrefix Optional bech32 prefix that must match the active network
 * @returns A boolean defining if the passed address is a valid address on the Coreum Blockchain
 */
const isValidCoreumAddress = (address, expectedPrefix) => {
    try {
        const { prefix = null } = bech32_1.bech32.decode(address);
        if (prefix !== coreum_1.CoreumPrefixes.MAINNET &&
            prefix !== coreum_1.CoreumPrefixes.DEVNET &&
            prefix !== coreum_1.CoreumPrefixes.TESTNET) {
            return false;
        }
        if (expectedPrefix && prefix !== expectedPrefix) {
            return false;
        }
        return true;
    }
    catch {
        return false;
    }
};
exports.isValidCoreumAddress = isValidCoreumAddress;
const assertValidCoreumAddress = (address, expectedPrefix) => {
    if (!(0, exports.isValidCoreumAddress)(address, expectedPrefix)) {
        throw new Error(`Invalid Coreum address: ${address}`);
    }
};
exports.assertValidCoreumAddress = assertValidCoreumAddress;
const validateMnemonic = (mnemonic) => {
    const words = mnemonic.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
        throw new Error("Mnemonic must contain 12 or 24 words");
    }
    if (words.some((word) => word.length === 0)) {
        throw new Error("Mnemonic contains empty words");
    }
};
exports.validateMnemonic = validateMnemonic;
/**
 *
 * @param mnemonic Mnemonic words of a Cosmos SDK wallet
 * @param prefix The prefix to use - "core" | "testcore" | "devcore"
 * @returns A wallet with the default hdPath for the Coreum Blockchain, and with the selected prefix.
 */
const generateWalletFromMnemonic = async (mnemonic, prefix) => {
    (0, exports.validateMnemonic)(mnemonic);
    const hdPath = "m/44'/990'/0'/0/0";
    try {
        const wallet = await proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
            prefix,
            hdPaths: [(0, crypto_1.stringToPath)(hdPath)],
        });
        return wallet;
    }
    catch (error) {
        throw new errors_1.TxJsError("generateWalletFromMnemonic", error);
    }
};
exports.generateWalletFromMnemonic = generateWalletFromMnemonic;
const generateMultisigFromPubkeys = (pubkeys, threshold, prefix) => {
    const secpPubkeys = pubkeys.map((p) => {
        return {
            type: "tendermint/PubKeySecp256k1",
            value: p,
        };
    });
    const multisigPubkey = (0, amino_1.createMultisigThresholdPubkey)(secpPubkeys, threshold);
    return {
        pubkey: multisigPubkey,
        address: (0, amino_1.pubkeyToAddress)(multisigPubkey, prefix),
        threshold,
    };
};
exports.generateMultisigFromPubkeys = generateMultisigFromPubkeys;
