import { useEffect, useMemo, useRef } from 'react';
import Orientation, { useDeviceOrientationChange } from 'react-native-orientation-locker';
import { isLandscape } from 'react-native-device-info';
import EStyleSheet from 'react-native-extended-stylesheet';
import {
  Appearance,
  AppState,
  NativeEventSubscription,
  Platform,
  useColorScheme,
} from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import { isEmpty, some, get } from 'lodash';
import messaging from '@react-native-firebase/messaging';
import BackgroundTimer from 'react-native-background-timer';
import FastImage from 'react-native-fast-image';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { setDeviceOrientation, setLockedOrientation } from '../../../redux/actions/uiAction';
import { orientations } from '../../../redux/constants/orientationsConstants';
import isAndroidTablet from '../../../utils/isAndroidTablet';
import darkTheme from '../../../themes/darkTheme';
import lightTheme from '../../../themes/lightTheme';
import { useUserActivityMutation } from '../../../providers/queries';
import THEME_OPTIONS from '../../../constants/options/theme';
import { setCurrency, setIsDarkTheme } from '../../../redux/actions/applicationActions';
import { markNotifications } from '../../../providers/ecency/ecency';
import { updateUnreadActivityCount } from '../../../redux/actions/accountAction';
import RootNavigation from '../../../navigation/rootNavigation';
import ROUTES from '../../../constants/routeNames';

export const useInitApplication = () => {
  const dispatch = useAppDispatch();
  const { isDarkTheme, colorTheme, isPinCodeOpen, currency } = useAppSelector(
    (state) => state.application,
  );

  const systemColorScheme = useColorScheme();

  const appState = useRef(AppState.currentState);
  const appStateSubRef = useRef<NativeEventSubscription | null>(null);
  const lowMemSubRef = useRef<NativeEventSubscription | null>(null);

  const notifeeEventRef = useRef<any>(null);
  const messagingEventRef = useRef<any>(null);

  const userActivityMutation = useUserActivityMutation();

  // equivalent of componentWillMount and update on props,
  // benefit is it does not wait for useEffect callback
  useMemo(() => {
    EStyleSheet.build(isDarkTheme ? darkTheme : lightTheme);
  }, [isDarkTheme]);

  useDeviceOrientationChange((o) => {
    // Handle device orientation change
    console.log('device orientation changed : ', o);
    dispatch(setDeviceOrientation(o));
  });

  useEffect(() => {
    BackgroundTimer.start(); // ref: https://github.com/ocetnik/react-native-background-timer#ios

    appStateSubRef.current = AppState.addEventListener('change', _handleAppStateChange);
    lowMemSubRef.current = AppState.addEventListener('memoryWarning', _handleLowMemoryWarning);

    // check for device landscape status and lcok orientation accordingly. Fix for orientation bug on android tablet devices
    isLandscape().then((isLandscape) => {
      if (isLandscape && isAndroidTablet()) {
        Orientation.lockToLandscape();
        dispatch(setLockedOrientation(orientations.LANDSCAPE));
      } else {
        Orientation.lockToPortrait();
        dispatch(setLockedOrientation(orientations.PORTRAIT));
      }
    });

    userActivityMutation.lazyMutatePendingActivities();

    // update fiat currency rate usd:fiat
    dispatch(setCurrency(currency.currency));

    _initPushListener();

    return _cleanup;
  }, []);

  useEffect(() => {
    if (THEME_OPTIONS[colorTheme].value === null) {
      // workaround to avoid hook callback glitch on iOS causing momentary theme flash
      setTimeout(() => {
        const sysDarkTheme = Appearance.getColorScheme() === 'dark';
        if (sysDarkTheme !== isDarkTheme) {
          dispatch(setIsDarkTheme(sysDarkTheme));
        }
      }, 200);
    }
  }, [systemColorScheme]);

  const _cleanup = () => {
    if (appStateSubRef.current) {
      appStateSubRef.current.remove();
    }

    if (lowMemSubRef.current) {
      lowMemSubRef.current.remove();
    }

    if (notifeeEventRef.current) {
      notifeeEventRef.current();
    }

    if (messagingEventRef.current) {
      messagingEventRef.current();
    }

    BackgroundTimer.stop(); // ref: https://github.com/ocetnik/react-native-background-timer#ios
  };

  const _initPushListener = async () => {
    await notifee.requestPermission();

    notifee.setBadgeCount(0);
    notifee.cancelAllNotifications();

    // on android messaging event work fine for both background and quite state
    // while notifee events do not fuction as expected
    if (Platform.OS === 'android') {
      messagingEventRef.current = messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('Notificaiton opened app', remoteMessage);
        _pushNavigate(remoteMessage);
      });

      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('Initial Notification', initialNotification);
        _pushNavigate(initialNotification);
      }
    } else if (Platform.OS === 'ios') {
      // for ios, notifee events work while messaging event are malfunctioning, the foreground event
      // on ios is called if user opens/starts app from notification
      notifeeEventRef.current = notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
          _pushNavigate(detail.notification);
        }
      });
    }
  };

  const _handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      userActivityMutation.lazyMutatePendingActivities();
    }

    appState.current = nextAppState;
  };

  const _handleLowMemoryWarning = () => {
    FastImage.clearMemoryCache();
  };

  const _pushNavigate = (notification) => {
    let params = null;
    let key = null;
    let routeName = null;

    if (notification) {
      const push = get(notification, 'data');
      const type = get(push, 'type', '');
      const fullPermlink =
        get(push, 'permlink1', '') + get(push, 'permlink2', '') + get(push, 'permlink3', '');
      // const username = get(push, 'target', '');
      const activity_id = get(push, 'id', '');

      switch (type) {
        case 'vote':
        case 'unvote':
          params = {
            author: get(push, 'target', ''),
            permlink: fullPermlink,
          };
          key = fullPermlink;
          routeName = ROUTES.SCREENS.POST;
          break;
        case 'mention':
          params = {
            author: get(push, 'source', ''),
            permlink: fullPermlink,
          };
          key = fullPermlink;
          routeName = ROUTES.SCREENS.POST;
          break;

        case 'follow':
        case 'unfollow':
        case 'ignore':
          params = {
            username: get(push, 'source', ''),
          };
          key = get(push, 'source', '');
          routeName = ROUTES.SCREENS.PROFILE;
          break;

        case 'reblog':
          params = {
            author: get(push, 'target', ''),
            permlink: fullPermlink,
          };
          key = fullPermlink;
          routeName = ROUTES.SCREENS.POST;
          break;

        case 'favorite':
        case 'bookmark':
        case 'reply':
          params = {
            author: get(push, 'source', ''),
            permlink: fullPermlink,
          };
          key = fullPermlink;
          routeName = ROUTES.SCREENS.POST;
          break;

        case 'transfer':
          routeName = ROUTES.TABBAR.WALLET;
          params = {
            activePage: 2,
          };
          break;

        case 'inactive':
          routeName = ROUTES.SCREENS.EDITOR;
          key = push.source || 'inactive';
          break;

        default:
          break;
      }

      markNotifications(activity_id).then((result) => {
        dispatch(updateUnreadActivityCount(result.unread));
      });

      if (!some(params, isEmpty)) {
        if (isPinCodeOpen) {
          RootNavigation.navigate({
            name: ROUTES.SCREENS.PINCODE,
            params: {
              navigateTo: routeName,
              navigateParams: params,
              navigateKey: key,
              hideCloseButton: true,
            },
          });
        } else {
          RootNavigation.navigate({
            name: routeName,
            params,
            key,
          });
        }
      }
    }
  };
};
