import React, { useMemo } from 'react';
import { View } from 'react-native';
import { WalletActions, CoinBasics } from '.';
import { FormattedCurrency } from '../../../components';
import { DataPair } from '../../../redux/reducers/walletReducer';
import { PortfolioItem } from 'providers/ecency/ecency.types';

export interface CoinSummaryProps {
  coinSymbol: string;
  asset: PortfolioItem;
  percentChagne?: number;
  showChart: boolean;
  totalRecurrentAmount?: number;
  setShowChart: (value: boolean) => void;
  onActionPress: (action: string) => void;
  onInfoPress: (dataKey: string) => void;
}

export const CoinSummary = ({
  coinSymbol,
  asset,
  percentChagne,
  showChart,
  totalRecurrentAmount,
  setShowChart,
  onActionPress,
  onInfoPress,
}: CoinSummaryProps) => {
  const { balance, fiatRate, savings, extraData, actions } = asset;
  const isEngine = asset.layer === 'engine';

  const valuePairs = [
    {
      dataKey: 'amount_desc',
      value: balance.toFixed( 3),
    },
  ] as DataPair[];

  if (fiatRate !== undefined) {
    const estimatedValue = balance * fiatRate;
    valuePairs.push({
      dataKey: 'estimated_value',
      value: <FormattedCurrency isApproximate isToken value={estimatedValue} />,
    });
  }

  if (savings !== undefined) {
    valuePairs.push({
      dataKey: 'savings',
      value: savings,
    });
  }

  // Create a new array for extraDataPairs to avoid mutating the original reference
  const _extraDataPairs = useMemo(() => {
    const pairs = extraData ? [...extraData] : [];
    if (totalRecurrentAmount && totalRecurrentAmount > 0) {
      pairs.push({
        dataKey: 'total_recurrent_transfers',
        value: `${totalRecurrentAmount} ${coinSymbol}`,
        isClickable: true,
      });
    }
    return pairs;
  }, [extraData, totalRecurrentAmount, coinSymbol]);




  return (
    <View>
      <CoinBasics
        iconUrl={asset.iconUrl}
        valuePairs={valuePairs}
        extraData={_extraDataPairs}
        coinSymbol={coinSymbol}
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
