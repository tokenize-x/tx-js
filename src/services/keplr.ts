import { CoreumNetworkConfig } from "../types/coreum";
import { buildKeplrChainSuggestion } from "../utils/chainConfig";
import { TxJsError, toTxJsError, normalizeWalletError } from "../errors";

interface KeplrWindow extends Window {
  keplr?: {
    enable: (chainId: string) => Promise<void>;
    experimentalSuggestChain?: (chainInfo: ReturnType<typeof buildKeplrChainSuggestion>) => Promise<void>;
  };
  getOfflineSignerAuto?: (chainId: string) => Promise<import("@cosmjs/proto-signing").OfflineSigner>;
}

function getKeplrWindow(): KeplrWindow {
  if (typeof window === "undefined") {
    throw new TxJsError("connectKeplr", "Wallet extensions are only available in browser environments");
  }

  return window as KeplrWindow;
}

export const connectKeplr = async (config: CoreumNetworkConfig) => {
  try {
    const browserWindow = getKeplrWindow();

    if (!browserWindow.getOfflineSignerAuto || !browserWindow.keplr) {
      throw new TxJsError("connectKeplr", "Extension not installed.", 4000);
    }

    if (!browserWindow.keplr.experimentalSuggestChain) {
      throw new TxJsError(
        "connectKeplr",
        "Please use the recent version of Keplr extension"
      );
    }

    try {
      await browserWindow.keplr.experimentalSuggestChain(
        buildKeplrChainSuggestion(config)
      );
    } catch {
      throw new TxJsError("connectKeplr", "Failed to suggest the chain");
    }
  } catch (error) {
    throw toTxJsError("connectKeplr", error);
  }
};

export const getKeplrOfflineSigner = async (
  chainId: string
): Promise<import("@cosmjs/proto-signing").OfflineSigner> => {
  const browserWindow = getKeplrWindow();

  if (!browserWindow.getOfflineSignerAuto) {
    throw new TxJsError("getKeplrOfflineSigner", "Extension not installed.", 4000);
  }

  await browserWindow.keplr?.enable(chainId);
  return browserWindow.getOfflineSignerAuto(chainId);
};
