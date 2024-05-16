import { useEffect, useRef, useState } from 'react';
import { MarketAsset, OrdersDataItem } from '../../../providers/hive-trade/hiveTrade.types';
import { stripDecimalPlaces } from '../../../utils/number';
import { fetchHiveOrderBook, processHiveOrderBook } from './swapCalculatorHelpers';

export const useSwapCalculator = (
  asset: MarketAsset,
  fromAmount: number,
  onAssetChangeComplete: () => void,
) => {
  const [buyOrderBook, setBuyOrderBook] = useState<OrdersDataItem[]>([]);
  const [sellOrderBook, setSellOrderBook] = useState<OrdersDataItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [toAmount, setToAmount] = useState(0);
  const [tooMuchSlippage, setTooMuchSlippage] = useState(false);
  const [offerUnavailable, setOfferUnavailable] = useState(false);

  const assetRef = useRef(asset);

  let updateInterval: any;

  useEffect(() => {
    fetchOrderBook();
    updateInterval = setInterval(() => fetchOrderBook(), 60000);
    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  useEffect(() => {
    fetchOrderBook().then(() => {
      if (assetRef.current !== asset) {
        assetRef.current = asset;
        onAssetChangeComplete();
      }
    });
  }, [asset]);

  useEffect(() => {
    processOrderBook();
  }, [fromAmount]);

  const processOrderBook = () => {
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
  };

  const fetchOrderBook = async () => {
    setIsLoading(true);
    try {
      const book = await fetchHiveOrderBook();
      if (book) {
        setBuyOrderBook(book.bids);
        setSellOrderBook(book.asks);
      }
      processOrderBook();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    toAmount,
    offerUnavailable,
    tooMuchSlippage,
    isLoading,
  };
};
