import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { CoinActions, CoinBasics, CoinChart } from '.';
import { FormattedCurrency } from '../../../components';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { CoinData, DataPair } from '../../../redux/reducers/walletReducer';

export interface CoinSummaryProps {
  id: string;
  coinSymbol: string;
  coinData: CoinData;
  percentChagne: number;
  showChart: boolean;
  setShowChart: (value: boolean) => void;
  onActionPress: (action: string) => void;
  onInfoPress: (dataKey: string) => void;
}

export const CoinSummary = ({
  coinSymbol,
  id,
  coinData,
  percentChagne,
  showChart,
  setShowChart,
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
  const animationProgress = useSharedValue(showChart ? 1 : 0);

  useEffect(() => {
    animationProgress.value = withTiming(showChart ? 1 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [showChart]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animationProgress.value,
      transform: [{ translateY: (1 - animationProgress.value) * -50 }],
      height: animationProgress.value * 270, // Adjust this value based on your chart's height
    };
  });

  const _renderCoinChart = () => (
    <Animated.View style={animatedStyle}>
      {showChart && <CoinChart coinId={id} isEngine={coinData.isEngine} />}
    </Animated.View>
  );

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
        showChart={showChart}
        setShowChart={setShowChart}
        isRenderChart={_shRrenderChart}
      />
      <CoinActions actions={actions} onActionPress={onActionPress} />
      {_shRrenderChart && _renderCoinChart()}
    </View>
  );
};
