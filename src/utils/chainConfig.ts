import { CoreumNetworkConfig } from "../types/coreum";

export function buildKeplrChainSuggestion(config: CoreumNetworkConfig) {
  const stakingDenom = "core";
  const gasPrice = Number(
    (config.gas_price || "").replace(config.staking_denom || "", "")
  );

  return {
    chainId: config.chain_id,
    chainName: config.chain_name,
    rpc: config.chain_rpc_endpoint,
    rest: config.chain_rest_endpoint,
    stakeCurrency: {
      coinDenom: stakingDenom,
      coinMinimalDenom: config.staking_denom,
      coinDecimals: 6,
    },
    bip44: {
      coinType: Number(config.coin_type),
    },
    bech32Config: {
      bech32PrefixAccAddr: config.chain_bech32_prefix,
      bech32PrefixAccPub: `${config.chain_bech32_prefix}pub`,
      bech32PrefixValAddr: `${config.chain_bech32_prefix}valoper`,
      bech32PrefixValPub: `${config.chain_bech32_prefix}valoperpub`,
      bech32PrefixConsAddr: `${config.chain_bech32_prefix}valcons`,
      bech32PrefixConsPub: `${config.chain_bech32_prefix}valconspub`,
    },
    currencies: [
      {
        coinDenom: stakingDenom,
        coinMinimalDenom: config.staking_denom,
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: stakingDenom,
        coinMinimalDenom: config.staking_denom,
        coinDecimals: 6,
      },
    ],
    coinType: Number(config.coin_type),
    gasPriceStep: {
      low: gasPrice,
      average: gasPrice,
      high: gasPrice,
    },
  };
}
