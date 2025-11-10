import React, { useEffect, useMemo } from 'react';
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
  const isSpk = asset.layer === 'spk';

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

  // const _shRrenderChart = id !== ASSET_IDS.ECENCY && id !== ASSET_IDS.HP && !isSpk;
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

  // const _renderCoinChart = () => (
  //   <Animated.View style={animatedStyle}>
  //     {showChart && <CoinChart coinId={id} isEngine={isEngine} />}
  //   </Animated.View>
  // );

  return (
    <View>
      <CoinBasics
        // assetId={id}
        iconUrl={asset.iconUrl}
        valuePairs={valuePairs}
        extraData={_extraDataPairs}
        coinSymbol={coinSymbol}
        percentChange={percentChagne}
        isEngine={isEngine}
        onInfoPress={onInfoPress}
        showChart={showChart}
        setShowChart={setShowChart}
        // isRenderChart={_shRrenderChart}
      />
      <CoinActions actions={actions} onActionPress={onActionPress} />
      {/* {_shRrenderChart && _renderCoinChart()} */}
    </View>
  );
};
