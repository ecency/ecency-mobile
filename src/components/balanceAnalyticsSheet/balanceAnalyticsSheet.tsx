import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, ActivityIndicator } from 'react-native';
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

function toHumanBalance(raw: number, coinType: BalanceCoinType, hivePerMVests: number): number {
  if (coinType === 'VESTS') {
    return vestsToHp(raw / 1e6, hivePerMVests);
  }
  return raw / 1000;
}

const BalanceAnalyticsSheet = ({ payload }: SheetProps<SheetNames.BALANCE_ANALYTICS>) => {
  const { coinType = 'HIVE', username = '' } = payload || {};
  const intl = useIntl();
  const dim = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<Tab>('history');

  const { data: dynamicProps } = useQuery(getDynamicPropsQueryOptions());
  const hivePerMVests = dynamicProps?.hivePerMVests ?? 0;

  // Balance history query
  const { data: historyData, isLoading: historyLoading } = useInfiniteQuery(
    getBalanceHistoryInfiniteQueryOptions(username, coinType as BalanceCoinType, 200),
  );

  // Aggregated query
  const { data: aggregatedData, isLoading: aggregatedLoading } = useQuery(
    getAggregatedBalanceQueryOptions(username, coinType as BalanceCoinType),
  );

  const historyPages = historyData?.pages as
    | Array<{ entries: BalanceHistoryEntry[]; currentPage: number }>
    | undefined;

  const chartValues = useMemo(() => {
    if (!historyPages || (coinType === 'VESTS' && !hivePerMVests)) return [];

    return historyPages
      .flatMap((p) => p.entries)
      .map((entry: BalanceHistoryEntry) =>
        toHumanBalance(Number(entry.balance), coinType as BalanceCoinType, hivePerMVests),
      )
      .reverse(); // desc -> asc for chart (oldest first)
  }, [historyPages, coinType, hivePerMVests]);

  const summaryData = useMemo(() => {
    if (!aggregatedData || aggregatedData.length === 0) return null;

    const latest = aggregatedData[0];
    const prev = aggregatedData[1];
    const currentBal = Number(latest.balance.balance);
    const prevBal = prev ? Number(prev.balance.balance) : 0;
    const changeBal = currentBal - prevBal;

    const fmt = (raw: number) => {
      const val = toHumanBalance(raw, coinType as BalanceCoinType, hivePerMVests);
      const suffix = coinType === 'VESTS' ? ' HP' : coinType === 'HBD' ? ' HBD' : ' HIVE';
      return `${intl.formatNumber(val, { maximumFractionDigits: 3 })}${suffix}`;
    };

    return {
      current: fmt(currentBal),
      change: changeBal,
      changeFormatted: fmt(Math.abs(changeBal)),
      isPositive: changeBal >= 0,
      min: fmt(Number(latest.min_balance.balance)),
      max: fmt(Number(latest.max_balance.balance)),
    };
  }, [aggregatedData, coinType, hivePerMVests, intl]);

  const _onClose = () => {
    SheetManager.hide(SheetNames.BALANCE_ANALYTICS);
  };

  const _chartWidth = dim.width - 32 + CHART_NEGATIVE_MARGIN;

  const _renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'history' && styles.tabActive]}
        onPress={() => setActiveTab('history')}
      >
        <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
          {intl.formatMessage({ id: 'wallet.balance_history' })}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'summary' && styles.tabActive]}
        onPress={() => setActiveTab('summary')}
      >
        <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>
          {intl.formatMessage({ id: 'wallet.yearly_summary' })}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const _renderHistory = () => {
    if (historyLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
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

    return (
      <View style={styles.chartWrapper}>
        <SimpleChart
          data={chartValues}
          baseWidth={_chartWidth}
          chartHeight={200}
          showLine={true}
          showLabels={true}
        />
      </View>
    );
  };

  const _renderSummary = () => {
    if (aggregatedLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      );
    }

    if (!summaryData) return null;

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
            {intl.formatMessage({ id: 'wallet.year_change' })}
          </Text>
          <Text
            style={[
              styles.summaryValue,
              summaryData.isPositive ? styles.textPositive : styles.textNegative,
            ]}
          >
            {summaryData.isPositive ? '+' : '-'}
            {summaryData.changeFormatted}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{intl.formatMessage({ id: 'wallet.year_min' })}</Text>
          <Text style={styles.summaryValue}>{summaryData.min}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{intl.formatMessage({ id: 'wallet.year_max' })}</Text>
          <Text style={styles.summaryValue}>{summaryData.max}</Text>
        </View>
      </View>
    );
  };

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
