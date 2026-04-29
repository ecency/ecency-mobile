import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getBalanceHistoryInfiniteQueryOptions,
  getAggregatedBalanceQueryOptions,
  getDynamicPropsQueryOptions,
  vestsToHp,
  type BalanceCoinType,
  type BalanceHistoryEntry,
} from '@ecency/sdk';
import { SimpleChart } from '../simpleChart/simpleChart';
import { SheetNames } from '../../navigation/sheets';
import { CHART_NEGATIVE_MARGIN } from '../../screens/assetDetails/children/children.styles';

type Tab = 'history' | 'summary';

type Granularity = 'yearly' | 'monthly' | 'daily';
const GRANULARITIES: Granularity[] = ['yearly', 'monthly', 'daily'];

// Short pill labels — kept separate from the tab's full title so the
// granularity selector reads as "Yearly | Monthly | Daily".
const GRANULARITY_PILL_KEY: Record<Granularity, string> = {
  yearly: 'wallet.granularity_yearly',
  monthly: 'wallet.granularity_monthly',
  daily: 'wallet.granularity_daily',
};
// Tab title — adapts to whichever granularity the user has selected so the
// header reflects the dataset currently rendered inside.
const SUMMARY_TAB_KEY: Record<Granularity, string> = {
  yearly: 'wallet.yearly_summary',
  monthly: 'wallet.monthly_summary',
  daily: 'wallet.daily_summary',
};
const CHANGE_LABEL_KEY: Record<Granularity, string> = {
  yearly: 'wallet.year_change',
  monthly: 'wallet.month_change',
  daily: 'wallet.day_change',
};
const MIN_LABEL_KEY: Record<Granularity, string> = {
  yearly: 'wallet.year_min',
  monthly: 'wallet.month_min',
  daily: 'wallet.day_min',
};
const MAX_LABEL_KEY: Record<Granularity, string> = {
  yearly: 'wallet.year_max',
  monthly: 'wallet.month_max',
  daily: 'wallet.day_max',
};

function toHumanBalance(
  raw: number,
  coinType: BalanceCoinType,
  hivePerMVests: number | undefined,
): number {
  if (coinType === 'VESTS') {
    // Caller is responsible for guarding the VESTS path until hivePerMVests
    // is loaded; fall back to 0 here so we never propagate NaN if invoked
    // accidentally.
    if (!hivePerMVests) return 0;
    return vestsToHp(raw / 1e6, hivePerMVests);
  }
  return raw / 1000;
}

