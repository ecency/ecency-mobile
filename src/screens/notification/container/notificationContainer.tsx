/* eslint-disable react/no-unused-state */
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import get from 'lodash/get';

// Actions and Services
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Constants
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import ROUTES from '../../../constants/routeNames';

// Components
import NotificationScreen from '../screen/notificationScreen';
import { showProfileModal } from '../../../redux/actions/uiAction';
import { useAppSelector } from '../../../hooks';
import { useNotificationReadMutation, useNotificationsQuery } from '../../../providers/queries';
import { NotificationFilters } from '../../../providers/ecency/ecency.types';
import QUERIES from '../../../providers/queries/queryKeys';

const NotificationContainer = ({ navigation }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const isConnected = useAppSelector((state) => state.application.isConnected);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const globalProps = useAppSelector((state) => state.account.globalProps);

  const unreadCountRef = useRef(currentAccount.unread_acitivity_count || 0);
  const curUsername = useRef(currentAccount.username);

  const notificationReadMutation = useNotificationReadMutation();
  const allNotificationsQuery = useNotificationsQuery(NotificationFilters.ACTIVITIES);
  const repliesNotificationsQuery = useNotificationsQuery(NotificationFilters.REPLIES);
  const mentiosnNotificationsQuery = useNotificationsQuery(NotificationFilters.MENTIONS);

  const [selectedFilter, setSelectedFilter] = useState(NotificationFilters.ACTIVITIES);

  const selectedQuery =
    selectedFilter === NotificationFilters.REPLIES
      ? repliesNotificationsQuery
      : selectedFilter === NotificationFilters.MENTIONS
      ? mentiosnNotificationsQuery
      : allNotificationsQuery;

  useEffect(() => {
    if (curUsername.current !== currentAccount.username) {
      queryClient.removeQueries([QUERIES.NOTIFICATIONS.GET]);
      selectedQuery.refresh();
      curUsername.current = currentAccount.useranme;
    }
  }, [currentAccount.username]);

  useEffect(() => {
    if (currentAccount.unread_activity_count > unreadCountRef.current) {
      queryClient.invalidateQueries([QUERIES.NOTIFICATIONS.GET]);
      // TODO: fetch new notifications instead
    }
    unreadCountRef.current = currentAccount.unread_activity_count;
  }, [currentAccount.unread_activity_count]);

  const _getActivities = (loadMore = false) => {
    if (loadMore) {
      console.log('load more notifications');
      selectedQuery.fetchNextPage();
    } else {
      console.log('refreshing');
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
    } else if (type === 'transfer') {
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
    dispatch(showProfileModal(username));
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
      isLoading={selectedQuery.isLoading}
    />
  );
};

export default gestureHandlerRootHOC(NotificationContainer);
/* eslint-enable */
