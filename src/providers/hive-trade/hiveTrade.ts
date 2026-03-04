import * as Sentry from '@sentry/react-native';
import { getMarketStatistics } from '../hive/dhive';
import { MarketAsset, MarketStatistics } from './hiveTrade.types';

export const fetchHiveMarketRate = async (asset: MarketAsset): Promise<number> => {
  try {
    const market: MarketStatistics = await getMarketStatistics();
    const _lowestAsk = Number(market?.lowest_ask);

    if (!_lowestAsk) {
      throw new Error('Invalid market lowest ask');
    }

    switch (asset) {
      case MarketAsset.HIVE:
        return _lowestAsk;
      case MarketAsset.HBD:
        return 1 / _lowestAsk;
      default:
        return 0;
    }
  } catch (err) {
    console.warn('failed to get hive market rate');
    Sentry.captureException(err);
    throw err;
  }
};
