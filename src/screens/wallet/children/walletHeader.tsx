import React, { useMemo } from 'react';
import { View, Text, Alert } from 'react-native';

import ROUTES from '../../../constants/routeNames';
import { IconButton } from '../../../components';
import { useNavigation } from '@react-navigation/native';
import { useIntl } from 'react-intl';
import { useAppSelector } from '../../../hooks';

import styles from './walletHeader.styles';
import { WalletActions } from '../../assetDetails/children';
import EStyleSheet from 'react-native-extended-stylesheet';

interface WalletHeaderProps {
  totalBalanceLabel: string;
  onRefresh: () => void;
  hpBalance?: number;
}

export const WalletHeader = ({
  totalBalanceLabel,
  onRefresh,
  hpBalance = 0,
}: WalletHeaderProps) => {
  const navigation = useNavigation<any>();
  const intl = useIntl();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const RefreshIconButton = IconButton as any;

  const actionHandlers = useMemo(
    () => ({
      manage_tokens: () => navigation.navigate(ROUTES.MODALS.ASSETS_SELECT),
      claim_all: () => Alert.alert('TODO: Implement Claim All'),
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
    const keys = ['manage_tokens', 'claim_all'];
    if (hpBalance < 50) {
      keys.push('boost');
    }
    return keys;
  }, [hpBalance]);

  const _handleActionPress = (action: string) => {
    const handler = actionHandlers[action as keyof typeof actionHandlers];

    if (handler) {
      handler();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.totalLabel}>
        {intl.formatMessage({ id: 'wallet.total_balance', defaultMessage: 'Total balance' })}
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
    </View>
  );
};

