import { CoreumNetworkConfig } from "../types/coreum";
import { buildKeplrChainSuggestion } from "../utils/chainConfig";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { TxJsError } from "../errors";

interface LeapWindow extends Window {
  leap?: {
    enable: (chainId: string) => Promise<void>;
    experimentalSuggestChain?: (
      chainInfo: ReturnType<typeof buildKeplrChainSuggestion>
    ) => Promise<void>;
    getOfflineSignerAuto: (chainId: string) => OfflineSigner;
  };
}

function getLeapWindow(): LeapWindow {
  if (typeof window === "undefined") {
    throw new TxJsError("connectLeap", "Wallet extensions are only available in browser environments");
  }

  return window as LeapWindow;
}

export const connectLeap = async (config: CoreumNetworkConfig) => {
  try {
    const browserWindow = getLeapWindow();

    if (!browserWindow.leap) {
      throw new TxJsError("connectLeap", "Extension not installed.", 4000);
    }

    if (browserWindow.leap.experimentalSuggestChain) {
      try {
        await browserWindow.leap.experimentalSuggestChain(
          buildKeplrChainSuggestion(config)
        );
      } catch {
        throw new TxJsError("connectLeap", "Failed to suggest the chain");
      }
    }

    await browserWindow.leap.enable(config.chain_id);
  } catch (error) {
    if (error instanceof TxJsError) {
      throw error;
    }

    throw new TxJsError("connectLeap", error);
  }
};

export const getLeapOfflineSigner = async (
  chainId: string
): Promise<OfflineSigner> => {
  const browserWindow = getLeapWindow();

  if (!browserWindow.leap) {
    throw new TxJsError("getLeapOfflineSigner", "Extension not installed.", 4000);
  }

  await browserWindow.leap.enable(chainId);
  return browserWindow.leap.getOfflineSignerAuto(chainId);
};
