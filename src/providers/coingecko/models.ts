export interface ChartItem {
  xValue: number;
  yValue: number;
}

export interface MarketData {
  prices: Array<ChartItem>;
  marketCaps: Array<ChartItem>;
  totalVolumes: Array<ChartItem>;
}
