import {
  EngineMetric,
  HistoryItem,
  HiveEngineToken,
  MarketData,
  Token,
  TokenBalance,
  TokenMetadata,
  TokenStatus,
} from './hiveEngine.types';

export const convertEngineToken = (
  balanceObj: TokenBalance,
  token?: Token,
  metrics?: EngineMetric,
  tokenStatus?: TokenStatus,
) => {
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
  const volume24h = metrics ? parseFloat(metrics.volume) : 0;

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
    volume24h,
  } as HiveEngineToken;
};

export const convertRewardsStatus = (rawData: any) => {
  return {
    symbol: rawData.symbol,
    pendingToken: rawData.pending_token,
    precision: rawData.precision,
    pendingRewards: rawData.pending_token / (10 ** rawData.precision),
  } as TokenStatus;
};

export const convertMarketData = (rawData: any) => {
  if (!rawData) {
    return null;
  }

  return {
    quoteVolume: parseFloat(rawData.quoteVolume),
    baseVolume: parseFloat(rawData.baseVolume),
    low: parseFloat(rawData.low),
    close: parseFloat(rawData.close),
    high: parseFloat(rawData.high),
    open: parseFloat(rawData.open),
    timestamp: rawData.timestamp,
  } as MarketData;
};

export const convertEngineHistory = (rawData: any) => {
  return {
    _id: rawData._id,
    blockNumber: rawData.blockNumber,
    transactionId: rawData.transactionId,
    timestamp: rawData.timestamp * 1000,
    operation: rawData.operation,
    from: rawData.from,
    to: rawData.to,
    symbol: rawData.symbol,
    quantity: parseFloat(rawData.quantity),
    memo: rawData.memo,
    account: rawData.account,
    authorperm: rawData.authorperm,
  } as HistoryItem;
};
