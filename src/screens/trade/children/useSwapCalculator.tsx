import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrderBookQueryOptions } from '@ecency/sdk';
import { MarketAsset, OrdersDataItem } from '../../../providers/hive-trade/hiveTrade.types';
import { stripDecimalPlaces } from '../../../utils/number';
import { processHiveOrderBook } from './swapCalculatorHelpers';

export const useSwapCalculator = (
  asset: MarketAsset,
  fromAmount: number,
  onAssetChangeComplete: () => void,
) => {
  const [buyOrderBook, setBuyOrderBook] = useState<OrdersDataItem[]>([]);
  const [sellOrderBook, setSellOrderBook] = useState<OrdersDataItem[]>([]);

  const [toAmount, setToAmount] = useState(0);
  const [tooMuchSlippage, setTooMuchSlippage] = useState(false);
  const [offerUnavailable, setOfferUnavailable] = useState(false);

  const assetRef = useRef(asset);

  // Use SDK query options for order book with 60s refetch interval
  const orderBookQuery = useQuery({
    ...getOrderBookQueryOptions(),
    refetchInterval: 60000,
  });

  // Update order book state when query data changes
  useEffect(() => {
    if (orderBookQuery.data) {
      setBuyOrderBook(orderBookQuery.data.bids);
      setSellOrderBook(orderBookQuery.data.asks);
    }
  }, [orderBookQuery.data]);

  // Handle asset changes
  useEffect(() => {
    if (orderBookQuery.data && assetRef.current !== asset) {
      assetRef.current = asset;
      onAssetChangeComplete();
    }
  }, [asset, orderBookQuery.data, onAssetChangeComplete]);

  // Process order book when fromAmount or order book data changes
  useEffect(() => {
    if (buyOrderBook.length > 0 && sellOrderBook.length > 0) {
      const {
        tooMuchSlippage: _tooMuchSlippage,
        invalidAmount: _invalidAmount,
        toAmount: _toAmount,
      } = processHiveOrderBook(buyOrderBook, sellOrderBook, fromAmount, asset);
      setTooMuchSlippage(!!_tooMuchSlippage);
      setOfferUnavailable(!!_invalidAmount);
      if (_toAmount) {
        setToAmount(stripDecimalPlaces(_toAmount));
      }
    }
  }, [fromAmount, buyOrderBook, sellOrderBook, asset]);

  return {
    toAmount,
    offerUnavailable,
    tooMuchSlippage,
    isLoading: orderBookQuery.isLoading || orderBookQuery.isFetching,
  };
};
