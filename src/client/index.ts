import {
  coreumRegistry,
  coreumAminoConverters,
} from "../coreum";
import { cosmwasmRegistry } from "../wasm/v1";
import { setupFTExtension } from "../coreum/extensions/ft";
import { setupNFTExtension } from "../coreum/extensions/nft";
import { setupNFTBetaExtension } from "../coreum/extensions/nftbeta";
import { setupDexExtension } from "../coreum/extensions/dex";
import {
  connectKeplr,
  connectCosmostation,
  getCosmosOfflineSigner,
  connectLeap,
  getLeapOfflineSigner,
  getKeplrOfflineSigner,
} from "../services";
import {
  COREUM_CONFIG,
  CoreumNetworkConfig,
  CoreumNetworkKey,
} from "../types/coreum";
import { QueryClientImpl as FeeModelClient } from "../coreum/feemodel/v1/query";
import {
  EncodeObject,
  GeneratedType,
  OfflineSigner,
  Registry,
} from "@cosmjs/proto-signing";
import { Tendermint37Client, WebsocketClient } from "@cosmjs/tendermint-rpc";
import { TxRaw, AuthInfo, SignerInfo, Fee, TxBody } from "../cosmos";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { ServiceClientImpl as TxServiceClient } from "cosmjs-types/cosmos/tx/v1beta1/service";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import {
  TxBody as TxBodyProto,
  AuthInfo as AuthInfoProto,
} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { ExtensionWallets, FeeCalculation, ClientQueryClient } from "../types";
import {
  assertValidCoreumAddress,
  generateWalletFromMnemonic,
  generateMultisigFromPubkeys,
  isValidCoreumAddress,
} from "../utils";
import { validateRpcEndpoint, validateWsEndpoint } from "../utils/endpoints";
import { TxJsError, toTxJsError, normalizeWalletError } from "../errors";
import {
  DeliverTxResponse,
  GasPrice,
  QueryClient,
  StargateClient,
  calculateFee,
  createProtobufRpcClient,
  decodeCosmosSdkDecFromProto,
  defaultRegistryTypes,
  setupAuthExtension,
  setupFeegrantExtension,
  setupIbcExtension,
  setupMintExtension,
  setupStakingExtension,
  setupTxExtension,
} from "@cosmjs/stargate";
import { toBech32 } from "@cosmjs/encoding";
import { sha256, ripemd160 } from "@cosmjs/crypto";
import {
  setupBankExtension,
  setupGovExtension,
  setupDistributionExtension,
} from "../cosmos/extensions";
import EventEmitter from "eventemitter3";
import { parseSubscriptionEvents } from "../utils/event";
import { cosmos } from "@cosmostation/extension-client";
import {
  SigningCosmWasmClient,
  setupWasmExtension,
} from "@cosmjs/cosmwasm-stargate";
import BigNumber from "bignumber.js";

const MAX_EVENT_QUERY_LENGTH = 512;

function isSigningClient(object: unknown): object is SigningCosmWasmClient {
  return (
    typeof object === "object" &&
    object !== null &&
    "signAndBroadcast" in object
  );
}

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

export class Client {
  private _tmClient: Tendermint37Client | undefined;
  private _queryClient: ClientQueryClient | undefined;
  private _wsClient: WebsocketClient | undefined;
  private _client: SigningCosmWasmClient | StargateClient | undefined;
  private _address: string | undefined;
  private _feeModel: FeeModelClient | undefined;
  private _eventSequence = 0;
  private readonly _config: Readonly<CoreumNetworkConfig>;
  private readonly _customWsEndpoint?: string;
  private readonly _customNodeEndpoint?: string;
  private readonly _txMemo?: string;
  private readonly _endpointOptions: { allowInsecure?: boolean };

  get config(): Readonly<CoreumNetworkConfig> {
    return this._config;
  }

  get queryClients() {
    return this._queryClient;
  }

