/* eslint-disable react/no-unused-state */
import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import get from 'lodash/get';
import { useIntl } from 'react-intl';

// Actions and Services
import { unionBy } from 'lodash';
import { useEffect } from 'react';
import { getNotifications, markNotifications } from '../../../providers/ecency/ecency';
import { updateUnreadActivityCount } from '../../../redux/actions/accountAction';

// Constants
import ROUTES from '../../../constants/routeNames';

// Components
import NotificationScreen from '../screen/notificationScreen';
import { showProfileModal } from '../../../redux/actions/uiAction';
import { markHiveNotifications } from '../../../providers/hive/dhive';
import bugsnapInstance from '../../../config/bugsnag';
import { useAppSelector } from '../../../hooks';

const NotificationContainer = ({ navigation }) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const isConnected = useAppSelector((state) => state.application.isConnected);
  const pinCode = useAppSelector((state) => state.application.pin);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const globalProps = useAppSelector((state) => state.account.globalProps);

  const unreadCountRef = useRef(currentAccount.unread_acitivity_count || 0);

  const [notificationsMap, setNotificationsMap] = useState(new Map());
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [isRefreshing, setIsRefershing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('activities');
  const [endOfNotification, setEndOfNotification] = useState(false);

  useEffect(() => {
    setEndOfNotification(false);
    setNotificationsMap(new Map());
    _getActivities(selectedFilter);
  }, [currentAccount.username]);

  useEffect(() => {
    if (currentAccount.unread_activity_count > unreadCountRef.current) {
      notificationsMap.forEach((value, key) => {
        console.log('fetching new activities for ', key);
        _getActivities(key, false, true);
      });
    }
    unreadCountRef.current = currentAccount.unread_activity_count;
  }, [currentAccount.unread_activity_count]);

  const _getActivities = (type = 'activities', loadMore = false, loadUnread = false) => {
    const since = loadMore ? lastNotificationId : null;

    if (isLoading) {
      return;
    }

    if (!endOfNotification || !loadMore || loadUnread) {
      setIsLoading(true);
      setIsRefershing(!loadMore);
      getNotifications({ filter: type, since: since, limit: 20 })
        .then((res) => {
          const lastId = res.length > 0 ? [...res].pop().id : null;

          if (loadMore && (lastId === lastNotificationId || res.length === 0)) {
            setEndOfNotification(true);
            setIsRefershing(false);
            setIsLoading(false);
          } else {
            console.log('');
            const stateNotifications = notificationsMap.get(type) || [];
            const _notifications = loadMore
              ? unionBy(stateNotifications, res, 'id')
              : loadUnread
              ? unionBy(res, stateNotifications, 'id')
              : res;
            notificationsMap.set(type, _notifications);
            setNotificationsMap(notificationsMap);
            setLastNotificationId(lastId);
            setIsRefershing(false);
            setIsLoading(false);
          }
        })
        .catch(() => {
          setIsRefershing(false);
          setIsLoading(false);
        });
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

  const _readAllNotification = () => {
    if (!isConnected) {
      return;
    }

    setIsRefershing(true);

    markNotifications()
      .then(() => {
        notificationsMap.forEach((notifications, key) => {
          const updatedNotifications = notifications.map((item) => ({ ...item, read: 1 }));
          notificationsMap.set(key, updatedNotifications);
        });

        dispatch(updateUnreadActivityCount(0));
        markHiveNotifications(currentAccount, pinCode)
          .then(() => {
            console.log('Hive notifications marked as Read');
          })
          .catch((err) => {
            bugsnapInstance.notify(err);
          });

        setNotificationsMap(notificationsMap);
        setIsRefershing(false);
      })
      .catch(() => {
        Alert.alert(
          intl.formatMessage({ id: 'alert.error' }),
          intl.formatMessage({ d: 'alert.unknow_error' }),
        );

        setIsRefershing(false);
      });
  };

  const _handleOnPressLogin = () => {
    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  const _changeSelectedFilter = async (value) => {
    setSelectedFilter(value);
    setEndOfNotification(false);
  };

  const _notifications = notificationsMap.get(selectedFilter) || [];
  return (
    <NotificationScreen
      getActivities={_getActivities}
      notifications={_notifications}
      navigateToNotificationRoute={_navigateToNotificationRoute}
      handleOnUserPress={_handleOnUserPress}
      readAllNotification={_readAllNotification}
      handleLoginPress={_handleOnPressLogin}
      isNotificationRefreshing={isRefreshing}
      isLoggedIn={isLoggedIn}
      changeSelectedFilter={_changeSelectedFilter}
      globalProps={globalProps}
      isLoading={isLoading}
    />
  );
};

export default NotificationContainer;
/* eslint-enable */
