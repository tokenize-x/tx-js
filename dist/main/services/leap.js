"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeapOfflineSigner = exports.connectLeap = void 0;
const chainConfig_1 = require("../utils/chainConfig");
const errors_1 = require("../errors");
function getLeapWindow() {
    if (typeof window === "undefined") {
        throw new errors_1.TxJsError("connectLeap", "Wallet extensions are only available in browser environments");
    }
    return window;
}
const connectLeap = async (config) => {
    try {
        const browserWindow = getLeapWindow();
        if (!browserWindow.leap) {
            throw new errors_1.TxJsError("connectLeap", "Extension not installed.", 4000);
        }
        if (browserWindow.leap.experimentalSuggestChain) {
            try {
                await browserWindow.leap.experimentalSuggestChain((0, chainConfig_1.buildKeplrChainSuggestion)(config));
            }
            catch {
                throw new errors_1.TxJsError("connectLeap", "Failed to suggest the chain");
            }
        }
        await browserWindow.leap.enable(config.chain_id);
    }
    catch (error) {
        if (error instanceof errors_1.TxJsError) {
            throw error;
        }
        throw new errors_1.TxJsError("connectLeap", error);
    }
};
exports.connectLeap = connectLeap;
const getLeapOfflineSigner = async (chainId) => {
    const browserWindow = getLeapWindow();
    if (!browserWindow.leap) {
        throw new errors_1.TxJsError("getLeapOfflineSigner", "Extension not installed.", 4000);
    }
    await browserWindow.leap.enable(chainId);
    return browserWindow.leap.getOfflineSignerAuto(chainId);
};
exports.getLeapOfflineSigner = getLeapOfflineSigner;
