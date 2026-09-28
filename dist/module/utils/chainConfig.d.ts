import { CoreumNetworkConfig } from "../types/coreum";
export declare function buildKeplrChainSuggestion(config: CoreumNetworkConfig): {
    chainId: import("../types/coreum").CoreumChainID;
    chainName: string;
    rpc: string;
    rest: string;
    stakeCurrency: {
        coinDenom: string;
        coinMinimalDenom: import("../types/coreum").CoreumDenom;
        coinDecimals: number;
    };
    bip44: {
        coinType: number;
    };
    bech32Config: {
        bech32PrefixAccAddr: import("../types/coreum").CoreumPrefixes;
        bech32PrefixAccPub: string;
        bech32PrefixValAddr: string;
        bech32PrefixValPub: string;
        bech32PrefixConsAddr: string;
        bech32PrefixConsPub: string;
    };
    currencies: {
        coinDenom: string;
        coinMinimalDenom: import("../types/coreum").CoreumDenom;
        coinDecimals: number;
    }[];
    feeCurrencies: {
        coinDenom: string;
        coinMinimalDenom: import("../types/coreum").CoreumDenom;
        coinDecimals: number;
    }[];
    coinType: number;
    gasPriceStep: {
        low: number;
        average: number;
        high: number;
    };
};