const BalanceAnalyticsSheet = ({ payload }: SheetProps<SheetNames.BALANCE_ANALYTICS>) => {
  const { coinType = 'HIVE', username = '' } = payload || {};
  const intl = useIntl();
  const dim = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const [granularity, setGranularity] = useState<Granularity>('yearly');

  // Action sheets stay mounted between presentations (per CLAUDE.md
  // sheet-pattern note), so reset our local view state whenever the sheet is
  // re-opened with a new payload — otherwise the previous account/coin's tab
  // and granularity selection leak into the new view.
  useEffect(() => {
    setActiveTab('history');
    setGranularity('yearly');
  }, [payload]);

  const { data: dynamicProps, isLoading: dynamicPropsLoading } = useQuery(
    getDynamicPropsQueryOptions(),
  );
  // Leave undefined while loading so VESTS flows can show a loading state
  // instead of an empty/zero state — defaulting to 0 mid-load was rendering
  // "no activity" for HP balance/summary even when data was on the way.
  const hivePerMVests = dynamicProps?.hivePerMVests;

  // Balance history query
  const {
    data: historyData,
    isLoading: historyLoading,
    isError: historyError,
    error: historyErrorObj,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    getBalanceHistoryInfiniteQueryOptions(username, coinType as BalanceCoinType, 200),
  );

  // Aggregated query — driven by user-selected granularity (yearly/monthly/daily).
  // SDK 2.2.9+ already includes granularity in the queryKey, so distinct cache
  // entries are produced per granularity automatically.
  const {
    data: aggregatedData,
    isLoading: aggregatedLoading,
    isError: aggregatedError,
    error: aggregatedErrorObj,
  } = useQuery(
    getAggregatedBalanceQueryOptions(username, coinType as BalanceCoinType, granularity),
  );

  // SDK's typing makes `historyData` look like a single `BalanceHistoryPage`
  // here, but at runtime useInfiniteQuery wraps it in `InfiniteData<TPage>`.
  // A typed narrow keeps us off `any` while matching the actual shape.
  type BalanceHistoryInfinite = {
    pages?: Array<{ entries: BalanceHistoryEntry[]; currentPage: number }>;
  };
  const historyPages = (historyData as unknown as BalanceHistoryInfinite | undefined)?.pages;

  const { chartValues, chartLabels } = useMemo<{
    chartValues: number[];
    chartLabels: string[];
  }>(() => {
    if (!historyPages || (coinType === 'VESTS' && !hivePerMVests)) {
      return { chartValues: [], chartLabels: [] };
    }

    // SDK returns desc (newest first); flip to asc so the chart renders
    // oldest -> newest left to right, matching the web build.
    const ordered = historyPages
      .flatMap((p) => p.entries)
      .slice()
      .reverse();
    const values = ordered.map((entry) =>
      toHumanBalance(Number(entry.balance), coinType as BalanceCoinType, hivePerMVests),
    );

    // Sparse X-axis labels: ~6 evenly-spaced dates across the dataset so
    // chart-kit doesn't crowd the axis. Empty strings render as no label.
    const targetLabelCount = 6;
    const step = Math.max(1, Math.floor(ordered.length / targetLabelCount));
    // Include 2-digit year so multi-month/year ranges aren't ambiguous
    // (e.g. "Feb 18 '25" instead of just "Feb 18").
    const labels = ordered.map((entry, i) => {
      if (i % step !== 0) return '';
      const d = new Date(`${entry.timestamp}Z`);
      const monthDay = intl.formatDate(d, { month: 'short', day: '2-digit' });
      const year2 = String(d.getUTCFullYear() % 100).padStart(2, '0');
      return `${monthDay} '${year2}`;
    });

    return { chartValues: values, chartLabels: labels };
  }, [historyPages, coinType, hivePerMVests, intl]);

  const summaryData = useMemo(() => {
    if (!aggregatedData || aggregatedData.length === 0) return null;

    const latest = aggregatedData[0];
    const prev = aggregatedData[1];
    const currentBal = Number(latest.balance.balance);

    const fmt = (raw: number) => {
      const val = toHumanBalance(raw, coinType as BalanceCoinType, hivePerMVests);
      const suffix = coinType === 'VESTS' ? ' HP' : coinType === 'HBD' ? ' HBD' : ' HIVE';
      return `${intl.formatNumber(val, { maximumFractionDigits: 3 })}${suffix}`;
    };

    // Only compute year change when a prior row exists; otherwise leave change
    // fields null so the UI shows a placeholder rather than a misleading
    // "+<full balance>" delta computed from an implicit 0.
    let change: number | null = null;
    let changeFormatted: string | null = null;
    let isPositive: boolean | null = null;
    if (prev) {
      const prevBal = Number(prev.balance.balance);
      change = currentBal - prevBal;
      changeFormatted = fmt(Math.abs(change));
      isPositive = change >= 0;
    }

    return {
      current: fmt(currentBal),
      change,
      changeFormatted,
      isPositive,
      min: fmt(Number(latest.min_balance.balance)),
      max: fmt(Number(latest.max_balance.balance)),
    };
  }, [aggregatedData, coinType, hivePerMVests, intl]);

  const _onClose = () => {
    SheetManager.hide(SheetNames.BALANCE_ANALYTICS);
  };

  // Pixel width per data point — keeps the chart denser than the viewport so
  // the user can pan back through history. Mirrors how vision-next's
  // lightweight-charts setup spaces points.
  const POINT_WIDTH = 12;
  const _viewportWidth = dim.width - 32 + CHART_NEGATIVE_MARGIN;
  const _chartWidth = Math.max(_viewportWidth, chartValues.length * POINT_WIDTH);
  // Width allocated to the pinned Y-axis overlay (must match chart-kit's
  // internal label gutter so the ghost labels visually replace the
  // scroll-clipped ones from the wide chart).
  const _yAxisWidth = 80;

  // Throttle scroll-driven fetches: we only want one in-flight fetch at a time.
  const _scrollThrottleRef = useRef(false);
  // Track scroll position + previous content width so we can manually
  // preserve the user's visual position on Android when older data prepends.
  // (`maintainVisibleContentPosition` is iOS-only.)
  const _historyScrollRef = useRef<ScrollView | null>(null);
  const _scrollOffsetRef = useRef(0);
  const _prevContentWidthRef = useRef(0);
  const _onScrollHistory = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    _scrollOffsetRef.current = e.nativeEvent.contentOffset.x;
    if (!hasNextPage || isFetchingNextPage || _scrollThrottleRef.current) return;
    // Trigger when within ~200px of the leftmost edge — generous threshold so
    // the next page is already loading by the time the user reaches the edge.
    if (e.nativeEvent.contentOffset.x <= 200) {
      _scrollThrottleRef.current = true;
      fetchNextPage();
      setTimeout(() => {
        _scrollThrottleRef.current = false;
      }, 800);
    }
  };
  const _onHistoryContentSizeChange = (width: number) => {
    const _prev = _prevContentWidthRef.current;
    _prevContentWidthRef.current = width;
    // Only adjust on Android (iOS handles it via maintainVisibleContentPosition)
    // and only when content has grown (i.e., a new page prepended) — not on
    // initial layout or shrink.
    if (Platform.OS !== 'android' || _prev === 0 || width <= _prev) return;
    const delta = width - _prev;
    const newOffset = _scrollOffsetRef.current + delta;
    _scrollOffsetRef.current = newOffset;
    _historyScrollRef.current?.scrollTo({ x: newOffset, animated: false });
  };

  const _renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'history' }}
        style={[styles.tab, activeTab === 'history' && styles.tabActive]}
        onPress={() => setActiveTab('history')}
      >
        <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
          {intl.formatMessage({ id: 'wallet.balance_history' })}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'summary' }}
        style={[styles.tab, activeTab === 'summary' && styles.tabActive]}
        onPress={() => setActiveTab('summary')}
      >
        <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>
          {intl.formatMessage({ id: SUMMARY_TAB_KEY[granularity] })}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Distinct from missing: only true while the props query is in-flight.
  // If the query has resolved without producing hivePerMVests (error or empty
  // payload), we want to fall through to the empty-state UI rather than spin
  // forever.
  const _waitingForVestsConversion = coinType === 'VESTS' && dynamicPropsLoading && !hivePerMVests;
  const _missingVestsConversion = coinType === 'VESTS' && !dynamicPropsLoading && !hivePerMVests;

  const _renderHistory = () => {
    if (historyLoading || _waitingForVestsConversion) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      );
    }

    if (historyError) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>
            {(historyErrorObj as Error)?.message ||
              intl.formatMessage({ id: 'alert.something_wrong' })}
          </Text>
        </View>
      );
    }

    if (chartValues.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>{intl.formatMessage({ id: 'wallet.no_activity' })}</Text>
        </View>
      );
    }

    const _chartHeight = 220;
    return (
      <View style={styles.chartWrapper}>
        <ScrollView
          ref={_historyScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={_onScrollHistory}
          onContentSizeChange={_onHistoryContentSizeChange}
          scrollEventThrottle={64}
          // Default to the right edge (newest) so the latest balance is visible
          // first; user pans left to load older history.
          contentOffset={{ x: Math.max(_chartWidth - _viewportWidth, 0), y: 0 }}
          // iOS: native preservation. Android: handled manually via
          // _onHistoryContentSizeChange, since this prop is iOS-only.
          maintainVisibleContentPosition={
            Platform.OS === 'ios' ? { minIndexForVisible: 0 } : undefined
          }
        >
          <SimpleChart
            data={chartValues}
            baseWidth={_chartWidth}
            chartHeight={_chartHeight}
            showLine={true}
            showLabels={false}
            labels={chartLabels}
            showXLabels={true}
          />
        </ScrollView>
        {/* Pinned Y-axis: a transparent-line ghost chart with the same data so
            chart-kit picks the same Y range and the labels align with the
            scrolling chart's grid. pointerEvents='none' so it doesn't block
            scroll gestures. */}
        <View style={styles.yAxisOverlay} pointerEvents="none">
          <SimpleChart
            data={chartValues}
            baseWidth={_yAxisWidth}
            chartHeight={_chartHeight}
            showLine={false}
            showLabels={true}
            transparentLine={true}
          />
        </View>
        {isFetchingNextPage && (
          <View style={styles.fetchMoreIndicator}>
            <ActivityIndicator size="small" />
          </View>
        )}
      </View>
    );
  };

  // Pills are rendered above any state branch so the user can switch
  // granularity even when the current selection is loading/empty/errored.
  const _renderGranularityPills = () => (
    <View style={styles.granularityRow}>
      {GRANULARITIES.map((g) => {
        const _active = g === granularity;
        return (
          <TouchableOpacity
            key={g}
            style={[styles.granularityPill, _active && styles.granularityPillActive]}
            onPress={() => setGranularity(g)}
            accessibilityRole="button"
            accessibilityState={{ selected: _active }}
          >
            <Text style={[styles.granularityPillText, _active && styles.granularityPillTextActive]}>
              {intl.formatMessage({ id: GRANULARITY_PILL_KEY[g] })}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const _renderSummaryBody = () => {
    if (aggregatedLoading || _waitingForVestsConversion) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      );
    }

    if (aggregatedError) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>
            {(aggregatedErrorObj as Error)?.message ||
              intl.formatMessage({ id: 'alert.something_wrong' })}
          </Text>
        </View>
      );
    }

    if (!summaryData || _missingVestsConversion) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>{intl.formatMessage({ id: 'wallet.no_activity' })}</Text>
        </View>
      );
    }

    const _hasChange = summaryData.changeFormatted !== null;
    return (
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {intl.formatMessage({ id: 'wallet.current_balance' })}
          </Text>
          <Text style={styles.summaryValue}>{summaryData.current}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {intl.formatMessage({ id: CHANGE_LABEL_KEY[granularity] })}
          </Text>
          <Text
            style={[
              styles.summaryValue,
              _hasChange && (summaryData.isPositive ? styles.textPositive : styles.textNegative),
            ]}
          >
            {_hasChange
              ? `${summaryData.isPositive ? '+' : '-'}${summaryData.changeFormatted}`
              : '—'}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {intl.formatMessage({ id: MIN_LABEL_KEY[granularity] })}
          </Text>
          <Text style={styles.summaryValue}>{summaryData.min}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            {intl.formatMessage({ id: MAX_LABEL_KEY[granularity] })}
          </Text>
          <Text style={styles.summaryValue}>{summaryData.max}</Text>
        </View>
      </View>
    );
  };

  const _renderSummary = () => (
    <View>
      {_renderGranularityPills()}
      {_renderSummaryBody()}
    </View>
  );

  // Without a username every SDK query is gated `enabled: false` and silently
  // returns nothing — show an explicit fallback so the user knows the sheet
  // isn't broken (instead of an indefinite "no activity" empty state).
  if (!username) {
    return (
      <ActionSheet
        gestureEnabled={true}
        containerStyle={styles.sheetContent}
        indicatorStyle={styles.sheetIndicator}
        defaultOverlayOpacity={0}
        onClose={_onClose}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>
            {intl.formatMessage({ id: 'alert.something_wrong' })}
          </Text>
        </View>
      </ActionSheet>
    );
  }

  return (
    <ActionSheet
      gestureEnabled={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.sheetIndicator}
      defaultOverlayOpacity={0}
      onClose={_onClose}
    >
      {_renderTabs()}
      {activeTab === 'history' ? _renderHistory() : _renderSummary()}
    </ActionSheet>
  );
};

