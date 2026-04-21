import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import moment from 'moment';
import { SheetManager } from 'react-native-actions-sheet';
import ROUTES from '../../../constants/routeNames';
import TransferTypes from '../../../constants/transferTypes';
import { Icon } from '../../../components/icon';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { toastNotification } from '../../../redux/actions/uiAction';
import { selectCurrentAccount } from '../../../redux/selectors';
import { PortfolioItem } from '../../../providers/ecency/ecency.types';
import { formatAmount } from '../../../utils/number';
import { SheetNames } from '../../../navigation/sheets';

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
  const dispatch = useAppDispatch();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const walletState = useAppSelector((state) => state.wallet);

  const _onManageTokensPress = () => {
    navigation.navigate(ROUTES.MODALS.ASSETS_SELECT);
  };

  const _onSendPress = () => {
    if (!currentAccount?.name) {
      dispatch(
        toastNotification(
          intl.formatMessage({ id: 'alert.not_logged_in', defaultMessage: 'Please log in first' }),
        ),
      );
      return;
    }
    navigation.navigate({
      name: ROUTES.SCREENS.TRANSFER,
      params: { transferType: 'transfer_token', fundType: 'HIVE' },
    });
  };

  const _onReceivePress = () => {
    if (currentAccount?.name) {
      SheetManager.show(SheetNames.RECEIVE_QR, {
        payload: { username: currentAccount.name },
      });
    } else {
      dispatch(
        toastNotification(
          intl.formatMessage({ id: 'alert.not_logged_in', defaultMessage: 'Please log in first' }),
        ),
      );
    }
  };

  const _onSwapPress = () => {
    if (!currentAccount?.name) {
      dispatch(
        toastNotification(
          intl.formatMessage({ id: 'alert.not_logged_in', defaultMessage: 'Please log in first' }),
        ),
      );
      return;
    }
    navigation.navigate({
      name: ROUTES.SCREENS.TRADE,
      params: {
        transferType: TransferTypes.SWAP_TOKEN,
        fundType: 'HIVE',
      },
    });
  };

  const _onGetPointsPress = () => {
    if (currentAccount?.name) {
      navigation.navigate({
        name: ROUTES.SCREENS.BOOST,
        params: { username: currentAccount.name },
      });
    } else {
      dispatch(
        toastNotification(
          intl.formatMessage({ id: 'alert.not_logged_in', defaultMessage: 'Please log in first' }),
        ),
      );
    }
  };

  const totalBalanceLabel = useMemo(() => {
    const { locale } = intl;
    if (!assets || assets.length === 0) {
      return currencySymbol
        ? formatAmount(0, { currencySymbol, currencyCode, locale })
        : `${formatAmount(0, { locale })} ${currencyCode}`.trim();
    }

    const total = assets.reduce((sum, asset) => {
      const assetTotal = asset.balance * asset.fiatRate;
      return sum + assetTotal;
    }, 0);

    const isSmallNumber = total < 1;
    const formattedTotal = formatAmount(total, {
      locale,
      currencySymbol,
      currencyCode,
      minimumFractionDigits: isSmallNumber ? 5 : 2,
      maximumFractionDigits: isSmallNumber ? 5 : 2,
    });

    if (currencySymbol) {
      return formattedTotal;
    }

    return `${formattedTotal} ${currencyCode}`.trim();
  }, [assets, currencyCode, currencySymbol, intl.locale]);

  const effectiveLastUpdated =
    typeof lastUpdated === 'number' ? lastUpdated : walletState.updateTimestamp;

  const _lastUpdatedTime =
    typeof effectiveLastUpdated === 'number' && effectiveLastUpdated > 0
      ? moment(effectiveLastUpdated).format(moment.localeData().longDateFormat('LT'))
      : '--:--';

  const _lastUpdateLabel = updating
    ? intl.formatMessage({ id: 'wallet.updating' })
    : intl.formatMessage(
        {
          id: 'wallet.last_updated',
          defaultMessage: 'Last updated at {datetime}',
        },
        { datetime: _lastUpdatedTime },
      );

  const quickActions = [
    {
      icon: 'arrow-up',
      label: intl.formatMessage({
        id: 'wallet.send',
        defaultMessage: 'Send',
      }),
      onPress: _onSendPress,
    },
    {
      icon: 'arrow-down',
      label: intl.formatMessage({
        id: 'wallet.receive',
        defaultMessage: 'Receive',
      }),
      onPress: _onReceivePress,
    },
    {
      icon: 'swap-horizontal',
      label: intl.formatMessage({
        id: 'wallet.swap',
        defaultMessage: 'Swap',
      }),
      onPress: _onSwapPress,
    },
    {
      icon: 'star-circle',
      label: intl.formatMessage({
        id: 'wallet.get_points',
        defaultMessage: 'Get Points',
      }),
      onPress: _onGetPointsPress,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Top row: label + refresh/settings */}
      <View style={styles.topRow}>
        <Text style={styles.totalLabel}>
          {intl.formatMessage({
            id: 'wallet.estimated_balance',
            defaultMessage: 'Estimated balance',
          })}
        </Text>
        <View style={styles.topActions}>
          {updating ? (
            <View style={styles.topActionButton}>
              <ActivityIndicator size="small" color={EStyleSheet.value('$primaryBlue')} />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.topActionButton}
              onPress={onRefresh}
              accessibilityLabel={intl.formatMessage({
                id: 'wallet.refresh',
                defaultMessage: 'Refresh',
              })}
              accessibilityHint={intl.formatMessage({
                id: 'wallet.refresh_hint',
                defaultMessage: 'Refresh balances',
              })}
            >
              <Icon
                iconType="MaterialCommunityIcons"
                name="refresh"
                size={20}
                color={EStyleSheet.value('$iconColor')}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.topActionButton}
            onPress={_onManageTokensPress}
            accessibilityLabel={intl.formatMessage({
              id: 'wallet.manage_tokens',
              defaultMessage: 'Manage tokens',
            })}
            accessibilityHint={intl.formatMessage({
              id: 'wallet.manage_tokens_hint',
              defaultMessage: 'Open token management',
            })}
          >
            <Icon
              iconType="MaterialCommunityIcons"
              name="cog"
              size={20}
              color={EStyleSheet.value('$iconColor')}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.totalValue} numberOfLines={1} adjustsFontSizeToFit>
          {updating ? '--.--' : totalBalanceLabel}
        </Text>
        <Text style={styles.lastUpdated}>{_lastUpdateLabel}</Text>
      </View>

      {/* Quick actions */}
      <View style={styles.quickActionsRow}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.icon}
            style={styles.quickActionItem}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <Icon iconType="MaterialCommunityIcons" name={action.icon} size={22} color="#fff" />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
