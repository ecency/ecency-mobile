import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { MarketAsset, OrdersDataItem } from '../../../providers/hive-trade/hiveTrade.types';
import bugsnapInstance from '../../../config/bugsnag';
import { getOrderBook } from '../../../providers/hive/dhive';
import { stripDecimalPlaces } from '../../../utils/number';

export namespace HiveMarket {
  interface ProcessingResult {
    tooMuchSlippage?: boolean;
    invalidAmount?: boolean;
    toAmount?: number;
    emptyOrderBook?: boolean;
  }

  function calculatePrice(intAmount: number, book: OrdersDataItem[], asset: 'hive' | 'hbd') {
    let available = book[0][asset] / 1000;
    let index = 0;
    while (available < intAmount && book.length > index + 1) {
      available += book[index][asset] / 1000;
      index++;
    }
    return +book[index].real_price;
  }

  export async function fetchHiveOrderBook() {
    try {
      return await getOrderBook();
    } catch (e) {
      bugsnapInstance.notify(e);
      Alert.alert('Order book is empty');
    }
    return null;
  }

  export function processHiveOrderBook(
    buyOrderBook: OrdersDataItem[],
    sellOrderBook: OrdersDataItem[],
    fromAmount: number,
    asset: string,
  ): ProcessingResult {
    if (buyOrderBook.length <= 0 || sellOrderBook.length <= 0) return { emptyOrderBook: true };

    let tooMuchSlippage,
      invalidAmount = false;
    let availableInOrderBook,
      price = 0;
    let firstPrice = Infinity;
    let toAmount = 0;
    let resultToAmount;

    if (asset === MarketAsset.HIVE) {
      availableInOrderBook =
        buyOrderBook.map((item) => item.hive).reduce((acc, item) => acc + item, 0) / 1000;
      price = calculatePrice(fromAmount, buyOrderBook, 'hive');
      toAmount = fromAmount * price;
      firstPrice = +buyOrderBook[0].real_price;
    } else if (asset === MarketAsset.HBD) {
      availableInOrderBook =
        sellOrderBook.map((item) => item.hbd).reduce((acc, item) => acc + item, 0) / 1000;
      price = calculatePrice(fromAmount, sellOrderBook, 'hbd');
      toAmount = fromAmount / price;
      firstPrice = +sellOrderBook[0].real_price;
    }

    if (!availableInOrderBook) return { emptyOrderBook: true };

    const slippage = Math.abs(price - firstPrice);
    tooMuchSlippage = slippage > 0.01;

    if (fromAmount > availableInOrderBook) {
      invalidAmount = true;
    } else if (toAmount) {
      resultToAmount = toAmount;
      invalidAmount = false;
    }
    return { toAmount: resultToAmount, tooMuchSlippage, invalidAmount };
  }

  export async function getNewAmount(toAmount: string, fromAmount: number, asset: MarketAsset) {
    const book = await HiveMarket.fetchHiveOrderBook();
    const { toAmount: newToAmount } = HiveMarket.processHiveOrderBook(
      book?.bids ?? [],
      book?.asks ?? [],
      fromAmount,
      asset,
    );
    if (newToAmount) {
      return newToAmount;
    }
    return toAmount;
  }
}

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
    } = HiveMarket.processHiveOrderBook(buyOrderBook, sellOrderBook, fromAmount, asset);
    setTooMuchSlippage(!!_tooMuchSlippage);
    setOfferUnavailable(!!_invalidAmount);
    if (_toAmount) {
      setToAmount(stripDecimalPlaces(_toAmount));
    }
  };

  const fetchOrderBook = async () => {
    setIsLoading(true);
    try {
      const book = await HiveMarket.fetchHiveOrderBook();
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
