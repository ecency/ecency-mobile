import { Alert } from 'react-native';
import bugsnapInstance from '../../../config/bugsnag';
import { MarketAsset, OrdersDataItem } from '../../../providers/hive-trade/hiveTrade.types';
import { getOrderBook } from '../../../providers/hive/dhive';

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

  let invalidAmount = false;
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
  const tooMuchSlippage = slippage > 0.01;

  if (fromAmount > availableInOrderBook) {
    invalidAmount = true;
  } else if (toAmount) {
    resultToAmount = toAmount;
    invalidAmount = false;
  }
  return { toAmount: resultToAmount, tooMuchSlippage, invalidAmount };
}

export async function getNewAmount(toAmount: string, fromAmount: number, asset: MarketAsset) {
  const book = await fetchHiveOrderBook();
  const { toAmount: newToAmount } = processHiveOrderBook(
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