  constructor(props?: ClientProps) {
    const networkKey = (props?.network ?? "mainnet") as CoreumNetworkKey;
    const baseConfig = COREUM_CONFIG[networkKey];

    if (!baseConfig) {
      throw new Error(
        `Invalid network "${props?.network}". Expected one of: mainnet, testnet, devnet`
      );
    }

    if (props?.custom_node_endpoint && !props.network) {
      throw new Error(
        "If using a custom node, please specify the type of network."
      );
    }

    this._endpointOptions = {
      allowInsecure: props?.allowInsecureEndpoints ?? false,
    };

    this._config = Object.freeze({ ...baseConfig });
    this._txMemo = props?.tx_memo;
    this._customNodeEndpoint = props?.custom_node_endpoint
      ? validateRpcEndpoint(props.custom_node_endpoint, this._endpointOptions)
      : undefined;
    this._customWsEndpoint = props?.custom_ws_endpoint
      ? validateWsEndpoint(props.custom_ws_endpoint, this._endpointOptions)
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

  get address(): string | undefined {
    return this._address;
  }

  get stargate(): SigningCosmWasmClient | StargateClient | undefined {
    return this._client;
  }

  async addCustomSigner(offlineSigner: OfflineSigner) {
    try {
      const accounts = await offlineSigner.getAccounts();

      if (accounts.length === 0) {
        throw new Error("Offline signer returned no accounts");
      }

      assertValidCoreumAddress(
        accounts[0].address,
        this._config.chain_bech32_prefix
      );

      if (!this._tmClient) {
        await this._initTendermintClient(this._getRpcEndpoint());
        this._initQueryClient();
        this._initFeeModel();
      }

      await this._createClient(offlineSigner);
    } catch (error) {
      throw toTxJsError("addCustomSigner", error);
    }
  }

  async connect(options?: { withWS?: boolean }) {
    await this._initTendermintClient(this._getRpcEndpoint());
    await this._createClient();
    this._initQueryClient();
    this._initFeeModel();

    if (options?.withWS) {
      await this._initWsClient(this._getWsEndpoint());
    }
  }

  async connectWithExtension(
    extension = ExtensionWallets.KEPLR,
    options?: WithExtensionOptions
  ) {
    try {
      const walletConfig = this._getWalletConfig();
      let offlineSigner: OfflineSigner;

      switch (extension) {
        case ExtensionWallets.COSMOSTATION:
          offlineSigner = await this._getCosmostationSigner(walletConfig);
          break;
        case ExtensionWallets.LEAP:
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
    } catch (error) {
      throw normalizeWalletError("connectWithExtension", error);
    }
  }

  async connectWithMnemonic(
    mnemonic: string,
    options?: WithMnemonicOptions
  ) {
    try {
      const offlineSigner = await generateWalletFromMnemonic(
        mnemonic,
        this._config.chain_bech32_prefix
      );

      await this._initTendermintClient(this._getRpcEndpoint());
      this._initQueryClient();
      this._initFeeModel();
      await this._createClient(offlineSigner);

      if (options?.withWS) {
        await this._initWsClient(this._getWsEndpoint());
      }
    } catch (error) {
      throw toTxJsError("connectWithMnemonic", error);
    }
  }

  async getTxFee(msgs: readonly EncodeObject[]): Promise<FeeCalculation> {
    this._isSigningClientInit();
    this._assertConnectedAddress();

    const signer = this._client as SigningCosmWasmClient;
    const gasPrice = await this._getGasPrice();
    const gasWanted = await signer.simulate(this._address!, msgs, "");
    const totalGasWanted = new BigNumber(gasWanted)
      .multipliedBy(1.2)
      .integerValue()
      .toNumber();

    return {
      gas_wanted: totalGasWanted,
      fee: calculateFee(totalGasWanted, gasPrice),
    };
  }

  async calculateGas(
    msgs: readonly EncodeObject[],
    options?: {
      fromAddress?: string;
      gasAdjustment?: number;
    }
  ): Promise<number> {
    if (!this._queryClient) {
      throw new Error("Query client not initialized. Call connect() first.");
    }

    const { fromAddress, gasAdjustment = 1.2 } = options || {};

    if (fromAddress) {
      assertValidCoreumAddress(fromAddress, this._config.chain_bech32_prefix);
    }

    let simAddress: string;
    if (fromAddress) {
      simAddress = fromAddress;
    } else {
      const dummyHash = sha256(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
      const addressBytes = dummyHash.slice(0, 20);
      simAddress = toBech32(this._config.chain_bech32_prefix, addressBytes);
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
      } catch {
        // If account doesn't exist, use defaults (0, 0)
      }
    }

    const txBytes = await this._buildTxForSimulation(
      msgs,
      simAddress,
      accountNumber,
      sequence
    );

    const rpcClient = createProtobufRpcClient(this._queryClient);
    const txService = new TxServiceClient(rpcClient);

    const simulateResponse = await txService.Simulate({
      txBytes: txBytes,
    });

    if (!simulateResponse.gasInfo) {
      throw new Error("Simulation failed: no gas info returned");
    }

    const gasUsed = Number(simulateResponse.gasInfo.gasUsed || 0);
    return Math.ceil(gasUsed * gasAdjustment);
  }

  async getGasPrice(): Promise<GasPrice> {
    return this._getGasPrice();
  }

  async broadcastTx(
    transaction: Uint8Array,
    options?: { timeoutMs?: number; pollIntervalMs?: number }
  ) {
    try {
      if (!this._client) {
        throw new Error("Client is not connected");
      }

      return await this._client.broadcastTx(
        transaction,
        options?.timeoutMs,
        options?.pollIntervalMs
      );
    } catch (error) {
      throw toTxJsError("broadcastTx", error);
    }
  }

  async sendTx(
    msgs: readonly EncodeObject[],
    memo?: string
  ): Promise<DeliverTxResponse> {
    try {
      this._isSigningClientInit();
      this._assertConnectedAddress();

      const { fee } = await this.getTxFee(msgs);

      return await (this._client as SigningCosmWasmClient).signAndBroadcast(
        this._address!,
        msgs,
        fee,
        this._formatMemo(memo)
      );
    } catch (error) {
      throw toTxJsError("sendTx", error);
    }
  }

  async signTx(
    msgs: readonly EncodeObject[],
    memo = "",
    customSequence?: number
  ): Promise<TxRaw> {
    try {
      this._isSigningClientInit();
      this._assertConnectedAddress();

      const signingClient = this._client as SigningCosmWasmClient;
      const account = await signingClient.getAccount(this._address!);

      if (!account) {
        throw new Error(`Account not found for address ${this._address}`);
      }

      const { accountNumber, sequence } = account;
      const { fee } = await this.getTxFee(msgs);

      return signingClient.sign(
        this._address!,
        msgs,
        fee,
        this._formatMemo(memo),
        {
          accountNumber,
          sequence: customSequence ?? sequence,
          chainId: this._config.chain_id,
        }
      );
    } catch (error) {
      throw toTxJsError("signTx", error);
    }
  }

  async subscribeToEvent(event: string) {
    try {
      if (!event || event.length > MAX_EVENT_QUERY_LENGTH) {
        throw new Error("Invalid event query");
      }

      if (this._wsClient === undefined) {
        throw new Error("No Websocket client initialized");
      }

      const emitter = new EventEmitter();

      const stream = this._wsClient.listen({
        jsonrpc: "2.0",
        method: "subscribe",
        id: this._eventSequence,
        params: { query: event },
      });

      const listener = {
        next: (x: { data?: unknown; events?: Record<string, string[]> }) => {
          emitter.emit(event, {
            data: x.data,
            events: x.events ? parseSubscriptionEvents(x.events) : x,
          });
        },
        error: (err: unknown) => {
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
    } catch (error) {
      throw toTxJsError("subscribeToEvent", error);
    }
  }

  async createMultisigAccount(addresses: string[], threshold = 2) {
    try {
      if (addresses.length < 2) {
        throw new Error("addresses param must be at least of length: 2");
      }

      if (!this._client) {
        throw new Error("Client is not connected");
      }

      const pubkeys: string[] = [];

      for (const address of addresses) {
        assertValidCoreumAddress(address, this._config.chain_bech32_prefix);
        const account = await this._client.getAccount(address);

        if (!account?.pubkey) {
          throw new Error(
            `${address} has no pubkey on chain, this address will need to send a transaction to appear on chain.`
          );
        }

        pubkeys.push(account.pubkey.value);
      }

      return generateMultisigFromPubkeys(
        pubkeys,
        threshold,
        this._config.chain_bech32_prefix
      );
    } catch (error) {
      throw toTxJsError("createMultisigAccount", error);
    }
  }

  static getRegistry() {
    const registryTypes: ReadonlyArray<[string, GeneratedType]> = [
      ...defaultRegistryTypes,
      ...coreumRegistry,
      ...cosmwasmRegistry,
    ];
    return new Registry(registryTypes);
  }

  private _formatMemo(memo?: string): string {
    if (this._txMemo) {
      return memo ? `${this._txMemo} - ${memo}` : this._txMemo;
    }

    return memo || "";
  }

  private _getRpcEndpoint(): string {
    return this._customNodeEndpoint ?? this._config.chain_rpc_endpoint;
  }

  private _getWsEndpoint(): string {
    return this._customWsEndpoint ?? this._config.chain_ws_endpoint;
  }

  private _getWalletConfig(): Readonly<CoreumNetworkConfig> {
    return Object.freeze({
      ...this._config,
      chain_rpc_endpoint: this._getRpcEndpoint(),
      chain_ws_endpoint: this._getWsEndpoint(),
    });
  }

  private _assertConnectedAddress(): void {
    if (!this._address) {
      throw new Error("No connected wallet address");
    }

    if (!isValidCoreumAddress(this._address, this._config.chain_bech32_prefix)) {
      throw new Error(`Invalid connected address: ${this._address}`);
    }
  }

  private async _getGasPrice() {
    const gasPriceMultiplier = 1.1;
    const feemodelParams = await this._feeModel!.Params({});
    const minGasPriceRes = await this._feeModel!.MinGasPrice({});
    const minGasPrice = decodeCosmosSdkDecFromProto(
      minGasPriceRes.minGasPrice?.amount || ""
    );
    let gasPrice = minGasPrice.toFloatApproximation() * gasPriceMultiplier;

    const initialGasPrice = decodeCosmosSdkDecFromProto(
      feemodelParams.params?.model?.initialGasPrice || ""
    ).toFloatApproximation();

    if (gasPrice > initialGasPrice) {
      gasPrice = initialGasPrice;
    }

    return GasPrice.fromString(
      `${gasPrice}${minGasPriceRes.minGasPrice?.denom || ""}`
    );
  }

  private async _buildTxForSimulation(
    msgs: readonly EncodeObject[],
    fromAddress: string,
    accountNumber = 0,
    sequence = 0
  ): Promise<Uint8Array> {
    if (!this._queryClient) {
      throw new Error("Query client not initialized. Call connect() first.");
    }

    const registry = Client.getRegistry();
    const dummyPubKeyBytes = new Uint8Array(33).fill(0);
    dummyPubKeyBytes[0] = 0x02;

    const dummyPubKey: PubKey = {
      key: dummyPubKeyBytes,
    };

    const pubkeyHash = sha256(dummyPubKeyBytes);
    const addressBytes = ripemd160(pubkeyHash).slice(0, 20);
    const derivedAddress = toBech32(
      this._config.chain_bech32_prefix,
      addressBytes
    );
    const finalAddress = fromAddress || derivedAddress;

    const signerInfo: SignerInfo = {
      publicKey: {
        typeUrl: "/cosmos.crypto.secp256k1.PubKey",
        value: PubKey.encode(dummyPubKey).finish(),
      },
      modeInfo: {
        single: {
          mode: SignMode.SIGN_MODE_DIRECT,
        },
      },
      sequence: BigInt(sequence),
    };

    const fee: Fee = {
      amount: [],
      gasLimit: BigInt(0),
      payer: "",
      granter: "",
    };

    const authInfo: AuthInfoProto = {
      signerInfos: [signerInfo],
      fee: fee,
    };

    const body: TxBodyProto = {
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

    const bodyBytes = TxBodyProto.encode(body).finish();
    const authInfoBytes = AuthInfoProto.encode(authInfo).finish();
    const dummySignature = new Uint8Array(64).fill(0);

    const txRaw: TxRaw = {
      bodyBytes: bodyBytes,
      authInfoBytes: authInfoBytes,
      signatures: [dummySignature],
    };

    return TxRaw.encode(txRaw).finish();
  }

  private _isSigningClientInit() {
    if (!this._client || !isSigningClient(this._client)) {
      throw new Error("Signing Client is not initialized");
    }
  }

  private async _initTendermintClient(rpcEndpoint: string) {
    this._tmClient = await Tendermint37Client.connect(rpcEndpoint);
  }

  private _initQueryClient() {
    this._queryClient = QueryClient.withExtensions(
      this._tmClient!,
      setupFTExtension,
      setupNFTExtension,
      setupNFTBetaExtension,
      setupStakingExtension,
      setupBankExtension,
      setupDistributionExtension,
      setupTxExtension,
      setupAuthExtension,
      setupMintExtension,
      setupFeegrantExtension,
      setupGovExtension,
      setupIbcExtension,
      setupWasmExtension,
      setupDexExtension
    );
  }

  private _initFeeModel() {
    const rpcClient = createProtobufRpcClient(this._queryClient!);
    this._feeModel = new FeeModelClient(rpcClient);
  }

  private async _initWsClient(wsEndpoint: string) {
    this._wsClient = new WebsocketClient(wsEndpoint);
    await this.subscribeToEvent("tm.event='NewBlock'");
  }

  private async _createClient(offlineSigner?: OfflineSigner) {
    const registry = Client.getRegistry();
    const clientOptions = {
      registry,
      gasPrice: GasPrice.fromString(this._config.gas_price),
    };

    if (!offlineSigner) {
      if (!this._tmClient) {
        throw new Error("Tendermint client is not initialized");
      }

      this._client = await StargateClient.create(this._tmClient);
      return;
    }

    const [{ address }] = await offlineSigner.getAccounts();
    this._address = address;

    if (this._tmClient) {
      this._client = await SigningCosmWasmClient.createWithSigner(
        this._tmClient,
        offlineSigner,
        clientOptions
      );
    } else {
      this._client = await SigningCosmWasmClient.connectWithSigner(
        this._getRpcEndpoint(),
        offlineSigner,
        clientOptions
      );
    }

    const clientWithAmino = this._client as SigningCosmWasmClient & {
      aminoTypes: { register: Record<string, unknown> };
    };

    // CosmJS exposes aminoTypes as a private field; merge Coreum converters at runtime.
    (clientWithAmino as unknown as { aminoTypes: { register: Record<string, unknown> } }).aminoTypes.register = {
      ...(clientWithAmino as unknown as { aminoTypes: { register: Record<string, unknown> } }).aminoTypes.register,
      ...coreumAminoConverters,
    };
  }

  private async _getKeplrSigner(
    walletConfig: Readonly<CoreumNetworkConfig>
  ): Promise<OfflineSigner> {
    await connectKeplr(walletConfig);
    return getKeplrOfflineSigner(walletConfig.chain_id);
  }

  private async _getCosmostationSigner(
    walletConfig: Readonly<CoreumNetworkConfig>
  ): Promise<OfflineSigner> {
    await connectCosmostation(walletConfig);
    const provider = await cosmos();
    await provider.requestAccount(walletConfig.chain_name);
    return getCosmosOfflineSigner(walletConfig.chain_id);
  }

  private async _getLeapSigner(
    walletConfig: Readonly<CoreumNetworkConfig>
  ): Promise<OfflineSigner> {
    await connectLeap(walletConfig);
    return getLeapOfflineSigner(walletConfig.chain_id);
  }
}
