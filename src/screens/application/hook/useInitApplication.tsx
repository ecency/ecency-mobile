import { useEffect, useMemo, useRef } from 'react';
import Orientation, { useDeviceOrientationChange } from 'react-native-orientation-locker';
import { isLandscape } from 'react-native-device-info';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Appearance, AppState, Linking, useColorScheme } from 'react-native';
import notifee from '@notifee/react-native';
import { some, get } from 'lodash';
import { getMessaging } from '@react-native-firebase/messaging';
import BackgroundTimer from 'react-native-background-timer';
import { Image as ExpoImage } from 'expo-image';
import { setProxyBase } from '@ecency/render-helper';
import { ConfigManager } from '@ecency/sdk';
import { focusManager } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector, useLinkProcessor } from '../../../hooks';
import { setDeviceOrientation, setLockedOrientation } from '../../../redux/actions/uiAction';
import { orientations } from '../../../redux/constants/orientationsConstants';
import isAndroidTablet from '../../../utils/isAndroidTablet';
import darkTheme from '../../../themes/darkTheme';
import lightTheme from '../../../themes/lightTheme';
import {
  useAnnouncementsQuery,
  useUserActivityMutation,
  useNotificationReadMutation,
} from '../../../providers/queries';
import THEME_OPTIONS from '../../../constants/options/theme';
import {
  setCurrency,
  setIsDarkTheme,
  recordAppSession,
} from '../../../redux/actions/applicationActions';
import RootNavigation, { NavigateOptions } from '../../../navigation/rootNavigation';
import { PinCodeParams } from '../../../navigation/types';
import ROUTES from '../../../constants/routeNames';
import { selectCurrentAccount } from '../../../redux/selectors';

export const useInitApplication = () => {
  const dispatch = useAppDispatch();
  const linkProcessor = useLinkProcessor();

  const { isDarkTheme, colorTheme, isPinCodeOpen, currency, imageServer } = useAppSelector(
    (state) => state.application,
  );
  const currentAccount = useAppSelector(selectCurrentAccount);
  const systemColorScheme = useColorScheme();

  const appState = useRef(AppState.currentState);
  const appStateSubRef = useRef<any>(null);
  const lowMemSubRef = useRef<any>(null);

  const notifeeEventRef = useRef<any>(null);
  const messagingEventRef = useRef<any>(null);

  const userActivityMutation = useUserActivityMutation();
  const markNotificationsReadMutation = useNotificationReadMutation();
  useAnnouncementsQuery();

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

  // Apply saved image server preference on startup and when it changes
  useEffect(() => {
    if (imageServer) {
      setProxyBase(imageServer);
      ConfigManager.setImageHost(imageServer);
    }
  }, [imageServer]);

  // Count one session per real app launch. Kept mount-only (empty deps) — not in
  // the currentAccount effect below — so switching accounts doesn't inflate the
  // session count that gates the review prompt. Foreground returns are counted
  // separately in _handleAppStateChange.
  useEffect(() => {
    dispatch(recordAppSession());
  }, [dispatch]);

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
  }, [currentAccount.name]);

  useEffect(() => {
    const sub = Linking.addEventListener('url', (event) => {
      linkProcessor.handleLink(event.url);
    });

    return () => {
      sub.remove();
    };
  }, [currentAccount]);

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

    messagingEventRef.current = getMessaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notificaiton opened app', remoteMessage);
      _pushNavigate(remoteMessage);
    });

    const initialNotification = await getMessaging().getInitialNotification();
    if (initialNotification) {
      console.log('Initial Notification', initialNotification);
      _pushNavigate(initialNotification);
    }

    // NOTE: notifee seems to have been malfunctioning, avoid using for testing
    // } else if (Platform.OS === 'android') {
    //   // for ios, notifee events work while messaging event are malfunctioning, the foreground event
    //   // on ios is called if user opens/starts app from notification
    //   notifee.onBackgroundEvent(async({ type, detail }) => {
    //     if (type === EventType.PRESS) {
    //       console.log('User pressed the notification.', detail.notification);
    //       _pushNavigate(detail.notification);
    //     }
    //   });

    // }
  };

  const _handleAppStateChange = (nextAppState: any) => {
    // React Native has no window focus events, so React Query's focus tracking is
    // inert until something drives it. Without this, `refetchOnWindowFocus` is not
    // merely disabled by default, it has no signal to act on at all, and a screen
    // that stays mounted (the leaderboard tab, the perks card) keeps serving
    // whatever it fetched before the app was backgrounded. Only the queries that
    // opt in refetch, so this does not wake the whole cache on every resume.
    focusManager.setFocused(nextAppState === 'active');

    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      userActivityMutation.lazyMutatePendingActivities();
      dispatch(recordAppSession());
    }

    appState.current = nextAppState;
  };

  const _handleLowMemoryWarning = () => {
    ExpoImage.clearMemoryCache();
  };

  const _pushNavigate = (notification: any) => {
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

        case 'scheduled_published':
          params = {
            author: get(push, 'source', ''),
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

        case 'tag':
        case 'tags':
          // A single post opens like a favourite author's; a bundle has no post and
          // opens the tag feed. The tag is held to its on-chain shape first, so a
          // forged payload cannot open anything but a tag feed.
          if (fullPermlink) {
            params = {
              author: get(push, 'source', ''),
              permlink: fullPermlink,
            };
            key = fullPermlink;
            routeName = ROUTES.SCREENS.POST;
          } else if (/^[a-z0-9-]{1,32}$/.test(get(push, 'tag', ''))) {
            params = { tag: get(push, 'tag', '') };
            key = get(push, 'tag', '');
            routeName = ROUTES.SCREENS.TAG_RESULT;
          }
          break;

        case 'transfer':
          routeName = ROUTES.TABBAR.WALLET;
          break;

        case 'inactive':
          routeName = ROUTES.SCREENS.EDITOR;
          key = push.source || 'inactive';
          break;

        case 'spin':
          // The spin reminder is now the daily streak/quests reminder -> perks dashboard.
          routeName = ROUTES.SCREENS.PERKS;
          break;

        case 'hiveuri':
          if (push.hiveUri) {
            linkProcessor.handleLink(push.hiveUri);
          }
          break;

        default:
          break;
      }

      // Mark notification as read (mutation handles Redux update in onSuccess)
      if (activity_id) {
        markNotificationsReadMutation.mutate(activity_id);
      }

      // Only an empty *string* param (e.g. missing author/permlink) should block navigation.
      // This replaced a lodash isEmpty check, which reported numeric params as empty and so
      // blocked any notification that carried one.
      const _hasEmptyStringParam = some(params, (v) => typeof v === 'string' && v.trim() === '');
      if (routeName && !_hasEmptyStringParam) {
        if (isPinCodeOpen) {
          // routeName and params are set together per notification type in the switch above,
          // but they are separate locals by the time they get here, so the pairing cannot be
          // checked. The casts are the seam: everything either side of them is typed.
          RootNavigation.navigate({
            name: ROUTES.SCREENS.PINCODE,
            params: {
              navigateTo: routeName,
              navigateParams: params,
              navigateKey: key,
              hideCloseButton: true,
            } as PinCodeParams,
          });
        } else {
          RootNavigation.navigate({
            name: routeName,
            params,
            key,
          } as NavigateOptions);
        }
      }
    }
  };
};
