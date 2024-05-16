import { ChartItem, MarketData } from './models';

export const convertChartItem = (rawData: any) => {
  if (!rawData) {
    return null;
  }
  return {
    xValue: rawData[0],
    yValue: rawData[1],
  } as ChartItem;
};

export const convertMarketData = (rawData: any) => {
  return {
    prices: rawData.prices ? rawData.prices.map(convertChartItem) : [],
    marketCaps: rawData.market_caps ? rawData.market_caps.map(convertChartItem) : [],
    totalVolumes: rawData.total_volumes ? rawData.total_volumes.map(convertChartItem) : [],
  } as MarketData;
};
