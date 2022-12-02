import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { ComponentType, Fragment, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import FastImage from 'react-native-fast-image';
import styles from '../styles/children.styles';
import { Icon, MainButton, SimpleChart } from '../../../components';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import { COIN_IDS } from '../../../constants/defaultCoins';
import { ClaimButton } from './claimButton';
import HIVE_ENGINE_ICON from '../../../assets/hive_engine.png';

export interface CoinCardProps {
  id: string;
  chartData: number[];
  name: string;
  iconUrl?: string;
  notCrypto?: boolean;
  isEngine?: boolean;
  symbol: string;
  currencySymbol: string;
  changePercent: number;
  currentValue: number;
  ownedTokens: number;
  unclaimedRewards: string;
  enableBuy?: boolean;
  isClaiming?: boolean;
  isLoading?: boolean;
  footerComponent: ComponentType<any>;
  onCardPress: () => void;
  onClaimPress: () => void;
  onBoostAccountPress: () => void;
}

export const CoinCard = ({
  id,
  name,
  iconUrl,
  notCrypto,
  isEngine,
  chartData,
  currencySymbol,
  symbol,
  changePercent,
  currentValue,
  ownedTokens,
  footerComponent,
  unclaimedRewards,
  enableBuy,
  isClaiming,
  isLoading,
  onCardPress,
  onClaimPress,
  onBoostAccountPress,
}: CoinCardProps) => {
  const intl = useIntl();

  const [claimExpected, setClaimExpected] = useState(false);

  useEffect(() => {
    if (!isClaiming && claimExpected) {
      setClaimExpected(false);
    }
  }, [isClaiming]);

  const _onClaimPress = () => {
    setClaimExpected(!!unclaimedRewards);
    onClaimPress();
  };

  const _name = intl.messages[`wallet.${id}.name`]
    ? intl.formatMessage({ id: `wallet.${id}.name` })
    : name;
  const value = `${isEngine ? ownedTokens.toFixed(6) : ownedTokens} ${isEngine ? '' : symbol}`;

  const _renderAssetIcon = iconUrl && (
    <View>
      <FastImage style={styles.logo} resizeMode="cover" source={{ uri: iconUrl }} />
      {isEngine && (
        <View style={styles.hiveEngineWrapper}>
          <FastImage style={styles.hiveEngineLogo} resizeMode="contain" source={HIVE_ENGINE_ICON} />
        </View>
      )}
    </View>
  );

  const _renderHeader = (
    <View style={styles.cardHeader}>
      {_renderAssetIcon}

      <View style={styles.cardTitleContainer}>
        <Text style={styles.textTitle}>{symbol}</Text>
        <Text style={styles.textSubtitle}>{_name}</Text>
      </View>
      <View style={styles.cardValuesContainer}>
        <Text style={styles.textTitle}>{value}</Text>
        {!isEngine && (
          <Text style={styles.textSubtitleRight}>
            {`${(ownedTokens * currentValue).toFixed(2)}${currencySymbol}`}
          </Text>
        )}
      </View>
    </View>
  );

  const _renderClaimSection = () => {
    if (unclaimedRewards || enableBuy) {
      const btnTitle = unclaimedRewards || intl.formatMessage({ id: `wallet.${id}.buy` });

      return (
        <ClaimButton
          title={btnTitle}
          isLoading={isLoading}
          isClaiming={isClaiming}
          isClaimExpected={claimExpected}
          onPress={_onClaimPress}
        />
      );
    }
  };

  const _renderBoostAccount = () => {
    if (id === COIN_IDS.HP && ownedTokens < 50) {
      return (
        <ClaimButton
          title={intl.formatMessage({ id: 'wallet.get_boost' })}
          onPress={onBoostAccountPress}
        />
      );
    }
  };

  const _renderGraph = () => {
    const _baseWidth = getWindowDimensions().width - 32;
    return (
      <View style={styles.chartContainer}>
        <SimpleChart data={chartData} baseWidth={_baseWidth} showLine={false} chartHeight={130} />
      </View>
    );
  };

  const _renderFooter = (
    <View style={styles.cardFooter}>
      <Text style={styles.textCurValue}>{`${currencySymbol} ${currentValue.toFixed(2)}`}</Text>
      <Text style={changePercent > 0 ? styles.textDiffPositive : styles.textDiffNegative}>{`${
        changePercent >= 0 ? '+' : ''
      }${changePercent.toFixed(1)}%`}</Text>
    </View>
  );

  return (
    <TouchableOpacity onPress={onCardPress}>
      <View style={styles.cardContainer}>
        {_renderHeader}
        {_renderClaimSection()}
        {_renderBoostAccount()}
        {!notCrypto && !isEngine && _renderGraph()}
        {!notCrypto && !isEngine ? _renderFooter : <View style={{ height: 12 }} />}
        {footerComponent && footerComponent}
      </View>
    </TouchableOpacity>
  );
};
