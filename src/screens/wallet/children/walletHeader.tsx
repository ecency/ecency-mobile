import React, { useMemo } from 'react';
import { View, Text } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import ROUTES from '../../../constants/routeNames';
import { IconButton } from '../../../components';
import { useAppSelector } from '../../../hooks';
import { PortfolioItem } from '../../../providers/ecency/ecency.types';

import styles from './walletHeader.styles';
import { WalletActions } from '../../assetDetails/children';

interface WalletHeaderProps {
  assets?: PortfolioItem[];
  currencyCode: string;
  currencySymbol?: string;
  lastUpdated: number;
  onRefresh: () => void;
}

export const WalletHeader = ({
  assets,
  currencyCode,
  currencySymbol,
  lastUpdated,
  onRefresh,
}: WalletHeaderProps) => {
  const navigation = useNavigation<any>();
  const intl = useIntl();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const RefreshIconButton = IconButton as any;

  const actionHandlers = useMemo(
    () => ({
      manage_tokens: () => navigation.navigate(ROUTES.MODALS.ASSETS_SELECT),
      //   claim_all: () => Alert.alert('TODO: Implement Claim All'),
      boost: () =>
        navigation.navigate({
          name: ROUTES.SCREENS.ACCOUNT_BOOST,
          params: {
            username: currentAccount.name,
          },
        }),
    }),
    [navigation, currentAccount.name],
  );

  const _actionKeys = useMemo(() => {
    const hpBalance = assets?.find((asset) => asset.symbol?.toUpperCase?.() === 'HP')?.balance ?? 0;

    const keys: string[] = [
      // 'manage_tokens',
      // 'claim_all' //TODO: Implement Claim All
    ];
    // if (hpBalance < 50) {
      // keys.push('boost');
    // }
    return keys;
  }, [assets]);

  const _handleActionPress = (action: string) => {
    const handler = actionHandlers[action as keyof typeof actionHandlers];

    if (handler) {
      handler();
    }
  };

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

  return (
    <View style={styles.container}>
      <Text style={styles.totalLabel}>
        {intl.formatMessage({ id: 'wallet.estimated_balance', defaultMessage: 'Estimated balance' })}
      </Text>

      <View style={styles.balanceRow}>
        <Text style={styles.totalValue}>{totalBalanceLabel}</Text>
        <RefreshIconButton
          name="refresh"
          iconType="MaterialCommunityIcons"
          size={20}
          color={EStyleSheet.value('$primaryBlack')}
          onPress={onRefresh}
        />
      </View>
      <WalletActions actions={_actionKeys} onActionPress={_handleActionPress} />
      <Text style={styles.lastUpdated}>
        {intl.formatMessage({ id: 'wallet.last_updated' }, {datetime: new Date(lastUpdated).toLocaleString()})}
      </Text>
    </View>
  );
};
