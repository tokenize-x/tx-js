"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeplrOfflineSigner = exports.connectKeplr = void 0;
const chainConfig_1 = require("../utils/chainConfig");
const errors_1 = require("../errors");
function getKeplrWindow() {
    if (typeof window === "undefined") {
        throw new errors_1.TxJsError("connectKeplr", "Wallet extensions are only available in browser environments");
    }
    return window;
}
const connectKeplr = async (config) => {
    try {
        const browserWindow = getKeplrWindow();
        if (!browserWindow.getOfflineSignerAuto || !browserWindow.keplr) {
            throw new errors_1.TxJsError("connectKeplr", "Extension not installed.", 4000);
        }
        if (!browserWindow.keplr.experimentalSuggestChain) {
            throw new errors_1.TxJsError("connectKeplr", "Please use the recent version of Keplr extension");
        }
        try {
            await browserWindow.keplr.experimentalSuggestChain((0, chainConfig_1.buildKeplrChainSuggestion)(config));
        }
        catch {
            throw new errors_1.TxJsError("connectKeplr", "Failed to suggest the chain");
        }
    }
    catch (error) {
        throw (0, errors_1.toTxJsError)("connectKeplr", error);
    }
};
exports.connectKeplr = connectKeplr;
const getKeplrOfflineSigner = async (chainId) => {
    const browserWindow = getKeplrWindow();
    if (!browserWindow.getOfflineSignerAuto) {
        throw new errors_1.TxJsError("getKeplrOfflineSigner", "Extension not installed.", 4000);
    }
    await browserWindow.keplr?.enable(chainId);
    return browserWindow.getOfflineSignerAuto(chainId);
};
exports.getKeplrOfflineSigner = getKeplrOfflineSigner;
