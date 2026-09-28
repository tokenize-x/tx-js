"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const coreum_1 = require("../coreum");
const v1_1 = require("../wasm/v1");
const ft_1 = require("../coreum/extensions/ft");
const nft_1 = require("../coreum/extensions/nft");
const nftbeta_1 = require("../coreum/extensions/nftbeta");
const dex_1 = require("../coreum/extensions/dex");
const services_1 = require("../services");
const coreum_2 = require("../types/coreum");
const query_1 = require("../coreum/feemodel/v1/query");
const proto_signing_1 = require("@cosmjs/proto-signing");
const tendermint_rpc_1 = require("@cosmjs/tendermint-rpc");
const cosmos_1 = require("../cosmos");
const signing_1 = require("cosmjs-types/cosmos/tx/signing/v1beta1/signing");
const service_1 = require("cosmjs-types/cosmos/tx/v1beta1/service");
const keys_1 = require("cosmjs-types/cosmos/crypto/secp256k1/keys");
const tx_1 = require("cosmjs-types/cosmos/tx/v1beta1/tx");
const types_1 = require("../types");
const utils_1 = require("../utils");
const endpoints_1 = require("../utils/endpoints");
const errors_1 = require("../errors");
const stargate_1 = require("@cosmjs/stargate");
const encoding_1 = require("@cosmjs/encoding");
const crypto_1 = require("@cosmjs/crypto");
const extensions_1 = require("../cosmos/extensions");
const eventemitter3_1 = __importDefault(require("eventemitter3"));
const event_1 = require("../utils/event");
const extension_client_1 = require("@cosmostation/extension-client");
const cosmwasm_stargate_1 = require("@cosmjs/cosmwasm-stargate");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const MAX_EVENT_QUERY_LENGTH = 512;
function isSigningClient(object) {
    return (typeof object === "object" &&
        object !== null &&
        "signAndBroadcast" in object);
}
class Client {
    get config() {
        return this._config;
    }
    get queryClients() {
        return this._queryClient;
    }
    constructor(props) {
        this._eventSequence = 0;
        const networkKey = (props?.network ?? "mainnet");
        const baseConfig = coreum_2.COREUM_CONFIG[networkKey];
        if (!baseConfig) {
            throw new Error(`Invalid network "${props?.network}". Expected one of: mainnet, testnet, devnet`);
        }
        if (props?.custom_node_endpoint && !props.network) {
            throw new Error("If using a custom node, please specify the type of network.");
        }
        this._endpointOptions = {
            allowInsecure: props?.allowInsecureEndpoints ?? false,
        };
        this._config = Object.freeze({ ...baseConfig });
        this._txMemo = props?.tx_memo;
        this._customNodeEndpoint = props?.custom_node_endpoint
            ? (0, endpoints_1.validateRpcEndpoint)(props.custom_node_endpoint, this._endpointOptions)
            : undefined;
        this._customWsEndpoint = props?.custom_ws_endpoint
            ? (0, endpoints_1.validateWsEndpoint)(props.custom_ws_endpoint, this._endpointOptions)
            : undefined;
    }
    disconnect() {
        if (this._client) {
            this._client.disconnect();
            this._client = undefined;
        }
        if (this._tmClient) {
            this._tmClient.disconnect();
            this._tmClient = undefined;
        }
        if (this._wsClient) {
            this._wsClient.disconnect();
            this._wsClient = undefined;
        }
        this._address = undefined;
        this._queryClient = undefined;
        this._eventSequence = 0;
        this._feeModel = undefined;
    }
    get address() {
        return this._address;
    }
    get stargate() {
        return this._client;
    }
    async addCustomSigner(offlineSigner) {
        try {
            const accounts = await offlineSigner.getAccounts();
            if (accounts.length === 0) {
                throw new Error("Offline signer returned no accounts");
            }
            (0, utils_1.assertValidCoreumAddress)(accounts[0].address, this._config.chain_bech32_prefix);
            if (!this._tmClient) {
                await this._initTendermintClient(this._getRpcEndpoint());
                this._initQueryClient();
                this._initFeeModel();
            }
            await this._createClient(offlineSigner);
        }
        catch (error) {
            throw (0, errors_1.toTxJsError)("addCustomSigner", error);
        }
    }
    async connect(options) {
        await this._initTendermintClient(this._getRpcEndpoint());
        await this._createClient();
        this._initQueryClient();
        this._initFeeModel();
        if (options?.withWS) {
            await this._initWsClient(this._getWsEndpoint());
        }
    }
    async connectWithExtension(extension = types_1.ExtensionWallets.KEPLR, options) {
        try {
            const walletConfig = this._getWalletConfig();
            let offlineSigner;
            switch (extension) {
                case types_1.ExtensionWallets.COSMOSTATION:
                    offlineSigner = await this._getCosmostationSigner(walletConfig);
                    break;
                case types_1.ExtensionWallets.LEAP:
                    offlineSigner = await this._getLeapSigner(walletConfig);
                    break;
                default:
                    offlineSigner = await this._getKeplrSigner(walletConfig);
            }
            await this._initTendermintClient(this._getRpcEndpoint());
            await this._createClient(offlineSigner);
            this._initQueryClient();
            this._initFeeModel();
            if (options?.withWS) {
                await this._initWsClient(this._getWsEndpoint());
            }
        }
        catch (error) {
            throw (0, errors_1.normalizeWalletError)("connectWithExtension", error);
        }
    }
    async connectWithMnemonic(mnemonic, options) {
        try {
            const offlineSigner = await (0, utils_1.generateWalletFromMnemonic)(mnemonic, this._config.chain_bech32_prefix);
            await this._initTendermintClient(this._getRpcEndpoint());
            this._initQueryClient();
            this._initFeeModel();
            await this._createClient(offlineSigner);
            if (options?.withWS) {
                await this._initWsClient(this._getWsEndpoint());
            }
        }
        catch (error) {
            throw (0, errors_1.toTxJsError)("connectWithMnemonic", error);
        }
    }
    async getTxFee(msgs) {
        this._isSigningClientInit();
        this._assertConnectedAddress();
        const signer = this._client;
        const gasPrice = await this._getGasPrice();
        const gasWanted = await signer.simulate(this._address, msgs, "");
        const totalGasWanted = new bignumber_js_1.default(gasWanted)
            .multipliedBy(1.2)
            .integerValue()
            .toNumber();
        return {
            gas_wanted: totalGasWanted,
            fee: (0, stargate_1.calculateFee)(totalGasWanted, gasPrice),
        };
    }
    async calculateGas(msgs, options) {
        if (!this._queryClient) {
            throw new Error("Query client not initialized. Call connect() first.");
        }
        const { fromAddress, gasAdjustment = 1.2 } = options || {};
        if (fromAddress) {
            (0, utils_1.assertValidCoreumAddress)(fromAddress, this._config.chain_bech32_prefix);
        }
        let simAddress;
        if (fromAddress) {
            simAddress = fromAddress;
        }
        else {
            const dummyHash = (0, crypto_1.sha256)(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
            const addressBytes = dummyHash.slice(0, 20);
            simAddress = (0, encoding_1.toBech32)(this._config.chain_bech32_prefix, addressBytes);
        }
        let accountNumber = 0;
        let sequence = 0;
        if (fromAddress && this._client) {
            try {
                const account = await this._client.getAccount(fromAddress);
                if (account) {
                    accountNumber = account.accountNumber;
                    sequence = account.sequence;
                }
            }
            catch {
                // If account doesn't exist, use defaults (0, 0)
            }
        }
        const txBytes = await this._buildTxForSimulation(msgs, simAddress, accountNumber, sequence);
        const rpcClient = (0, stargate_1.createProtobufRpcClient)(this._queryClient);
        const txService = new service_1.ServiceClientImpl(rpcClient);
        const simulateResponse = await txService.Simulate({
            txBytes: txBytes,
        });
        if (!simulateResponse.gasInfo) {
            throw new Error("Simulation failed: no gas info returned");
        }
        const gasUsed = Number(simulateResponse.gasInfo.gasUsed || 0);
        return Math.ceil(gasUsed * gasAdjustment);
    }
    async getGasPrice() {
        return this._getGasPrice();
    }
    async broadcastTx(transaction, options) {
        try {
            if (!this._client) {
                throw new Error("Client is not connected");
            }
            return await this._client.broadcastTx(transaction, options?.timeoutMs, options?.pollIntervalMs);
        }
        catch (error) {
            throw (0, errors_1.toTxJsError)("broadcastTx", error);
        }
    }
    async sendTx(msgs, memo) {
        try {
            this._isSigningClientInit();
            this._assertConnectedAddress();
            const { fee } = await this.getTxFee(msgs);
            return await this._client.signAndBroadcast(this._address, msgs, fee, this._formatMemo(memo));
        }
        catch (error) {
            throw (0, errors_1.toTxJsError)("sendTx", error);
        }
    }
    async signTx(msgs, memo = "", customSequence) {
        try {
            this._isSigningClientInit();
            this._assertConnectedAddress();
            const signingClient = this._client;
            const account = await signingClient.getAccount(this._address);
            if (!account) {
                throw new Error(`Account not found for address ${this._address}`);
            }
            const { accountNumber, sequence } = account;
            const { fee } = await this.getTxFee(msgs);
            return signingClient.sign(this._address, msgs, fee, this._formatMemo(memo), {
                accountNumber,
                sequence: customSequence ?? sequence,
                chainId: this._config.chain_id,
            });
        }
        catch (error) {
            throw (0, errors_1.toTxJsError)("signTx", error);
        }
    }
    async subscribeToEvent(event) {
        try {
            if (!event || event.length > MAX_EVENT_QUERY_LENGTH) {
                throw new Error("Invalid event query");
            }
            if (this._wsClient === undefined) {
                throw new Error("No Websocket client initialized");
            }
            const emitter = new eventemitter3_1.default();
            const stream = this._wsClient.listen({
                jsonrpc: "2.0",
                method: "subscribe",
                id: this._eventSequence,
                params: { query: event },
            });
            const listener = {
                next: (x) => {
                    emitter.emit(event, {
                        data: x.data,
                        events: x.events ? (0, event_1.parseSubscriptionEvents)(x.events) : x,
                    });
                },
                error: (err) => {
                    emitter.emit("subscription-error", err);
                },
                complete: () => {
                    emitter.emit("subscription-complete", { event });
                },
            };
            const subscription = stream.subscribe(listener);
            this._eventSequence++;
            return {
                events: emitter,
                unsubscribe: subscription.unsubscribe,
            };
        }
        catch (error) {
            throw (0, errors_1.toTxJsError)("subscribeToEvent", error);
        }
    }
    async createMultisigAccount(addresses, threshold = 2) {
        try {
            if (addresses.length < 2) {
                throw new Error("addresses param must be at least of length: 2");
            }
            if (!this._client) {
                throw new Error("Client is not connected");
            }
            const pubkeys = [];
            for (const address of addresses) {
                (0, utils_1.assertValidCoreumAddress)(address, this._config.chain_bech32_prefix);
                const account = await this._client.getAccount(address);
                if (!account?.pubkey) {
                    throw new Error(`${address} has no pubkey on chain, this address will need to send a transaction to appear on chain.`);
                }
                pubkeys.push(account.pubkey.value);
            }
            return (0, utils_1.generateMultisigFromPubkeys)(pubkeys, threshold, this._config.chain_bech32_prefix);
        }
        catch (error) {
            throw (0, errors_1.toTxJsError)("createMultisigAccount", error);
        }
    }
    static getRegistry() {
        const registryTypes = [
            ...stargate_1.defaultRegistryTypes,
            ...coreum_1.coreumRegistry,
            ...v1_1.cosmwasmRegistry,
        ];
        return new proto_signing_1.Registry(registryTypes);
    }
    _formatMemo(memo) {
        if (this._txMemo) {
            return memo ? `${this._txMemo} - ${memo}` : this._txMemo;
        }
        return memo || "";
    }
    _getRpcEndpoint() {
        return this._customNodeEndpoint ?? this._config.chain_rpc_endpoint;
    }
    _getWsEndpoint() {
        return this._customWsEndpoint ?? this._config.chain_ws_endpoint;
    }
    _getWalletConfig() {
        return Object.freeze({
            ...this._config,
            chain_rpc_endpoint: this._getRpcEndpoint(),
            chain_ws_endpoint: this._getWsEndpoint(),
        });
    }
    _assertConnectedAddress() {
        if (!this._address) {
            throw new Error("No connected wallet address");
        }
        if (!(0, utils_1.isValidCoreumAddress)(this._address, this._config.chain_bech32_prefix)) {
            throw new Error(`Invalid connected address: ${this._address}`);
        }
    }
    async _getGasPrice() {
        const gasPriceMultiplier = 1.1;
        const feemodelParams = await this._feeModel.Params({});
        const minGasPriceRes = await this._feeModel.MinGasPrice({});
        const minGasPrice = (0, stargate_1.decodeCosmosSdkDecFromProto)(minGasPriceRes.minGasPrice?.amount || "");
        let gasPrice = minGasPrice.toFloatApproximation() * gasPriceMultiplier;
        const initialGasPrice = (0, stargate_1.decodeCosmosSdkDecFromProto)(feemodelParams.params?.model?.initialGasPrice || "").toFloatApproximation();
        if (gasPrice > initialGasPrice) {
            gasPrice = initialGasPrice;
        }
        return stargate_1.GasPrice.fromString(`${gasPrice}${minGasPriceRes.minGasPrice?.denom || ""}`);
    }
    async _buildTxForSimulation(msgs, fromAddress, accountNumber = 0, sequence = 0) {
        if (!this._queryClient) {
            throw new Error("Query client not initialized. Call connect() first.");
        }
        const registry = Client.getRegistry();
        const dummyPubKeyBytes = new Uint8Array(33).fill(0);
        dummyPubKeyBytes[0] = 0x02;
        const dummyPubKey = {
            key: dummyPubKeyBytes,
        };
        const pubkeyHash = (0, crypto_1.sha256)(dummyPubKeyBytes);
        const addressBytes = (0, crypto_1.ripemd160)(pubkeyHash).slice(0, 20);
        const derivedAddress = (0, encoding_1.toBech32)(this._config.chain_bech32_prefix, addressBytes);
        const finalAddress = fromAddress || derivedAddress;
        const signerInfo = {
            publicKey: {
                typeUrl: "/cosmos.crypto.secp256k1.PubKey",
                value: keys_1.PubKey.encode(dummyPubKey).finish(),
            },
            modeInfo: {
                single: {
                    mode: signing_1.SignMode.SIGN_MODE_DIRECT,
                },
            },
            sequence: BigInt(sequence),
        };
        const fee = {
            amount: [],
            gasLimit: BigInt(0),
            payer: "",
            granter: "",
        };
        const authInfo = {
            signerInfos: [signerInfo],
            fee: fee,
        };
        const body = {
            messages: msgs.map((msg) => {
                const encoded = registry.encode(msg);
                return {
                    typeUrl: msg.typeUrl,
                    value: encoded,
                };
            }),
            memo: "",
            timeoutHeight: BigInt(0),
            extensionOptions: [],
            nonCriticalExtensionOptions: [],
        };
        const bodyBytes = tx_1.TxBody.encode(body).finish();
        const authInfoBytes = tx_1.AuthInfo.encode(authInfo).finish();
        const dummySignature = new Uint8Array(64).fill(0);
        const txRaw = {
            bodyBytes: bodyBytes,
            authInfoBytes: authInfoBytes,
            signatures: [dummySignature],
        };
        return cosmos_1.TxRaw.encode(txRaw).finish();
    }
    _isSigningClientInit() {
        if (!this._client || !isSigningClient(this._client)) {
            throw new Error("Signing Client is not initialized");
        }
    }
    async _initTendermintClient(rpcEndpoint) {
        this._tmClient = await tendermint_rpc_1.Tendermint37Client.connect(rpcEndpoint);
    }
    _initQueryClient() {
        this._queryClient = stargate_1.QueryClient.withExtensions(this._tmClient, ft_1.setupFTExtension, nft_1.setupNFTExtension, nftbeta_1.setupNFTBetaExtension, stargate_1.setupStakingExtension, extensions_1.setupBankExtension, extensions_1.setupDistributionExtension, stargate_1.setupTxExtension, stargate_1.setupAuthExtension, stargate_1.setupMintExtension, stargate_1.setupFeegrantExtension, extensions_1.setupGovExtension, stargate_1.setupIbcExtension, cosmwasm_stargate_1.setupWasmExtension, dex_1.setupDexExtension);
    }
    _initFeeModel() {
        const rpcClient = (0, stargate_1.createProtobufRpcClient)(this._queryClient);
        this._feeModel = new query_1.QueryClientImpl(rpcClient);
    }
    async _initWsClient(wsEndpoint) {
        this._wsClient = new tendermint_rpc_1.WebsocketClient(wsEndpoint);
        await this.subscribeToEvent("tm.event='NewBlock'");
    }
    async _createClient(offlineSigner) {
        const registry = Client.getRegistry();
        const clientOptions = {
            registry,
            gasPrice: stargate_1.GasPrice.fromString(this._config.gas_price),
        };
        if (!offlineSigner) {
            if (!this._tmClient) {
                throw new Error("Tendermint client is not initialized");
            }
            this._client = await stargate_1.StargateClient.create(this._tmClient);
            return;
        }
        const [{ address }] = await offlineSigner.getAccounts();
        this._address = address;
        if (this._tmClient) {
            this._client = await cosmwasm_stargate_1.SigningCosmWasmClient.createWithSigner(this._tmClient, offlineSigner, clientOptions);
        }
        else {
            this._client = await cosmwasm_stargate_1.SigningCosmWasmClient.connectWithSigner(this._getRpcEndpoint(), offlineSigner, clientOptions);
        }
        const clientWithAmino = this._client;
        // CosmJS exposes aminoTypes as a private field; merge Coreum converters at runtime.
        clientWithAmino.aminoTypes.register = {
            ...clientWithAmino.aminoTypes.register,
            ...coreum_1.coreumAminoConverters,
        };
    }
    async _getKeplrSigner(walletConfig) {
        await (0, services_1.connectKeplr)(walletConfig);
        return (0, services_1.getKeplrOfflineSigner)(walletConfig.chain_id);
    }
    async _getCosmostationSigner(walletConfig) {
        await (0, services_1.connectCosmostation)(walletConfig);
        const provider = await (0, extension_client_1.cosmos)();
        await provider.requestAccount(walletConfig.chain_name);
        return (0, services_1.getCosmosOfflineSigner)(walletConfig.chain_id);
    }
    async _getLeapSigner(walletConfig) {
        await (0, services_1.connectLeap)(walletConfig);
        return (0, services_1.getLeapOfflineSigner)(walletConfig.chain_id);
    }
}
exports.Client = Client;
