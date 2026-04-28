import React, { useMemo } from 'react';
import { View } from 'react-native';
import { PortfolioItem } from 'providers/ecency/ecency.types';
import { useIntl } from 'react-intl';
import { WalletActions, CoinBasics } from '.';
import { useAppSelector } from '../../../hooks';
import { formatAmount } from '../../../utils/number';
import { DataPair } from '../../../redux/reducers/walletReducer';
import { selectCurrency } from '../../../redux/selectors';
import { HorizontalIconList } from '../../../components';
import POINTS, { POINTS_KEYS } from '../../../constants/options/points';

export interface CoinSummaryProps {
  tokenSymbol: string;
  asset: PortfolioItem;
  showChart: boolean;
  totalRecurrentAmount?: number;
  setShowChart: (value: boolean) => void;
  onActionPress: (action: string) => void;
  onInfoPress: (dataKey: string) => void;
  onAnalyticsPress?: () => void;
}

export const CoinSummary = ({
  tokenSymbol,
  asset,
  showChart,
  totalRecurrentAmount,
  setShowChart,
  onActionPress,
  onInfoPress,
  onAnalyticsPress,
}: CoinSummaryProps) => {
  const intl = useIntl();
  const currency = useAppSelector(selectCurrency);
  const { balance, fiatRate, savings, extraData, actions, liquid, staked } = asset;
  const isEngine = asset.layer === 'engine';

  const formatTokenAmount = (amount?: number) =>
    formatAmount(amount ?? 0, {
      locale: intl.locale,
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });

  const formatFiatAmount = (amount = 0) =>
    formatAmount(amount, {
      locale: intl.locale,
      currencySymbol: currency.currencySymbol,
      currencyCode: currency.currency,
      minimumFractionDigits: amount < 1 ? 5 : 2,
      maximumFractionDigits: amount < 1 ? 5 : 2,
    });

  const valuePairs: DataPair[] = [];

  if (tokenSymbol !== 'HP') {
    valuePairs.push({
      dataKey: 'amount_desc',
      value: formatTokenAmount(liquid),
    });
  }

  if (staked !== undefined && staked > 0) {
    valuePairs.push({
      dataKey: 'staked',
      value: formatTokenAmount(staked),
    });
  }

  if (savings !== undefined && savings > 0) {
    valuePairs.push({
      dataKey: 'savings',
      value: formatTokenAmount(savings),
    });
  }

  if (fiatRate !== undefined) {
    const estimatedValue = balance * fiatRate;
    valuePairs.push({
      dataKey: 'estimated_value',
      value: `~${formatFiatAmount(estimatedValue)}`,
    });
  }

  // Create a new array for extraDataPairs to avoid mutating the original reference
  const _extraDataPairs = useMemo<DataPair[]>(() => {
    const pairs: DataPair[] = extraData
      ? extraData.map((item) => {
          // Mark delegation items as clickable
          const isDelegation =
            item.dataKey === 'delegated_hive_power' || item.dataKey === 'received_hive_power';
          return {
            ...item,
            isClickable: isDelegation || item.isClickable,
          };
        })
      : [];
    if (totalRecurrentAmount && totalRecurrentAmount > 0) {
      pairs.push({
        dataKey: 'total_recurrent_transfers',
        value: `${formatTokenAmount(totalRecurrentAmount)} ${tokenSymbol}`,
        isClickable: true,
      });
    }
    return pairs;
  }, [extraData, totalRecurrentAmount, tokenSymbol]);

  const walletActions = useMemo(
    () =>
      actions
        ? actions
            .map((action: any) => (typeof action === 'string' ? action : action?.id))
            .filter((action): action is string => Boolean(action))
        : [],
    [actions],
  );

  return (
    <View>
      <CoinBasics
        iconUrl={asset.iconUrl}
        valuePairs={valuePairs}
        extraData={_extraDataPairs}
        coinSymbol={tokenSymbol}
        apr={asset.apr}
        isEngine={isEngine}
        onInfoPress={onInfoPress}
        showChart={showChart}
        setShowChart={setShowChart}
        onAnalyticsPress={onAnalyticsPress}
      />
      <WalletActions actions={walletActions} onActionPress={onActionPress} />
      {tokenSymbol === 'POINTS' && (
        <HorizontalIconList options={POINTS} optionsKeys={POINTS_KEYS} />
      )}
    </View>
  );
};
