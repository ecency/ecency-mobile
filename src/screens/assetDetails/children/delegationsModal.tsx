import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import unionBy from 'lodash/unionBy';
import AccountListContainer from '../../../containers/accountListContainer';
import ROUTES from '../../../constants/routeNames';
import styles from './children.styles';
import { BasicHeader, Modal, UserListItem } from '../../../components';
import { useAppSelector } from '../../../hooks';
import { getVestingDelegations } from '../../../providers/hive/dhive';
import { getReceivedVestingShares } from '../../../providers/ecency/ecency';
import { vestsToHp } from '../../../utils/conversions';

export enum MODES {
  DELEGATEED = 'delegated_hive_power',
  RECEIVED = 'received_hive_power',
}

interface DelegationItem {
  username: string;
  vestingShares: string;
  timestamp: string;
}

export const DelegationsModal = forwardRef(({}, ref) => {
  const intl = useIntl();
  const navigation = useNavigation<StackNavigationProp<any>>();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const globalProps = useAppSelector((state) => state.account.globalProps);
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);

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

  const _getVestingDelegations = async (startUsername: string = '') => {
    let resData: any = [];
    let limit = 1000;

    const response = await getVestingDelegations(currentAccount.username, startUsername, limit);
    resData = response.map(
      (item) =>
        ({
          username: item.delegatee,
          vestingShares: item.vesting_shares,
          timestamp: item.min_delegation_time,
        } as DelegationItem),
    );

    if (resData.length === limit) {
      const data = await _getVestingDelegations(response[response.length - 1].delegatee);
      resData = unionBy(resData, data, 'username');
    }

    return resData;
  };

  const _getReceivedDelegations = async () => {
    const response = await getReceivedVestingShares(currentAccount.username);
    return response.map((item) => ({
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

  const _renderItem = ({ item, index }: { item: DelegationItem; index: number }) => {
    const value = vestsToHp(item.vestingShares, globalProps.hivePerMVests).toFixed(3) + ' HP';
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
              keyExtractor={(item) => item.delegator}
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
