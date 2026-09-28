import { CoreumNetworkConfig } from "../types/coreum";
export declare const connectKeplr: (config: CoreumNetworkConfig) => Promise<void>;
export declare const getKeplrOfflineSigner: (chainId: string) => Promise<import("@cosmjs/proto-signing").OfflineSigner>;
