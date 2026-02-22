import { stripDecimalPlaces } from '../utils/number';

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
