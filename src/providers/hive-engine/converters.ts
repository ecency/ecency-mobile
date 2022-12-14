
import { EngineMetric, HiveEngineToken, MarketData, Token, TokenBalance, TokenMetadata, TokenStatus } from './hiveEngine.types';

export const convertEngineToken = (balanceObj: TokenBalance, token?: Token, metrics?: EngineMetric, tokenStatus?:TokenStatus) => {
  if (!balanceObj) {
    return null;
  }
  const tokenMetadata = token && (JSON.parse(token.metadata) as TokenMetadata);

  const stake = parseFloat(balanceObj.stake) || 0;
  const delegationsIn = parseFloat(balanceObj.delegationsIn) || 0;
  const delegationsOut = parseFloat(balanceObj.delegationsOut) || 0;
  const balance = parseFloat(balanceObj.balance) || 0;

  const tokenPrice = metrics ? parseFloat(metrics.lastPrice) : 0;
  const percentChange = metrics ? parseFloat(metrics.priceChangePercent) : 0;

  const unclaimedBalance = tokenStatus ? `${tokenStatus.pendingRewards} ${tokenStatus.symbol}` : '';

  return {
    symbol: balanceObj.symbol,
    name: token?.name || '',
    icon: tokenMetadata?.icon || '',
    precision: token?.precision || 0,
    stakingEnabled: token?.stakingEnabled || false,
    delegationEnabled: token?.delegationEnabled || false,
    stakedBalance: stake + delegationsIn - delegationsOut,
    unclaimedBalance,
    balance,
    stake,
    delegationsIn,
    delegationsOut,
    tokenPrice,
    percentChange,
  } as HiveEngineToken;
};


export const convertRewardsStatus = (rawData: any) => {

  return {
    symbol:rawData.symbol,
    pendingToken:rawData.pending_token,
    precision:rawData.precision,
    pendingRewards: rawData.pending_token / Math.pow(10, rawData.precision)
  } as TokenStatus
}


export const convertMarketData = (rawData: any) => {

  return {
    quoteVolume:rawData.quoteVolume,
    baseVolume:rawData.baseVolume,
    low:rawData.low,
    close:rawData.close,
    high:rawData.high,
    open:rawData.open,
    timestamp:rawData.timestamp,
  } as MarketData
}
