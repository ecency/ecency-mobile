import React, { useMemo } from 'react';
import { View, Text } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import moment from 'moment';
import ROUTES from '../../../constants/routeNames';
import { IconButton } from '../../../components';
import { useAppSelector } from '../../../hooks';
import { PortfolioItem } from '../../../providers/ecency/ecency.types';

import styles from './walletHeader.styles';

interface WalletHeaderProps {
  assets?: PortfolioItem[];
  currencyCode: string;
  currencySymbol?: string;
  lastUpdated?: number;
  updating?: boolean;
  onRefresh: () => void;
}

export const WalletHeader = ({
  assets,
  currencyCode,
  currencySymbol,
  lastUpdated,
  updating,
  onRefresh,
}: WalletHeaderProps) => {
  const navigation = useNavigation<any>();
  const intl = useIntl();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const walletState = useAppSelector((state) => state.wallet);
  const RefreshIconButton = IconButton as any;
  const ManageIconButton = IconButton as any;
  const BoostIconButton = IconButton as any;

  const _onManageTokensPress = () => {
    navigation.navigate(ROUTES.MODALS.ASSETS_SELECT);
  };


  const _onBoostPress = () => {
    navigation.navigate({
      name: ROUTES.SCREENS.ACCOUNT_BOOST,
      params: {
        username: currentAccount.name,
      },
    })
  };

  const hpBalance = useMemo(
    () => assets?.find((asset) => asset.symbol?.toUpperCase?.() === 'HP')?.balance ?? 0,
    [assets],
  );


  const totalBalanceLabel = useMemo(() => {
    if (!assets || assets.length === 0) {
      return currencySymbol ? `${currencySymbol}0` : `0 ${currencyCode}`.trim();
    }

    const total = assets.reduce((sum, asset) => {
      const assetTotal = asset.balance * asset.fiatRate;
      return sum + assetTotal;
    }, 0);

    const formattedTotal = total >= 1 ? total.toFixed(2) : total.toFixed(5);

    if (currencySymbol) {
      return `${currencySymbol}${formattedTotal}`;
    }

    return `${formattedTotal} ${currencyCode}`.trim();
  }, [assets, currencyCode]);

  const effectiveLastUpdated =
    typeof lastUpdated === 'number' ? lastUpdated : walletState.updateTimestamp;
  const isUpdating = Boolean(updating);

  const _lastUpdatedTime =
    typeof effectiveLastUpdated === 'number' && effectiveLastUpdated > 0
      ? moment(effectiveLastUpdated).format(moment.localeData().longDateFormat('LT'))
      : intl.formatMessage({ id: 'wallet.last_updated_placeholder', defaultMessage: '--:--' });

  const _lastUpdateLabel = isUpdating
    ? intl.formatMessage({ id: 'wallet.updating' })
    : intl.formatMessage(
        { id: 'wallet.last_updated', defaultMessage: 'Last updated at {datetime}' },
        {
          datetime: _lastUpdatedTime,
        },
      );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.totalLabel}>
          {intl.formatMessage({
            id: 'wallet.estimated_balance',
            defaultMessage: 'Estimated balance',
          })}
        </Text>
        <Text style={styles.lastUpdated}>{_lastUpdateLabel}</Text>
      </View>
      <View style={styles.balanceRow}>
        <View style={styles.balanceValueContainer}>
          <Text style={styles.totalValue} numberOfLines={1} ellipsizeMode="tail">
            {totalBalanceLabel}
          </Text>
        </View>
        <View style={styles.balanceActions}>
          {hpBalance < 50 && (
            <View style={[styles.actionIconWrapper, styles.firstActionIconWrapper]}>
              <BoostIconButton
                name="fire"
                iconType="MaterialCommunityIcons"
                size={24}
                color={EStyleSheet.value('$primaryBlue')}
                onPress={_onBoostPress}
                style={styles.actionIconButton}
              />
            </View>
          )}
          <View
            style={[
              styles.actionIconWrapper,
              hpBalance >= 50 ? styles.firstActionIconWrapper : null,
            ]}
          >
            <RefreshIconButton
              name="refresh"
              iconType="MaterialCommunityIcons"
              size={24}
              color={EStyleSheet.value('$primaryBlack')}
              onPress={onRefresh}
              style={styles.actionIconButton}
            />
          </View>
          <View style={styles.actionIconWrapper}>
            <ManageIconButton
              name="cog"
              iconType="MaterialCommunityIcons"
              size={24}
              color={EStyleSheet.value('$primaryBlack')}
              onPress={_onManageTokensPress}
              style={styles.actionIconButton}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
