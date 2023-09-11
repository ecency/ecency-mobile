import React, { ComponentType, JSXElementConstructor, ReactElement, useState } from 'react';
import { useIntl } from 'react-intl';
import { SectionList, Text, RefreshControl, ActivityIndicator } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Transaction } from '../../../components';
import { useAppSelector } from '../../../hooks';
import { CoinActivity } from '../../../redux/reducers/walletReducer';
import styles from './children.styles';
import { limitOrderCancel } from '../../../providers/hive-trade/hiveTrade';
import { walletQueries } from '../../../providers/queries';
import { useQueryClient } from '@tanstack/react-query';
import QUERIES from '../../../providers/queries/queryKeys';
import TransferTypes from '../../../constants/transferTypes';

interface ActivitiesListProps {
  header: ComponentType<any> | ReactElement<any, string | JSXElementConstructor<any>>;
  pendingActivities: CoinActivity[];
  completedActivities: CoinActivity[];
  refreshing: boolean;
  loading: boolean;
  activitiesEnabled: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
  onActionPress: (transferType: string, extraParams?: any) => void;
}

const ActivitiesList = ({
  header,
  loading,
  refreshing,
  completedActivities,
  pendingActivities,
  activitiesEnabled,
  onEndReached,
  onRefresh,
  onActionPress,
}: ActivitiesListProps) => {
  const intl = useIntl();

  const queryClient = useQueryClient();
  const isDarkTheme = useAppSelector((state) => state.ui.isDarkTheme);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinHash = useAppSelector((state) => state.application.pin);

  const [cancellingTrxIndex, setCancellingTrxIndex] = useState(-1);

  const _onCancelPress = async (trxId: number) => {
    try {
      if (trxId) {
        setCancellingTrxIndex(trxId);
        await limitOrderCancel(currentAccount, pinHash, trxId);
        queryClient.invalidateQueries([QUERIES.WALLET.GET_PENDING_REQUESTS]);
        setCancellingTrxIndex(-1);
      }
    } catch (err) {
      setCancellingTrxIndex(-1);
    }
  };

  const _onRepeatPress = async (item: CoinActivity) => {
    if (onActionPress) {
      onActionPress(TransferTypes.TRANSFER_TOKEN, item);
    }
  };

  const _renderActivityItem = ({ item, index }) => {
    return (
      <Transaction
        item={item}
        index={index}
        cancelling={cancellingTrxIndex === item.trxIndex}
        onCancelPress={() => {
          _onCancelPress(item.trxIndex);
        }}
        onRepeatPress={() => _onRepeatPress(item)}
      />
    );
  };

  const sections = [];

  if (pendingActivities && pendingActivities.length) {
    sections.push({
      title: intl.formatMessage({ id: 'wallet.pending_requests' }),
      data: pendingActivities,
    });
  }

  if (activitiesEnabled) {
    sections.push({
      title: intl.formatMessage({ id: 'wallet.activities' }),
      data: completedActivities || [],
    });
  }

  const _refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      progressBackgroundColor="#357CE6"
      tintColor={isDarkTheme ? '#357ce6' : '#96c0ff'}
      titleColor="#fff"
      colors={['#fff']}
    />
  );

  return (
    <SectionList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      sections={sections}
      renderItem={_renderActivityItem}
      keyExtractor={(item, index) => `activity_item_${index}_${item.created}`}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.textActivities}>{title}</Text>
      )}
      ListFooterComponent={
        loading && (
          <ActivityIndicator
            color={EStyleSheet.value('$primaryBlue')}
            style={styles.activitiesFooterIndicator}
          />
        )
      }
      ListHeaderComponent={header}
      refreshControl={_refreshControl}
      onEndReached={() => {
        onEndReached();
      }}
    />
  );
};

export default ActivitiesList;
