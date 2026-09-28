import { cosmos } from "@cosmostation/extension-client";
import { getOfflineSigner } from "@cosmostation/cosmos-client";
import { TxJsError } from "../errors";
export const connectCosmostation = async (config) => {
    try {
        const provider = await cosmos();
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
            throw new TxJsError("connectCosmostation", "Extension not installed.", 4000);
        }
        throw new TxJsError("connectCosmostation", error);
    }
};
export const getCosmosOfflineSigner = async (chainId) => {
    try {
        return (await getOfflineSigner(chainId));
    }
    catch (error) {
        throw new TxJsError("getCosmosOfflineSigner", error);
    }
};