const styles = EStyleSheet.create({
  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
    paddingBottom: 32,
    minHeight: 350,
  },
  sheetIndicator: {
    backgroundColor: '$primaryDarkGray',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '$primaryLightBackground',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: '$primaryBlue',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryDarkText',
  },
  tabTextActive: {
    color: '$white',
  },
  chartWrapper: {
    marginHorizontal: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  fetchMoreIndicator: {
    position: 'absolute',
    left: 8,
    top: 8,
  },
  yAxisOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '$primaryLightBackground',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '$primaryDarkText',
    fontSize: 14,
  },
  granularityRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  granularityPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '$primaryLightBackground',
  },
  granularityPillActive: {
    backgroundColor: '$primaryBlue',
  },
  granularityPillText: {
    color: '$primaryDarkText',
    fontSize: 12,
    fontWeight: '600',
  },
  granularityPillTextActive: {
    color: '$white',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '$primaryLightBackground',
    borderRadius: 12,
    padding: 12,
  },
  summaryLabel: {
    color: '$primaryDarkText',
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: '$primaryBlack',
    fontSize: 16,
    fontWeight: '700',
  },
  textPositive: {
    color: '$primaryGreen',
  },
  textNegative: {
    color: '$primaryRed',
  },
});

export default BalanceAnalyticsSheet;
