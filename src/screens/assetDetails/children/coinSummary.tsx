import React, { useMemo } from 'react';
import { View } from 'react-native';
import { PortfolioItem } from 'providers/ecency/ecency.types';
import { WalletActions, CoinBasics } from '.';
import { FormattedCurrency } from '../../../components';

export interface CoinSummaryProps {
  tokenSymbol: string;
  asset: PortfolioItem;
  percentChagne?: number;
  showChart: boolean;
  totalRecurrentAmount?: number;
  setShowChart: (value: boolean) => void;
  onActionPress: (action: string) => void;
  onInfoPress: (dataKey: string) => void;
}

export const CoinSummary = ({
  tokenSymbol,
  asset,
  percentChagne,
  showChart,
  totalRecurrentAmount,
  setShowChart,
  onActionPress,
  onInfoPress,
}: CoinSummaryProps) => {
  const { balance, fiatRate, savings, extraData, actions, liquid, staked } = asset;
  const isEngine = asset.layer === 'engine';

  const valuePairs = [];

  if (tokenSymbol !== 'HP') {
    valuePairs.push({
      dataKey: 'amount_desc',
      value: liquid?.toFixed(3) || '0',
    });
  }

  if (staked !== undefined && staked > 0) {
    valuePairs.push({
      dataKey: 'staked',
      value: staked?.toFixed(3) || '0',
    });
  }

  if (savings !== undefined && savings > 0) {
    valuePairs.push({
      dataKey: 'savings',
      value: savings?.toFixed(3) || '0',
    });
  }

  if (fiatRate !== undefined) {
    const estimatedValue = balance * fiatRate;
    valuePairs.push({
      dataKey: 'estimated_value',
      value: <FormattedCurrency isApproximate isToken value={estimatedValue} />,
    });
  }

  // Create a new array for extraDataPairs to avoid mutating the original reference
  const _extraDataPairs = useMemo(() => {
    const pairs = extraData ? [...extraData] : [];
    if (totalRecurrentAmount && totalRecurrentAmount > 0) {
      pairs.push({
        dataKey: 'total_recurrent_transfers',
        value: `${totalRecurrentAmount} ${tokenSymbol}`,
        isClickable: true,
      });
    }
    return pairs;
  }, [extraData, totalRecurrentAmount, tokenSymbol]);

  return (
    <View>
      <CoinBasics
        iconUrl={asset.iconUrl}
        valuePairs={valuePairs}
        extraData={_extraDataPairs}
        coinSymbol={tokenSymbol}
        percentChange={percentChagne}
        isEngine={isEngine}
        onInfoPress={onInfoPress}
        showChart={showChart}
        setShowChart={setShowChart}
      />
      <WalletActions actions={actions} onActionPress={onActionPress} />
    </View>
  );
};
