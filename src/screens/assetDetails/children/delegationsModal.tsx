import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQueryClient } from '@tanstack/react-query';
import {
  getVestingDelegationsQueryOptions,
  getReceivedVestingSharesQueryOptions,
  getVestingDelegationExpirationsQueryOptions,
} from '@ecency/sdk';

import unionBy from 'lodash/unionBy';
import EStyleSheet from 'react-native-extended-stylesheet';
import AccountListContainer from '../../../containers/accountListContainer';
import ROUTES from '../../../constants/routeNames';
import styles from './children.styles';
import { BasicHeader, Modal, UserListItem } from '../../../components';
import { useAppSelector } from '../../../hooks';
import {
  selectCurrentAccount,
  selectIsDarkTheme,
  selectGlobalProps,
} from '../../../redux/selectors';
import { vestsToHp } from '../../../utils/conversions';

export enum MODES {
  DELEGATEED = 'delegated_hive_power',
  RECEIVED = 'received_hive_power',
}

interface DelegationItem {
  username: string;
  vestingShares: string;
  timestamp: string;
  isExpiring?: boolean;
}

// eslint-disable-next-line no-empty-pattern
export const DelegationsModal = forwardRef(({}, ref) => {
  const intl = useIntl();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const queryClient = useQueryClient();

  const currentAccount = useAppSelector(selectCurrentAccount);
  const globalProps = useAppSelector(selectGlobalProps);
  const isDarkTheme = useAppSelector(selectIsDarkTheme);

  const [delegations, setDelegations] = useState<DelegationItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<MODES>(MODES.DELEGATEED);
  const [isLoading, setIsLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    showModal: (_mode: MODES) => {
      setDelegations([]);
      setShowModal(true);
      setMode(_mode);
    },
  }));

  useEffect(() => {
    if (showModal) {
      _getDelegations();
    }
  }, [mode, showModal]);

  const _getVestingDelegations = async () => {
    let activeDelegations: DelegationItem[] = [];
    const limit = 1000;

    // Fetch all pages of vesting delegations using infinite query
    const queryOpts = getVestingDelegationsQueryOptions(currentAccount.name, limit);

    // Fetch first page
    let cursor: string | undefined = '';
    let hasMore = true;

    while (hasMore) {
      try {
        // Fetch page with current cursor
        // eslint-disable-next-line no-await-in-loop
        const response = await queryClient.fetchQuery({
          ...queryOpts,
          queryKey: [...queryOpts.queryKey, cursor],
          queryFn: () => queryOpts.queryFn({ pageParam: cursor || '' }),
        });

        // Map to DelegationItem format
        const pageDelegations = response.map(
          (item) =>
            ({
              username: item.delegatee,
              vestingShares: item.vesting_shares,
              timestamp: item.min_delegation_time,
            } as DelegationItem),
        );

        activeDelegations = unionBy(activeDelegations, pageDelegations, 'username');

        // Check if there are more pages
        if (response.length < limit) {
          hasMore = false;
        } else {
          // Get cursor for next page (last delegatee)
          cursor = response[response.length - 1]?.delegatee;
          if (!cursor) {
            hasMore = false;
          }
        }
      } catch (error) {
        console.error('Failed to fetch vesting delegations page:', error);
        hasMore = false;
      }
    }

    // Fetch expiring delegations (undelegated HP in 5-day cooldown)
    let expiringDelegations: DelegationItem[] = [];
    try {
      const expirations = await queryClient.fetchQuery(
        getVestingDelegationExpirationsQueryOptions(currentAccount.name),
      );
      expiringDelegations = (expirations || []).map((item) => {
        // Convert NAI asset {amount, precision} to VESTS string
        const vestsNum = Number(item.vesting_shares.amount) / 10 ** item.vesting_shares.precision;
        return {
          username: `expiring-${item.id}`,
          vestingShares: `${vestsNum.toFixed(6)} VESTS`,
          timestamp: item.expiration,
          isExpiring: true,
        } as DelegationItem;
      });
    } catch (error) {
      console.warn('Failed to fetch expiring delegations:', error);
    }

    return [...activeDelegations, ...expiringDelegations];
  };

  const _getReceivedDelegations = async () => {
    // Use SDK query to fetch received vesting shares directly
    const receivedVestingShares = await queryClient.fetchQuery(
      getReceivedVestingSharesQueryOptions(currentAccount.name),
    );
    return (receivedVestingShares || []).map((item) => ({
      username: item.delegator,
      vestingShares: item.vesting_shares,
      timestamp: item.timestamp,
    }));
  };

  const _getDelegations = async () => {
    try {
      setIsLoading(true);
      let response: DelegationItem[] = [];
      switch (mode) {
        case MODES.DELEGATEED:
          response = await _getVestingDelegations();
          break;
        case MODES.RECEIVED:
          response = await _getReceivedDelegations();
          break;
      }
      setDelegations(response);
      setIsLoading(false);
    } catch (err) {
      console.warn('Failed to get delegations', err);
      setIsLoading(false);
    }
  };

  const _handleOnUserPress = (username: string) => {
    navigation.navigate({
      name: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username,
    });
    setShowModal(false);
  };

  const _handleOnPressUpdate = (username: string) => {
    if (mode === MODES.DELEGATEED) {
      console.log('delegate HP!');
      navigation.navigate({
        name: ROUTES.SCREENS.TRANSFER,
        params: {
          transferType: 'delegate',
          fundType: 'HIVE_POWER',
          referredUsername: username,
        },
      });
      setShowModal(false);
    }
  };

  const title = intl.formatMessage({ id: `wallet.${mode}` });

  const _formatTimeLeft = (expiration: string) => {
    const now = Date.now();
    const expTime = new Date(`${expiration}Z`).getTime();
    const diff = expTime - now;
    if (diff <= 0) return intl.formatMessage({ id: 'wallet.expiring_soon' });
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) {
      return `${days}d ${hours}h ${intl.formatMessage({ id: 'wallet.remaining' })}`;
    }
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m ${intl.formatMessage({ id: 'wallet.remaining' })}`;
  };

  const _renderItem = ({ item, index }: { item: DelegationItem; index: number }) => {
    const value = `${vestsToHp(item.vestingShares, globalProps.hivePerMVests).toFixed(3)} HP`;

    if (item.isExpiring) {
      const timeLeft = _formatTimeLeft(item.timestamp);
      return (
        <UserListItem
          key={item.username}
          index={index}
          username={currentAccount.name}
          text={intl.formatMessage({ id: 'wallet.expiring' })}
          description={timeLeft}
          descriptionStyle={{ color: EStyleSheet.value('$primaryRed') }}
          isHasRightItem
          rightText={value}
          rightTextStyle={{ color: EStyleSheet.value('$primaryRed') }}
          isLoggedIn
          isClickable={false}
        />
      );
    }

    const timeString = new Date(item.timestamp).toDateString();
    const subRightText =
      mode === MODES.DELEGATEED && intl.formatMessage({ id: 'wallet.tap_update' });

    return (
      <UserListItem
        key={item.username}
        index={index}
        username={item.username}
        description={timeString}
        isHasRightItem
        rightText={value}
        subRightText={subRightText}
        isLoggedIn
        handleOnPress={() => _handleOnUserPress(item.username)}
        onPressRightText={() => _handleOnPressUpdate(item.username)}
        isClickable
      />
    );
  };

  const _renderContent = () => {
    return (
      <AccountListContainer data={delegations}>
        {({ data, filterResult, handleSearch }) => (
          <>
            <BasicHeader
              backIconName="close"
              isModalHeader
              handleOnPressClose={() => {
                setShowModal(false);
              }}
              title={`${title} (${data && data.length})`}
              isHasSearch
              handleOnSearch={(text) => handleSearch(text, 'username')}
            />
            <FlatList
              data={filterResult || data}
              keyExtractor={(item) => item.username}
              removeClippedSubviews={false}
              renderItem={_renderItem}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={_getDelegations}
                  progressBackgroundColor="#357CE6"
                  tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
                  titleColor="#fff"
                  colors={['#fff']}
                />
              }
            />
          </>
        )}
      </AccountListContainer>
    );
  };

  return (
    <Modal
      isOpen={showModal}
      handleOnModalClose={() => setShowModal(false)}
      isFullScreen
      isCloseButton
      presentationStyle="formSheet"
      animationType="slide"
      style={styles.delegationsModal}
    >
      {_renderContent()}
    </Modal>
  );
});
