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

  // Single-point datasets render at exactly baseWidth — the (length - 1)
  // formula doubles the width when length === 1 (and divides by zero with no
  // guard). For longer datasets the small extra pad keeps the last point
  // visible inside the viewport.
  const _chartWidth = data.length <= 1 ? baseWidth : baseWidth + baseWidth / (data.length - 1);
  const _chartBackgroundColor = EStyleSheet.value('$primaryLightBackground');
  const _resolvedLabels = labels && labels.length === data.length ? labels : data.map(() => '');

  // Compact Y labels so the pinned axis gutter fits values up to billions
  // without truncation. Mirrors Intl `compact` notation but pins to 2 decimals
  // (e.g. 92345.72 -> "92.35k", 1034567 -> "1.03M").
  const _formatYLabel = (raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return raw;
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';
    if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`;
    if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(2)}k`;
    return `${sign}${abs.toFixed(2)}`;
  };
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
      formatYLabel={_formatYLabel}
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
