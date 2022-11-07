import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import EStyleSheet from 'react-native-extended-stylesheet';

interface CoinChartProps {
  data: number[];
  baseWidth: number;
  chartHeight: number;
  showLine: boolean;
  showLabels?: boolean;
}

export const SimpleChart = ({
  data,
  baseWidth,
  chartHeight,
  showLine,
  showLabels = false,
}: CoinChartProps) => {
  if (!data || !data.length) {
    return null;
  }

  const _chartWidth = baseWidth + baseWidth / (data.length - 1);
  const _chartBackgroundColor = EStyleSheet.value('$primaryLightBackground');
  return (
    <LineChart
      data={{
        labels: [],
        datasets: [
          {
            data,
          },
        ],
      }}
      width={_chartWidth} // from react-native
      height={chartHeight}
      withHorizontalLabels={showLabels}
      withVerticalLabels={false}
      withHorizontalLines={false}
      withDots={false}
      withInnerLines={false}
      chartConfig={{
        backgroundColor: _chartBackgroundColor,
        backgroundGradientFrom: _chartBackgroundColor,
        backgroundGradientTo: _chartBackgroundColor,
        fillShadowGradient: EStyleSheet.value('$chartBlue'),
        fillShadowGradientOpacity: 0.8,
        labelColor: () => EStyleSheet.value('$primaryDarkText'),
        color: () => (showLine ? EStyleSheet.value('$chartBlue') : 'transparent'),
      }}
    />
  );
};
