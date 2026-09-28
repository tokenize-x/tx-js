import { CoreumNetworkConfig } from "../types/coreum";
import { OfflineSigner } from "@cosmjs/proto-signing";
export declare const connectLeap: (config: CoreumNetworkConfig) => Promise<void>;
export declare const getLeapOfflineSigner: (chainId: string) => Promise<OfflineSigner>;
