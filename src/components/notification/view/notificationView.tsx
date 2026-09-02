import React, { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { ActivityIndicator, FlatList, Text, View, RefreshControl } from 'react-native';
// Constants

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { NotificationLine } from '../..';
import { ListPlaceHolder, QueryErrorRetry } from '../../basicUIElements';
import { FilterBar } from '../../filterBar';

// Styles
import globalStyles from '../../../globalStyles';
import { useAppSelector } from '../../../hooks';
import { selectIsDarkTheme } from '../../../redux/selectors';
import styles from './notificationStyles';

// Each `key` must match a NotificationFilters enum value (passed straight to the
// notifications query) and have a `notification.filters.<key>` locale string.
// Labels live under their own `filters` namespace rather than reusing
// `notification.<key>`: several of those are notification BODY strings
// (`payouts` is "Payout received: ${amount}", `delegations` is "delegated"), so
// using them as labels renders template text in the dropdown.
const FILTERS = [
  { key: 'activities' },
  { key: 'replies' },
  { key: 'mentions' },
  { key: 'rvotes' },
  { key: 'follows' },
  { key: 'reblogs' },
  { key: 'transfers' },
  { key: 'delegations' },
  { key: 'nfavorites' },
  { key: 'nbookmarks' },
  { key: 'tags' },
  { key: 'payouts' },
  { key: 'scheduled_published' },
  { key: 'account_updates' },
  { key: 'weekly_earnings' },
];

interface Props {
  notifications: any[];
  isLoading: boolean;
  isFetching: boolean;
  /** The list failed and there is nothing cached to show instead. */
  isError?: boolean;
  error?: unknown;
  isNotificationRefreshing: boolean;
  globalProps: any;
  handleOnUserPress: (username?: string) => void;
  readAllNotification: () => void;
  getActivities: (loadMore?: boolean) => void;
  changeSelectedFilter: (filter?: string, index?: number) => void;
  navigateToNotificationRoute: () => void;
  listRef?: React.RefObject<FlatList>;
}

const NotificationView = ({
  notifications,
  isLoading,
  isFetching,
  isError,
  error,
  isNotificationRefreshing,
  globalProps,
  handleOnUserPress,
  readAllNotification,
  getActivities,
  changeSelectedFilter,
  navigateToNotificationRoute,
  listRef: externalListRef,
}: Props) => {
  const intl = useIntl();

  const internalListRef = useRef<any>(null);
  const listRef = externalListRef || internalListRef;

  const isDarkTheme = useAppSelector(selectIsDarkTheme);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Prevent onEndReached from firing on mount before user scrolls
  const onEndReachedCalledDuringMomentum = useRef(true);

  const _handleOnDropdownSelect = async (index: any) => {
    const _selectedFilter = FILTERS[index].key;
    setSelectedIndex(index);
    changeSelectedFilter(_selectedFilter, index);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    // Reset momentum flag when filter changes to prevent immediate fetch
    onEndReachedCalledDuringMomentum.current = true;
  };

  const _handleOnEndReached = () => {
    // Only trigger load more if user has actually scrolled (momentum began)
    if (!onEndReachedCalledDuringMomentum.current) {
      getActivities(true);
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

  const _handleMomentumScrollBegin = () => {
    // User started scrolling, allow next onEndReached to trigger
    onEndReachedCalledDuringMomentum.current = false;
  };

  const _renderFooterLoading = () => {
    if (isLoading && notifications.length > 0) {
      return (
        <View style={styles.flatlistFooter}>
          <ActivityIndicator color={EStyleSheet.value('$primaryBlue')} animating />
        </View>
      );
    }
    return null;
  };

  // Order matters: the failure is checked before the loading skeleton, because
  // a query that failed is still `isFetching` for the moment React Query spends
  // settling it, and before the "no activity" copy, which would otherwise claim
  // an empty inbox on a request that never arrived.
  const _renderEmptyComponent = () => {
    if (isError) {
      return (
        <QueryErrorRetry
          error={error}
          onRetry={() => getActivities()}
          isRetrying={isNotificationRefreshing}
        />
      );
    }

    if (isLoading || isFetching || isNotificationRefreshing) {
      return <ListPlaceHolder />;
    }

    return (
      <Text style={globalStyles.hintText}>
        {intl.formatMessage({ id: 'notification.noactivity' })}
      </Text>
    );
  };

  const _renderItem = ({ item }: any) => (
    <NotificationLine
      notification={item}
      handleOnPressNotification={navigateToNotificationRoute}
      handleOnUserPress={() => {
        handleOnUserPress(item.source);
      }}
      globalProps={globalProps}
    />
  );

  return (
    <View style={styles.container}>
      <FilterBar
        options={FILTERS.map((item) =>
          intl.formatMessage({ id: `notification.filters.${item.key}` }).toUpperCase(),
        )}
        onDropdownSelect={_handleOnDropdownSelect}
        rightIconName="playlist-add-check"
        rightIconType="MaterialIcons"
        selectedOptionIndex={selectedIndex}
        onRightIconPress={readAllNotification}
      />

      <FlatList
        ref={listRef}
        data={notifications}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onEndReached={_handleOnEndReached}
        onEndReachedThreshold={0.3}
        onMomentumScrollBegin={_handleMomentumScrollBegin}
        ListFooterComponent={_renderFooterLoading}
        ListEmptyComponent={_renderEmptyComponent}
        contentContainerStyle={styles.listContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isNotificationRefreshing}
            onRefresh={() => getActivities()}
            progressBackgroundColor="#357CE6"
            tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
            titleColor="#fff"
            colors={['#fff']}
          />
        }
        renderItem={_renderItem}
      />
    </View>
  );
};

export default NotificationView;
