import { MarketAsset, SwapOptions, TransactionType } from './hiveTrade.types';

export const convertSwapOptionsToLimitOrder = (data: SwapOptions) => {
  let amountToSell = 0;
  let minToReceive = 0;
  let transactionType = TransactionType.None;

  switch (data.fromAsset) {
    case MarketAsset.HIVE:
      amountToSell = data.fromAmount;
      minToReceive = data.toAmount;
      transactionType = TransactionType.Sell;
      break;
    case MarketAsset.HBD:
      amountToSell = data.fromAmount;
      minToReceive = data.toAmount;
      transactionType = TransactionType.Buy;
      break;
  }

  return {
    amountToSell,
    minToReceive,
    transactionType,
  };
};
