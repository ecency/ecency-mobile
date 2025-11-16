import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React, { ReactNode, useMemo } from 'react';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from '../styles/children.styles';
import { IconButton } from '../../../components';
import { ClaimButton } from './claimButton';

import { AssetIcon } from '../../../components/atoms';
import { formatAmount } from '../../../utils/number';

const AlertIconButton = IconButton as any;

export interface AssetCardProps {
  name: string;
  iconUrl?: string;
  isEngine?: boolean;
  isSpk?: boolean;
  symbol: string;
  currencySymbol: string;
  currencyCode?: string;
  locale?: string;
  currentValue: number;
  ownedBalance: number;
  unclaimedRewards: string;
  enableBuy?: boolean;
  isClaiming?: boolean;
  isLoading?: boolean;
  volume24h?: number;
  precision?: number;
  footerComponent: ReactNode;
  onCardPress: () => void;
  onClaimPress: () => void;
}

export const AssetCard = ({
  symbol,
  name,
  iconUrl,
  isEngine,
  isSpk,
  currencySymbol,
  currencyCode,
  locale,
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
}: AssetCardProps) => {
  const intl = useIntl();
  const resolvedLocale = useMemo(() => locale || intl.locale, [locale, intl.locale]);
  const displayPrecision = useMemo(
    () => (isEngine ? Math.min(precision || 3, 8) : 3),
    [isEngine, precision],
  );

  const _onClaimPress = () => {
    onClaimPress();
  };

  const _inactiveTokenBtn = !!volume24h && volume24h < 10 && (
    <AlertIconButton
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

  const _name = intl.messages[`wallet.${symbol}.name`]
    ? intl.formatMessage({ id: `wallet.${symbol}.name` })
    : name;
  const value = formatAmount(ownedBalance, {
    locale: resolvedLocale,
    minimumFractionDigits: displayPrecision,
    maximumFractionDigits: displayPrecision,
  });
  const _fiatValue = ownedBalance * currentValue;
  const isSmallFiatValue = _fiatValue < 1;
  const _fiatStr = formatAmount(_fiatValue, {
    locale: resolvedLocale,
    currencySymbol,
    currencyCode,
    minimumFractionDigits: isSmallFiatValue ? 5 : 2,
    maximumFractionDigits: isSmallFiatValue ? 5 : 2,
  });

  const _renderHeader = (
    <View style={styles.cardHeader}>
      <AssetIcon
        id={symbol}
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
      const btnTitle = unclaimedRewards || intl.formatMessage({ id: `wallet.${symbol}.buy` });

      return (
        <ClaimButton
          title={btnTitle}
          isLoading={isLoading}
          isClaiming={isClaiming}
          containerStyle={{
            ...styles.claimContainer,
            marginBottom: symbol === 'POINTS' || symbol === 'HP' ? 0 : 16,
          }}
          onPress={_onClaimPress}
        />
      );
    }
  };

  return (
    <TouchableOpacity onPress={onCardPress}>
      <View style={styles.cardContainer}>
        {_renderHeader}
        {_renderClaimSection()}
        {footerComponent && footerComponent}
      </View>
    </TouchableOpacity>
  );
};
