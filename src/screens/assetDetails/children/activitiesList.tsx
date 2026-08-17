import React, {
  ComponentType,
  JSXElementConstructor,
  ReactElement,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useIntl } from 'react-intl';
import { SectionList, Text, RefreshControl, ActivityIndicator } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Transaction } from '../../../components';
import { useAppSelector } from '../../../hooks';
import { selectIsDarkTheme } from '../../../redux/selectors';
import { CoinActivity } from '../../../redux/reducers/walletReducer';
import styles from './children.styles';
import { useLimitOrderCancelMutation } from '../../../providers/sdk/mutations';
import TransferTypes from '../../../constants/transferTypes';

interface ActivitiesListProps {
  header: ComponentType<any> | ReactElement<any, string | JSXElementConstructor<any>>;
  pendingActivities: CoinActivity[];
  completedActivities: CoinActivity[];
  refreshing: boolean;
  loading: boolean;
  loadingMore: boolean;
  failed: boolean;
  activitiesEnabled: boolean;
  onEndReached: () => void;
  onRefresh: () => void;
  onActionPress: (transferType: string, extraParams?: any) => void;
}

export const ActivitiesList = ({
  header,
  loading,
  loadingMore,
  refreshing,
  failed,
  completedActivities,
  pendingActivities,
  activitiesEnabled,
  onEndReached,
  onRefresh,
  onActionPress,
}: ActivitiesListProps) => {
  const intl = useIntl();

  const isDarkTheme = useAppSelector(selectIsDarkTheme);
  const limitOrderCancel = useLimitOrderCancelMutation();

  const [cancellingTrxIndex, setCancellingTrxIndex] = useState(-1);

  // Every callback below is stable, and `Transaction` is memoised, so expanding one row or
  // starting a cancel no longer re-renders every other mounted row. A closure built inside
  // renderItem would defeat that on its own, so the row is handed the activity back instead.
  const _onCancelPress = useCallback(async (trxId: number) => {
    try {
      if (trxId != null) {
        setCancellingTrxIndex(trxId);
        await limitOrderCancel.mutateAsync({ orderId: trxId });
        setCancellingTrxIndex(-1);
      }
    } catch (err) {
      setCancellingTrxIndex(-1);
    }
  }, []);

  const _onRepeatPress = useCallback(
    (item: CoinActivity) => {
      if (onActionPress) {
        onActionPress(TransferTypes.TRANSFER, item);
      }
    },
    [onActionPress],
  );

  const _renderActivityItem = useCallback(
    ({ item, index }: any) => (
      <Transaction
        item={item}
        index={index}
        cancelling={cancellingTrxIndex === item.trxIndex}
        onCancelPress={_onCancelPress}
        onRepeatPress={_onRepeatPress}
      />
    ),
    [cancellingTrxIndex, _onCancelPress, _onRepeatPress],
  );

  // Explicit keys: without them the pending section appearing shifts the completed
  // section's identity and re-mounts every visible row.
  const sections = useMemo(() => {
    const next = [];

    if (pendingActivities && pendingActivities.length) {
      next.push({
        key: 'pending',
        title: intl.formatMessage({ id: 'wallet.pending_requests' }),
        data: pendingActivities,
      });
    }

    if (activitiesEnabled) {
      next.push({
        key: 'completed',
        title: intl.formatMessage({ id: 'wallet.activities' }),
        data: completedActivities || [],
      });
    }

    return next;
  }, [pendingActivities, completedActivities, activitiesEnabled, intl]);

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

  // A failed fetch used to be indistinguishable from an empty history: both rendered a
  // bare header with nothing under it. Only claim "no transactions" once a request has
  // actually settled without error.
  const _renderFooter = () => {
    if (loading || loadingMore) {
      return (
        <ActivityIndicator
          color={EStyleSheet.value('$primaryBlue')}
          style={styles.activitiesFooterIndicator}
        />
      );
    }

    if (!activitiesEnabled || completedActivities?.length) {
      return null;
    }

    return (
      <Text style={styles.activitiesPlaceholder}>
        {intl.formatMessage({ id: failed ? 'wallet.activities_failed' : 'wallet.no_activities' })}
      </Text>
    );
  };

  return (
    <SectionList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      sections={sections}
      renderItem={_renderActivityItem}
      // `created` alone repeats across ops mined in the same block, and the index alone
      // shifts as pages prepend, so key on the on-chain identity when there is one.
      keyExtractor={(item, index) =>
        `activity_item_${item.engineTrxId ?? item.trxIndex ?? index}_${item.created}`
      }
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.textActivities}>{title}</Text>
      )}
      ListFooterComponent={_renderFooter()}
      ListHeaderComponent={header}
      refreshControl={_refreshControl}
      // A row is a fixed-height line, so a screen holds well under 15. Rendering the
      // default 10 per batch across an unbounded window is what makes a long history
      // stutter. `removeClippedSubviews` is deliberately not set: it is the flag with a
      // history of blanking rows and swallowing taps on Android, and the win here does not
      // justify that risk.
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={11}
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        onEndReached();
      }}
    />
  );
};
