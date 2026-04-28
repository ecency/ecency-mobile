import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import EStyleSheet from 'react-native-extended-stylesheet';

interface CoinChartProps {
  data: number[];
  baseWidth: number;
  chartHeight: number;
  showLine: boolean;
  showLabels?: boolean;
  // Optional X-axis labels (one per data point). Pass empty strings for points
  // that should render no label so chart-kit doesn't crowd the axis.
  labels?: string[];
  // When true, render X-axis (vertical) labels using `labels`.
  showXLabels?: boolean;
  // When true, suppresses the data line/area so the chart can act as a
  // pinned Y-axis frame next to a scrolling sibling chart.
  transparentLine?: boolean;
}

export const SimpleChart = ({
  data,
  baseWidth,
  chartHeight,
  showLine,
  showLabels = false,
  labels,
  showXLabels = false,
  transparentLine = false,
}: CoinChartProps) => {
  if (!data || !data.length) {
    return null;
  }

  // Guard against single-point datasets — `data.length - 1` would be 0 and
  // produce Infinity, breaking layout.
  const _chartWidth = baseWidth + baseWidth / Math.max(1, data.length - 1);
  const _chartBackgroundColor = EStyleSheet.value('$primaryLightBackground');
  const _resolvedLabels = labels && labels.length === data.length ? labels : data.map(() => '');
  return (
    <LineChart
      data={{
        labels: _resolvedLabels,
        datasets: [
          {
            data,
          },
        ],
      }}
      width={_chartWidth} // from react-native
      height={chartHeight}
      withHorizontalLabels={showLabels}
      withVerticalLabels={showXLabels}
      withHorizontalLines={false}
      withDots={false}
      withInnerLines={false}
      chartConfig={{
        backgroundColor: _chartBackgroundColor,
        backgroundGradientFrom: _chartBackgroundColor,
        backgroundGradientTo: _chartBackgroundColor,
        fillShadowGradient: transparentLine
          ? _chartBackgroundColor
          : EStyleSheet.value('$chartBlue'),
        fillShadowGradientOpacity: transparentLine ? 0 : 0.8,
        fillShadowGradientTo: _chartBackgroundColor,
        labelColor: () => EStyleSheet.value('$primaryDarkText'),
        color: () =>
          transparentLine || !showLine ? 'transparent' : EStyleSheet.value('$chartBlue'),
      }}
    />
  );
};
