/* eslint-disable react/no-unused-state */
import React, { useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import get from 'lodash/get';
import { useIntl } from 'react-intl';

// Actions and Services
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { markNotifications } from '../../../providers/ecency/ecency';
import { updateUnreadActivityCount } from '../../../redux/actions/accountAction';

// Constants
import ROUTES from '../../../constants/routeNames';

// Components
import NotificationScreen from '../screen/notificationScreen';
import { showProfileModal } from '../../../redux/actions/uiAction';
import { markHiveNotifications } from '../../../providers/hive/dhive';
import bugsnapInstance from '../../../config/bugsnag';
import { useAppSelector } from '../../../hooks';
import { useNotificationsQuery } from '../../../providers/queries';
import { NotificationFilters } from '../../../providers/ecency/ecency.types';
import QUERIES from '../../../providers/queries/queryKeys';

const NotificationContainer = ({ navigation }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const isConnected = useAppSelector((state) => state.application.isConnected);
  const pinCode = useAppSelector((state) => state.application.pin);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const globalProps = useAppSelector((state) => state.account.globalProps);

  const unreadCountRef = useRef(currentAccount.unread_acitivity_count || 0);
  const curUsername = useRef(currentAccount.username);

  const [selectedFilter, setSelectedFilter] = useState<NotificationFilters>(
    NotificationFilters.ACTIVITIES,
  );

  const notificationsQuery = useNotificationsQuery(selectedFilter);

  useEffect(() => {
    queryClient.removeQueries([QUERIES.NOTIFICATIONS.GET]);
    notificationsQuery.refetch();
    curUsername.current = currentAccount.useranme;
  }, [currentAccount.username]);

  useEffect(() => {
    if (currentAccount.unread_activity_count < unreadCountRef.current) {
      queryClient.invalidateQueries([QUERIES.NOTIFICATIONS.GET]);
    }
    unreadCountRef.current = currentAccount.unread_activity_count;
  }, [currentAccount.unread_activity_count]);

  const _getActivities = (loadMore = false) => {
    if (loadMore) {
      console.log('load more notifications');
      notificationsQuery.fetchNextPage();
    } else {
      console.log('refreshing');
      notificationsQuery.remove();
      notificationsQuery.refetch();
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
      markNotifications(data.id).then((result) => {
        const { unread } = result;
        dispatch(updateUnreadActivityCount(unread));
      });
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

  //TODO: handle mark as read mutations
  const _readAllNotification = () => {
    if (!isConnected) {
      return;
    }

    // setIsRefershing(true);

    markNotifications()
      .then(() => {
        // notificationsMap.forEach((notifications, key) => {
        // const updatedNotifications = notifications.map((item) => ({ ...item, read: 1 }));
        // notificationsMap.set(key, updatedNotifications);
        // });

        dispatch(updateUnreadActivityCount(0));
        markHiveNotifications(currentAccount, pinCode)
          .then(() => {
            console.log('Hive notifications marked as Read');
          })
          .catch((err) => {
            bugsnapInstance.notify(err);
          });

        // setNotificationsMap(notificationsMap);
        // setIsRefershing(false);
      })
      .catch(() => {
        Alert.alert(
          intl.formatMessage({ id: 'alert.error' }),
          intl.formatMessage({ d: 'alert.unknow_error' }),
        );

        // setIsRefershing(false);
      });
  };

  const _handleOnPressLogin = () => {
    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  const _changeSelectedFilter = async (value) => {
    setSelectedFilter(value);
  };

  console.log('query data: ', notificationsQuery.data);
  const _notifications = notificationsQuery.data?.pages?.flatMap((page) => page);

  return (
    <NotificationScreen
      getActivities={_getActivities}
      notifications={_notifications}
      navigateToNotificationRoute={_navigateToNotificationRoute}
      handleOnUserPress={_handleOnUserPress}
      readAllNotification={_readAllNotification}
      handleLoginPress={_handleOnPressLogin}
      isNotificationRefreshing={notificationsQuery.isFetching}
      isLoggedIn={isLoggedIn}
      changeSelectedFilter={_changeSelectedFilter}
      globalProps={globalProps}
      isLoading={notificationsQuery.isFetchingNextPage}
    />
  );
};

export default NotificationContainer;
/* eslint-enable */
