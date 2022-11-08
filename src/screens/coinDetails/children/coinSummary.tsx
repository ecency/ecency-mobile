import React from 'react';
import { View } from 'react-native';
import { CoinActions, CoinBasics, CoinChart } from '.';
import { FormattedCurrency } from '../../../components';
import { COIN_IDS } from '../../../constants/defaultCoins';
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
  const { balance, estimateValue, savings, extraDataPairs, actions } = coinData;

  const valuePairs = [
    {
      dataKey: 'amount_desc',
      value: balance,
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

  return (
    <View>
      <CoinBasics
        valuePairs={valuePairs}
        extraData={extraDataPairs}
        coinSymbol={coinSymbol}
        percentChange={percentChagne}
        onInfoPress={onInfoPress}
      />
      <CoinActions actions={actions} onActionPress={onActionPress} />
      {id !== COIN_IDS.ECENCY && id !== COIN_IDS.HP && <CoinChart coinId={id} />}
    </View>
  );
};
