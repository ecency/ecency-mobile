import bugsnagInstance from '../../config/bugsnag';
import coingeckoApi from '../../config/coingeckoApi';
import { convertMarketData } from './converters';
import { MarketData } from './models';

const PATH_COINS = 'coins';
const PATH_MARKET_CHART = 'market_chart';

export enum ChartInterval {
  // HOURLY = 'hourly', NOTE: hourly is unuseable for public access now.
  DAILY = 'daily',
}

export const fetchMarketChart = async (
  coingeckoId: string,
  vs_currency: string,
  days: number,
  interval = ChartInterval.DAILY,
): Promise<MarketData> => {
  try {
    const params = {
      vs_currency,
      days,
      interval,
    };

    /** 
     * NOTE: skipping this failsafe since for now we can only use 'daily' interval
    // failsafe for accidental invalid parameters
    // ref: https://www.coingecko.com/en/api/documentation
    // endpoint: /coins/{id}/market_chart
    if (days > 90 && interval === ChartInterval.HOURLY) {
      interval = ChartInterval.DAILY;
    }
    */

    const res = await coingeckoApi.get(`/${PATH_COINS}/${coingeckoId}/${PATH_MARKET_CHART}`, {
      params,
    });
    const rawData = res.data;
    if (!rawData) {
      throw new Error('Tag name not available');
    }

    const data = convertMarketData(rawData);

    return data;
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};
