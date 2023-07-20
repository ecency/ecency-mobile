import { MarketAsset, SwapOptions, TransactionType } from './hiveTrade.types';

export const convertSwapOptionsToLimitOrder = (data: SwapOptions) => {
  let amountToSell = 0;
  let minToRecieve = 0;
  let transactionType = TransactionType.None;

  switch (data.fromAsset) {
    case MarketAsset.HIVE:
      amountToSell = data.toAmount;
      minToRecieve = data.fromAmount;
      transactionType = TransactionType.Sell;
      break;
    case MarketAsset.HBD:
      amountToSell = data.fromAmount;
      minToRecieve = data.toAmount;
      transactionType = TransactionType.Buy;
      break;
  }

  return {
    amountToSell,
    minToRecieve,
    transactionType,
  };
};
