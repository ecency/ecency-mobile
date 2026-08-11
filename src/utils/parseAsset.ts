import { parseAsset as sdkParseAsset, Symbol as AssetSymbol } from '@ecency/sdk';

export interface Asset {
  amount: number;
  symbol: AssetSymbol | '';
}

/**
 * Thin wrapper over the SDK's parseAsset that tolerates a missing value.
 *
 * The SDK version assumes anything non-string is an SMTAsset and reads `sval.amount`, so it throws
 * on undefined. postParser calls this on `max_accepted_payout` and the payout fields, which the
 * search API omits, so the guard below is load-bearing: it cannot be dropped in favour of
 * re-exporting the SDK function directly.
 *
 * This previously indexed the *global* `Symbol` constructor, so `symbol` was undefined for every
 * input. Callers only ever read `.amount`, which is why it went unnoticed.
 */
const parseAsset = (strVal: string): Asset => {
  if (typeof strVal !== 'string') {
    return {
      amount: 0,
      symbol: '',
    };
  }

  const { amount, symbol } = sdkParseAsset(strVal);

  // Hive Engine tickers are not in the SDK's Symbol enum, so they parse to undefined.
  return {
    amount,
    symbol: symbol ?? '',
  };
};

export default parseAsset;
