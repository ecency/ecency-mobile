import React from 'react';
import { View } from 'react-native';
import { CoinActions, CoinBasics, CoinChart } from '.';
import { FormattedCurrency } from '../../../components';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { CoinData, DataPair } from '../../../redux/reducers/walletReducer';

export interface CoinSummaryProps {
  id: string;
  coinSymbol: string;
  coinData: CoinData;
  percentChagne: number;
  onActionPress: (action: string) => void;
  onInfoPress: (dataKey: string) => void;
}

export const CoinSummary = ({
  coinSymbol,
  id,
  coinData,
  percentChagne,
  onActionPress,
  onInfoPress,
}: CoinSummaryProps) => {
  const { balance, estimateValue, savings, extraDataPairs, actions, precision } = coinData;

  const valuePairs = [
    {
      dataKey: 'amount_desc',
      value: balance.toFixed(precision || 3),
    },
  ] as DataPair[];

  if (estimateValue !== undefined) {
    valuePairs.push({
      dataKey: 'estimated_value',
      value: <FormattedCurrency isApproximate isToken value={estimateValue} />,
    });
  }

  if (savings !== undefined) {
    valuePairs.push({
      dataKey: 'savings',
      value: savings,
    });
  }

  const _shRrenderChart = id !== ASSET_IDS.ECENCY && id !== ASSET_IDS.HP && !coinData.isSpk;

  return (
    <View>
      <CoinBasics
        assetId={id}
        iconUrl={coinData.iconUrl}
        valuePairs={valuePairs}
        extraData={extraDataPairs}
        coinSymbol={coinSymbol}
        percentChange={percentChagne}
        isEngine={coinData.isEngine}
        onInfoPress={onInfoPress}
      />
      <CoinActions actions={actions} onActionPress={onActionPress} />
      {_shRrenderChart && <CoinChart coinId={id} isEngine={coinData.isEngine} />}
    </View>
  );
};
