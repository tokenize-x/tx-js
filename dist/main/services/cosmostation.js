"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCosmosOfflineSigner = exports.connectCosmostation = void 0;
const extension_client_1 = require("@cosmostation/extension-client");
const cosmos_client_1 = require("@cosmostation/cosmos-client");
const errors_1 = require("../errors");
const connectCosmostation = async (config) => {
    try {
        const provider = await (0, extension_client_1.cosmos)();
        const gasPrice = (config.gas_price || "").replace(config.staking_denom || "", "");
        await provider.addChain({
            chainId: config.chain_id,
            chainName: config.chain_name,
            addressPrefix: config.chain_bech32_prefix,
            baseDenom: config.staking_denom,
            displayDenom: "core",
            restURL: config.chain_rest_endpoint,
            coinType: String(config.coin_type),
            decimals: 6,
            gasRate: {
                average: gasPrice,
                low: gasPrice,
                tiny: gasPrice,
            },
        });
    }
    catch (error) {
        if (error instanceof Error && error.name === "InstallError") {
            throw new errors_1.TxJsError("connectCosmostation", "Extension not installed.", 4000);
        }
        throw new errors_1.TxJsError("connectCosmostation", error);
    }
};
exports.connectCosmostation = connectCosmostation;
const getCosmosOfflineSigner = async (chainId) => {
    try {
        return (await (0, cosmos_client_1.getOfflineSigner)(chainId));
    }
    catch (error) {
        throw new errors_1.TxJsError("getCosmosOfflineSigner", error);
    }
};
exports.getCosmosOfflineSigner = getCosmosOfflineSigner;
