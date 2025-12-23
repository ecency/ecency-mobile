import { transferToken, transferPoint } from '../providers/hive/dhive';
import { transferHiveEngine } from '../providers/hive-engine/hiveEngineActions';
import { stripDecimalPlaces } from '../utils/number';

export interface TipParams {
  currency: string;
  amount: string;
  recipient: string;
  author: string;
  permlink: string;
  currentAccount: any;
  pinCode: string;
  precision?: number; // Optional precision for Engine tokens
}

/**
 * Get decimal precision for a currency
 */
export const getCurrencyPrecision = (currency: string, customPrecision?: number): number => {
  // If custom precision provided, use it
  if (customPrecision !== undefined) {
    return customPrecision;
  }

  switch (currency) {
    case 'HIVE':
    case 'HBD':
    case 'POINTS':
      return 3;
    default:
      // Engine tokens typically use 8 decimals, but check token metadata if available
      return 8;
  }
};

/**
 * Format amount with correct precision for the currency
 */
export const formatTipAmount = (
  amount: string,
  currency: string,
  customPrecision?: number,
): string => {
  const numAmount = parseFloat(amount);
  if (Number.isNaN(numAmount)) {
    return '0.000';
  }

  const precision = getCurrencyPrecision(currency, customPrecision);
  const formatted = stripDecimalPlaces(numAmount, precision);
  return formatted.toFixed(precision);
};

/**
 * Send a tip to a post author
 * Routes to the appropriate transfer method based on currency type
 */
export const sendTip = async (params: TipParams) => {
  const { currency, amount, recipient, author, permlink, currentAccount, pinCode, precision } =
    params;

  // Format amount with correct precision
  const formattedAmount = formatTipAmount(amount, currency, precision);

  // Format memo with post reference
  const memo = `Tip for @${author}/${permlink}`;

  // Route to appropriate transfer method based on currency
  if (currency === 'POINTS') {
    // Ecency Points transfer
    // Format: "0.002 POINTS"
    return transferPoint(currentAccount, pinCode, {
      from: currentAccount.username,
      destination: recipient,
      amount: `${formattedAmount} POINTS`,
      memo,
    });
  }

  if (currency === 'HIVE' || currency === 'HBD') {
    // Hive/HBD blockchain transfer
    // Format: "0.002 HIVE" or "0.002 HBD"
    return transferToken(currentAccount, pinCode, {
      from: currentAccount.username,
      destination: recipient,
      amount: `${formattedAmount} ${currency}`,
      memo,
    });
  }

  // Engine tokens (any other currency)
  // Format: "0.00000002 SYMBOL" (parseToken expects space + symbol)
  return transferHiveEngine(currentAccount, pinCode, {
    destination: recipient,
    amount: `${formattedAmount} ${currency}`,
    fundType: currency, // Token symbol
    memo,
  });
};
