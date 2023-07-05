import { MarketAsset } from "../../market-pair";
import { getOrderBook, OrdersDataItem } from "../../../../api/hive";
import React, { useEffect, useState } from "react";
import { error } from "../../../feedback";

export namespace HiveMarket {
  interface ProcessingResult {
    tooMuchSlippage?: boolean;
    invalidAmount?: boolean;
    toAmount?: string;
    emptyOrderBook?: boolean;
  }

  function calculatePrice(intAmount: number, book: OrdersDataItem[], asset: "hive" | "hbd") {
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
      error("Order book is empty.");
    }
    return null;
  }

  export function processHiveOrderBook(
    buyOrderBook: OrdersDataItem[],
    sellOrderBook: OrdersDataItem[],
    amount: string,
    asset: string
  ): ProcessingResult {
    if (buyOrderBook.length <= 0 || sellOrderBook.length <= 0) return { emptyOrderBook: true };

    const intAmount = +amount.replace(/,/gm, "");

    let tooMuchSlippage,
      invalidAmount = false;
    let availableInOrderBook,
      price = 0;
    let firstPrice = Infinity;
    let toAmount = "";
    let resultToAmount;

    if (asset === MarketAsset.HIVE) {
      availableInOrderBook =
        buyOrderBook.map((item) => item.hive).reduce((acc, item) => acc + item, 0) / 1000;
      price = calculatePrice(intAmount, buyOrderBook, "hive");
      toAmount = intAmount * price + "";
      firstPrice = +buyOrderBook[0].real_price;
    } else if (asset === MarketAsset.HBD) {
      availableInOrderBook =
        sellOrderBook.map((item) => item.hbd).reduce((acc, item) => acc + item, 0) / 1000;
      price = calculatePrice(intAmount, sellOrderBook, "hbd");
      toAmount = intAmount / price + "";
      firstPrice = +sellOrderBook[0].real_price;
    }

    if (!availableInOrderBook) return { emptyOrderBook: true };

    const slippage = Math.abs(price - firstPrice);
    tooMuchSlippage = slippage > 0.01;

    if (intAmount > availableInOrderBook) {
      invalidAmount = true;
    } else if (toAmount) {
      resultToAmount = toAmount;
      invalidAmount = false;
    }
    return { toAmount: resultToAmount, tooMuchSlippage, invalidAmount };
  }

  export async function getNewAmount(toAmount: string, fromAmount: string, asset: MarketAsset) {
    const book = await HiveMarket.fetchHiveOrderBook();
    const { toAmount: newToAmount } = HiveMarket.processHiveOrderBook(
      book?.bids ?? [],
      book?.asks ?? [],
      fromAmount,
      asset
    );
    if (newToAmount) {
      return newToAmount;
    }
    return toAmount;
  }
}

interface Props {
  asset: MarketAsset;
  amount: string;
  setToAmount: (amount: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setInvalidAmount: (v: boolean) => void;
  setTooMuchSlippage: (v: boolean) => void;
}

export const HiveMarketRateListener = ({
  asset,
  amount,
  setToAmount,
  setLoading,
  setInvalidAmount,
  setTooMuchSlippage
}: Props) => {
  const [buyOrderBook, setBuyOrderBook] = useState<OrdersDataItem[]>([]);
  const [sellOrderBook, setSellOrderBook] = useState<OrdersDataItem[]>([]);

  let updateInterval: any;

  useEffect(() => {
    fetchOrderBook();
    updateInterval = setInterval(() => fetchOrderBook(), 60000);
    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  useEffect(() => {
    fetchOrderBook();
  }, [asset]);

  useEffect(() => {
    processOrderBook();
  }, [amount]);

  const processOrderBook = () => {
    const { tooMuchSlippage, invalidAmount, toAmount } = HiveMarket.processHiveOrderBook(
      buyOrderBook,
      sellOrderBook,
      amount,
      asset
    );
    setTooMuchSlippage(!!tooMuchSlippage);
    setInvalidAmount(!!invalidAmount);
    if (toAmount) {
      setToAmount(toAmount);
    }
  };

  const fetchOrderBook = async () => {
    setLoading(true);
    try {
      const book = await HiveMarket.fetchHiveOrderBook();
      if (book) {
        setBuyOrderBook(book.bids);
        setSellOrderBook(book.asks);
      }
      processOrderBook();
    } finally {
      setLoading(false);
    }
  };

  return <></>;
};
