import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RecurrentTransfer } from 'providers/hive/hive.types';
import moment from 'moment';
import { Alert } from 'react-native';
import ROUTES from '../../../constants/routeNames';
import styles from './children.styles';
import { BasicHeader, Modal, UserListItem } from '../../../components';
import { useAppSelector } from '../../../hooks';
import { walletQueries } from '../../../providers/queries';
import { IconButton } from '../../../components/buttons';

interface RecurrentTransfersModalProps {
  assetId: string;
}

export const RecurrentTransfersModal = forwardRef(
  ({ assetId }: RecurrentTransfersModalProps, ref) => {
    const intl = useIntl();
    const navigation = useNavigation<StackNavigationProp<any>>();

    const recurringActivitiesQuery = walletQueries.useRecurringActivitesQuery(assetId);
    const delRecurrentTransferMutation = walletQueries.useDeleteRecurrentTransferMutation();
    const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);

    const [showModal, setShowModal] = useState(false);

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setShowModal(true);
        recurringActivitiesQuery?.refetch();
      },
    }));

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

    const _btnUnsubscribe = (item: RecurrentTransfer) => {
      const _onPress = () => {
        Alert.alert(
          intl.formatMessage({ id: 'alert.confirm' }),
          intl.formatMessage({ id: 'recurrent.unsubscribe_confirmation' }, { username: item.to }),
          [
            {
              text: intl.formatMessage({ id: 'alert.cancel' }),
              style: 'destructive',
              onPress: () => {
                console.log('cancel pressed');
              },
            },
            {
              text: intl.formatMessage({ id: 'alert.confirm' }),
              onPress: () => {
                delRecurrentTransferMutation.mutate({
                  recurrentTransfer: item,
                });
              },
            },
          ],
        );
      };

      return (
        <IconButton
          size={24}
          style={styles.closeIcon}
          name="close"
          buttonStyle={{ paddingRight: 0 }}
          iconType="MaterialCommunityIcons"
          handleOnPress={_onPress}
        />
      );
    };

    const _renderItem = ({ item, index }: { item: RecurrentTransfer; index: number }) => {
      const value = item.amount;
      const timeString = intl.formatMessage(
        { id: 'recurrent.transfer_in' },
        { time: moment(item.trigger_date).fromNow() },
      );
      const subRightText = intl.formatMessage(
        { id: 'recurrent.remaining_executions' },
        { executions: item.remaining_executions },
      );

      return (
        <UserListItem
          key={item.to}
          index={index}
          username={item.to}
          description={timeString}
          isHasRightItem
          rightText={value}
          subRightText={subRightText}
          isLoggedIn
          handleOnPress={() => _handleOnUserPress(item.to)}
          rightItemRenderer={() => _btnUnsubscribe(item)}
          isClickable
        />
      );
    };

    const _renderContent = () => {
      const data = recurringActivitiesQuery?.data;
      return (
        <>
          <BasicHeader
            backIconName="close"
            isModalHeader={true}
            title={intl.formatMessage({ id: `recurrent.title` }, { total: data?.length || 0 })}
            handleOnPressClose={() => setShowModal(false)}
          />
          <FlatList
            data={data}
            keyExtractor={(item) => `${item.to}-${item.recurrence}`}
            removeClippedSubviews={false}
            renderItem={_renderItem}
            refreshControl={
              <RefreshControl
                refreshing={
                  recurringActivitiesQuery?.isFetching || delRecurrentTransferMutation.isLoading
                }
                onRefresh={recurringActivitiesQuery?.refetch}
                progressBackgroundColor="#357CE6"
                tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
                titleColor="#fff"
                colors={['#fff']}
              />
            }
          />
        </>
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
  },
);
