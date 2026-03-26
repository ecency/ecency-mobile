import React, { useRef, useState } from 'react';
import get from 'lodash/get';

// Actions and Services
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Constants
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { SheetManager } from 'react-native-actions-sheet';
import ROUTES from '../../../constants/routeNames';

// Components
import NotificationScreen from '../screen/notificationScreen';
import { useAppSelector } from '../../../hooks';
import { useNotificationReadMutation, useNotificationsQuery } from '../../../providers/queries';
import { NotificationFilters } from '../../../providers/ecency/ecency.types';
import QUERIES from '../../../providers/queries/queryKeys';
import { SheetNames } from '../../../navigation/sheets';
import {
  selectCurrentAccount,
  selectIsLoggedIn,
  selectGlobalProps,
  selectIsConnected,
} from '../../../redux/selectors';

const NotificationContainer = ({ navigation }) => {
  const queryClient = useQueryClient();

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isConnected = useAppSelector(selectIsConnected);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const globalProps = useAppSelector(selectGlobalProps);

  const unreadCountRef = useRef(currentAccount.unread_acitivity_count || 0);
  const curUsername = useRef(currentAccount.name);

  const notificationReadMutation = useNotificationReadMutation();

  const [selectedFilter, setSelectedFilter] = useState(NotificationFilters.ACTIVITIES);

  // Only fetch the active filter - convert ACTIVITIES to undefined for "all"
  const activeFilter =
    selectedFilter === NotificationFilters.ACTIVITIES ? undefined : selectedFilter;
  const selectedQuery = useNotificationsQuery(activeFilter);

  useEffect(() => {
    if (curUsername.current !== currentAccount.name) {
      queryClient.removeQueries({ queryKey: [QUERIES.NOTIFICATIONS.GET] });
      selectedQuery.refresh();
      curUsername.current = currentAccount.name;
    }
  }, [currentAccount.name]);

  useEffect(() => {
    if (currentAccount.unread_activity_count > unreadCountRef.current) {
      queryClient.invalidateQueries({ queryKey: [QUERIES.NOTIFICATIONS.GET] });
      // TODO: fetch new notifications instead
    }
    unreadCountRef.current = currentAccount.unread_activity_count;
  }, [currentAccount.unread_activity_count]);

  // Refetch when filter changes — the single dynamic query hook doesn't auto-fetch
  // for new filter keys since the component doesn't remount on filter change
  const prevFilterRef = useRef(selectedFilter);
  useEffect(() => {
    if (prevFilterRef.current !== selectedFilter) {
      prevFilterRef.current = selectedFilter;
      selectedQuery.refresh();
    }
  }, [selectedFilter]);

  // Refetch when filter changes — the dynamic query key means React Query
  // may not auto-fetch for a new filter if the observer is reused
  useEffect(() => {
    selectedQuery.refresh();
  }, [activeFilter]);

  const _getActivities = (loadMore = false) => {
    if (loadMore) {
      // Only fetch next page if not already fetching and has more pages
      if (!selectedQuery.isFetchingNextPage && selectedQuery.hasNextPage) {
        selectedQuery.fetchNextPage();
      }
    } else {
      selectedQuery.refresh();
    }
  };

  const _navigateToNotificationRoute = (data) => {
    const type = get(data, 'type');
    const permlink = get(data, 'permlink');
    const author = get(data, 'author');
    let routeName;
    let params;
    let key;
    if (data && !data.read) {
      notificationReadMutation.mutate(data.id);
    }

    if (permlink && author) {
      routeName = ROUTES.SCREENS.POST;
      key = permlink;
      params = {
        author,
        permlink,
      };
    } else if (type === 'follow') {
      routeName = ROUTES.SCREENS.PROFILE;
      key = get(data, 'follower');
      params = {
        username: get(data, 'follower'),
      };
    } else if (type === 'transfer' || type === 'weekly_earnings') {
      routeName = ROUTES.TABBAR.WALLET;
    } else if (type === 'spin') {
      routeName = ROUTES.SCREENS.BOOST;
    } else if (type === 'inactive') {
      routeName = ROUTES.SCREENS.EDITOR;
    }

    if (routeName) {
      navigation.navigate({
        name: routeName,
        params,
        key,
      });
    }
  };

  const _handleOnUserPress = (username) => {
    SheetManager.show(SheetNames.QUICK_PROFILE, {
      payload: {
        username,
      },
    });
  };

  // TODO: handle mark as read mutations
  const _readAllNotification = () => {
    if (!isConnected) {
      return;
    }
    notificationReadMutation.mutate();
  };

  const _handleOnPressLogin = () => {
    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  const _notifications = selectedQuery.data;

  return (
    <NotificationScreen
      getActivities={_getActivities}
      notifications={_notifications}
      navigateToNotificationRoute={_navigateToNotificationRoute}
      handleOnUserPress={_handleOnUserPress}
      readAllNotification={_readAllNotification}
      handleLoginPress={_handleOnPressLogin}
      isNotificationRefreshing={selectedQuery.isRefreshing}
      isLoggedIn={isLoggedIn}
      changeSelectedFilter={setSelectedFilter}
      globalProps={globalProps}
      isLoading={selectedQuery.isLoading || selectedQuery.isPending}
      isFetching={selectedQuery.isFetching}
    />
  );
};

export default gestureHandlerRootHOC(NotificationContainer);
