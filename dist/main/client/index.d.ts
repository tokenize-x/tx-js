import { CoreumNetworkConfig, CoreumNetworkKey } from "../types/coreum";
import { EncodeObject, OfflineSigner, Registry } from "@cosmjs/proto-signing";
import { TxRaw } from "../cosmos";
import { ExtensionWallets, FeeCalculation, ClientQueryClient } from "../types";
import { DeliverTxResponse, GasPrice, StargateClient } from "@cosmjs/stargate";
import EventEmitter from "eventemitter3";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
interface WithExtensionOptions {
    withWS?: boolean;
}
interface WithMnemonicOptions {
    withWS?: boolean;
}
interface ClientProps {
    network?: CoreumNetworkKey | string;
    custom_ws_endpoint?: string;
    custom_node_endpoint?: string;
    tx_memo?: string;
    /** Allow http:// and ws:// endpoints (development only). */
    allowInsecureEndpoints?: boolean;
}
export declare class Client {
    private _tmClient;
    private _queryClient;
    private _wsClient;
    private _client;
    private _address;
    private _feeModel;
    private _eventSequence;
    private readonly _config;
    private readonly _customWsEndpoint?;
    private readonly _customNodeEndpoint?;
    private readonly _txMemo?;
    private readonly _endpointOptions;
    get config(): Readonly<CoreumNetworkConfig>;
    get queryClients(): ClientQueryClient | undefined;
    constructor(props?: ClientProps);
    disconnect(): void;
    get address(): string | undefined;
    get stargate(): SigningCosmWasmClient | StargateClient | undefined;
    addCustomSigner(offlineSigner: OfflineSigner): Promise<void>;
    connect(options?: {
        withWS?: boolean;
    }): Promise<void>;
    connectWithExtension(extension?: ExtensionWallets, options?: WithExtensionOptions): Promise<void>;
    connectWithMnemonic(mnemonic: string, options?: WithMnemonicOptions): Promise<void>;
    getTxFee(msgs: readonly EncodeObject[]): Promise<FeeCalculation>;
    calculateGas(msgs: readonly EncodeObject[], options?: {
        fromAddress?: string;
        gasAdjustment?: number;
    }): Promise<number>;
    getGasPrice(): Promise<GasPrice>;
    broadcastTx(transaction: Uint8Array, options?: {
        timeoutMs?: number;
        pollIntervalMs?: number;
    }): Promise<DeliverTxResponse>;
    sendTx(msgs: readonly EncodeObject[], memo?: string): Promise<DeliverTxResponse>;
    signTx(msgs: readonly EncodeObject[], memo?: string, customSequence?: number): Promise<TxRaw>;
    subscribeToEvent(event: string): Promise<{
        events: EventEmitter<string | symbol, any>;
        unsubscribe: () => void;
    }>;
    createMultisigAccount(addresses: string[], threshold?: number): Promise<import("../types").MultisigAccount>;
    static getRegistry(): Registry;
    private _formatMemo;
    private _getRpcEndpoint;
    private _getWsEndpoint;
    private _getWalletConfig;
    private _assertConnectedAddress;
    private _getGasPrice;
    private _buildTxForSimulation;
    private _isSigningClientInit;
    private _initTendermintClient;
    private _initQueryClient;
    private _initFeeModel;
    private _initWsClient;
    private _createClient;
    private _getKeplrSigner;
    private _getCosmostationSigner;
    private _getLeapSigner;
}
export {};
