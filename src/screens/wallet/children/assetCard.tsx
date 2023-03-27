import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React, { ComponentType, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from '../styles/children.styles';
import { IconButton, SimpleChart } from '../../../components';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { ClaimButton } from './claimButton';

import { AssetIcon } from '../../../components/atoms';

export interface AssetCardProps {
  id: string;
  chartData: number[];
  name: string;
  iconUrl?: string;
  notCrypto?: boolean;
  isEngine?: boolean;
  isSpk?: boolean;
  symbol: string;
  currencySymbol: string;
  changePercent: number;
  currentValue: number;
  ownedBalance: number;
  unclaimedRewards: string;
  enableBuy?: boolean;
  isClaiming?: boolean;
  isLoading?: boolean;
  volume24h?: number;
  precision?: number;
  footerComponent: ComponentType<any>;
  onCardPress: () => void;
  onClaimPress: () => void;
  onBoostAccountPress: () => void;
}

export const AssetCard = ({
  id,
  name,
  iconUrl,
  notCrypto,
  isEngine,
  isSpk,
  chartData,
  currencySymbol,
  symbol,
  changePercent,
  currentValue,
  ownedBalance,
  footerComponent,
  unclaimedRewards,
  enableBuy,
  isClaiming,
  isLoading,
  volume24h,
  precision,
  onCardPress,
  onClaimPress,
  onBoostAccountPress,
}: AssetCardProps) => {
  const intl = useIntl();

  const _onClaimPress = () => {
    onClaimPress();
  };

  const _inactiveTokenBtn = !!volume24h && volume24h < 10 && (
    <IconButton
      name="alert-circle-outline"
      iconType="MaterialCommuntyIcon"
      size={24}
      color={EStyleSheet.value('$primaryRed')}
      onPress={() => {
        Alert.alert(
          intl.formatMessage({ id: 'wallet.low_liquidity' }),
          intl.formatMessage({ id: 'wallet.inactive_token' }),
        );
      }}
    />
  );

  const _name = intl.messages[`wallet.${id}.name`]
    ? intl.formatMessage({ id: `wallet.${id}.name` })
    : name;
  const value = `${ownedBalance.toFixed(isEngine ? precision : 3)}`;
  const _fiatValue = ownedBalance * currentValue;
  const _fiatStr = `${_fiatValue.toFixed(_fiatValue < 1 ? 5 : 2)}${currencySymbol}`;

  const _renderHeader = (
    <View style={styles.cardHeader}>
      <AssetIcon
        id={id}
        iconUrl={iconUrl}
        isEngine={isEngine}
        isSpk={isSpk}
        containerStyle={styles.logoContainer}
        iconSize={32}
      />

      <View style={styles.cardTitleContainer}>
        <Text style={styles.textTitle}>{symbol}</Text>
        <Text style={styles.textSubtitle}>{_name}</Text>
      </View>

      {_inactiveTokenBtn}

      <View style={styles.cardValuesContainer}>
        <Text style={styles.textValue} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.textSubtitleRight}>{_fiatStr}</Text>
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
          containerStyle={{
            ...styles.claimContainer,
            marginBottom: id === ASSET_IDS.ECENCY ? 0 : 16,
          }}
          onPress={_onClaimPress}
        />
      );
    }
  };

  const _renderBoostAccount = () => {
    if (id === ASSET_IDS.HP && ownedBalance < 50) {
      return (
        <ClaimButton
          title={intl.formatMessage({ id: 'wallet.get_boost' })}
          onPress={onBoostAccountPress}
        />
      );
    }
  };

  const _renderGraph = () => {
    if (!chartData.length) {
      return null;
    }
    const _baseWidth = getWindowDimensions().width - 32;
    return (
      <View style={styles.chartContainer}>
        <SimpleChart
          data={chartData.slice(0, 24)}
          baseWidth={_baseWidth}
          showLine={false}
          chartHeight={60}
        />
      </View>
    );
  };

  const _renderFooter =
    chartData.length > 0 ? (
      <View style={styles.cardFooter}>
        <Text style={styles.textCurValue}>{`${currencySymbol} ${currentValue.toFixed(2)}`}</Text>
        <Text style={changePercent > 0 ? styles.textDiffPositive : styles.textDiffNegative}>{`${
          changePercent >= 0 ? '+' : ''
        }${changePercent.toFixed(1)}%`}</Text>
      </View>
    ) : (
      <View style={{ height: 12 }} />
    );

  return (
    <TouchableOpacity onPress={onCardPress}>
      <View style={styles.cardContainer}>
        {_renderHeader}
        {_renderBoostAccount()}
        {_renderClaimSection()}
        {!notCrypto && _renderGraph()}
        {!notCrypto ? _renderFooter : <View style={{ height: 12 }} />}
        {footerComponent && footerComponent}
      </View>
    </TouchableOpacity>
  );
};
