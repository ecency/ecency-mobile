import { get } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import Animated, { FadeOutUp, SlideInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '..';
import UserAvatar from '../userAvatar';
import ROUTES from '../../constants/routeNames';
import { FOREGROUND_BANNER_TYPES } from '../../constants/notificationTypes';

// Styles
import styles from './styles';
import RootNavigation from '../../navigation/rootNavigation';

interface RemoteMessage {
  data: {
    id: string;
    source: string;
    target: string;
    permlink1: string;
    permlink2: string;
    permlink3: string;
    amount?: string;
    // Two producers feed this component with DIFFERENT vocabularies: FCM carries
    // enotify's push strings (singular 'delegation' / 'payout') while the websocket
    // bridge in applicationContainer carries str_activity_type's ('delegations' /
    // 'payouts'). Both spellings are accepted rather than renamed, so neither
    // producer silently stops matching.
    type:
      | 'mention'
      | 'reply'
      | 'transfer'
      | 'delegation'
      | 'delegations'
      | 'scheduled_published'
      | 'payout'
      | 'payouts'
      | 'account_update'
      | 'weekly_earnings'
      | 'follow'
      | 'unfollow'
      | 'ignore'
      | 'blacklist';
  };
  notification: {
    body: string;
    title: string;
  };
}

interface Props {
  remoteMessage: RemoteMessage;
}

const ForegroundNotification = ({ remoteMessage }: Props) => {
  const intl = useIntl();
  const insets = useSafeAreaInsets();
  const hideTimeoutRef = useRef<any>(null);

  const [duration] = useState(5000);
  const [activeId, setActiveId] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (remoteMessage) {
      const { source, target, type, id, amount } = remoteMessage.data;
      if (activeId !== id && (FOREGROUND_BANNER_TYPES as readonly string[]).includes(type)) {
        let titleText = '';
        let bodyText = '';

        switch (type) {
          case 'reply':
            titleText = `${intl.formatMessage({ id: 'notification.reply_on' })} @${target}`;
            bodyText = intl.formatMessage({ id: 'notification.reply_body' });
            break;
          case 'mention':
            titleText = `${intl.formatMessage({ id: 'notification.mention_on' })} @${target}`;
            bodyText = intl.formatMessage({ id: 'notification.reply_body' });
            break;
          case 'transfer':
            titleText = `@${source} ${intl.formatMessage({ id: 'notification.transfer' })}`;
            bodyText =
              amount ||
              intl.formatMessage({
                id: 'notification.amount_unknown',
                defaultMessage: 'Amount unavailable',
              });
            break;
          case 'delegation':
          case 'delegations':
            titleText = `@${source} ${intl.formatMessage({ id: 'notification.delegations' })}`;
            bodyText =
              amount ||
              intl.formatMessage({
                id: 'notification.amount_unknown',
                defaultMessage: 'Amount unavailable',
              });
            break;
          case 'scheduled_published':
            titleText = intl.formatMessage({ id: 'notification.scheduled_published_title' });
            // the delivered payload body carries the post title; keep it when present
            bodyText =
              remoteMessage.notification?.body ||
              intl.formatMessage({ id: 'notification.scheduled_published_body' });
            break;
          // Both producers already build a correct title and body for these: enotify's
          // push/format.py for FCM, and the websocket bridge in applicationContainer.
          // Prefer what was delivered rather than rebuilding the interpolated strings
          // here, the way scheduled_published already does for its body.
          case 'payout':
          case 'payouts':
            titleText =
              remoteMessage.notification?.title ||
              intl.formatMessage({ id: 'notification.payouts' }, { amount: amount || '' });
            bodyText = remoteMessage.notification?.body || '';
            break;
          case 'weekly_earnings':
            titleText =
              remoteMessage.notification?.title ||
              intl.formatMessage(
                { id: 'notification.weekly_earnings' },
                { amount: amount || '', breakdown: '' },
              );
            bodyText = remoteMessage.notification?.body || '';
            break;
          case 'account_update':
            titleText =
              remoteMessage.notification?.title ||
              intl.formatMessage({ id: 'notification.account_update' });
            bodyText = remoteMessage.notification?.body || '';
            break;
          case 'follow':
            titleText = `@${source} ${intl.formatMessage({ id: 'notification.follow' })}`;
            break;
          case 'unfollow':
            titleText = `@${source} ${intl.formatMessage({ id: 'notification.unfollow' })}`;
            break;
          case 'ignore':
            titleText = `@${source} ${intl.formatMessage({ id: 'notification.ignore' })}`;
            break;
          case 'blacklist':
            titleText = `@${source} ${intl.formatMessage({ id: 'notification.blacklist' })}`;
            break;
        }

        setActiveId(id);
        setUsername(source);
        setTitle(titleText);
        setBody(bodyText);
        show();
      }
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [remoteMessage]);

  const show = () => {
    setIsVisible(true);
    hideTimeoutRef.current = setTimeout(() => {
      hide();
    }, duration);
  };

  const hide = async () => {
    setIsVisible(false);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  const _onPress = () => {
    const { data } = remoteMessage;
    const { type } = data;

    if (
      type === 'transfer' ||
      type === 'delegation' ||
      type === 'delegations' ||
      type === 'payout' ||
      type === 'payouts' ||
      type === 'weekly_earnings'
    ) {
      // Navigate to wallet for financial transactions
      RootNavigation.navigate({ name: ROUTES.TABBAR.WALLET });
    } else if (type === 'account_update') {
      // Informational only: the app has no account-update destination, and the post
      // branch below would open an empty permlink. Dismiss without navigating.
    } else if (
      type === 'follow' ||
      type === 'unfollow' ||
      type === 'ignore' ||
      type === 'blacklist'
    ) {
      // The follow family carries no permlink. Falling through to the post branch
      // below navigated to POST with an empty permlink, which opens nothing.
      const source = get(data, 'source', '');
      RootNavigation.navigate({
        name: ROUTES.SCREENS.PROFILE,
        params: { username: source },
        key: source,
      });
    } else {
      // Navigate to post for reply/mention
      const fullPermlink =
        get(data, 'permlink1', '') + get(data, 'permlink2', '') + get(data, 'permlink3', '');

      RootNavigation.navigate({
        name: ROUTES.SCREENS.POST,
        params: {
          author: get(data, 'source', ''),
          permlink: fullPermlink,
        },
        key: fullPermlink,
      });
    }
    hide();
  };

  const _containerStyle = { ...styles.container, marginTop: insets.top };

  return (
    isVisible && (
      <Animated.View style={_containerStyle} entering={SlideInUp.duration(500)} exiting={FadeOutUp}>
        <View style={styles.contentContainer}>
          <TouchableOpacity onPress={_onPress} style={{ flexShrink: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <UserAvatar username={username} />

              <View style={{ flexShrink: 1 }}>
                <Text style={styles.text} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.text} numberOfLines={1}>
                  {body}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <IconButton name="close" color="white" size={28} onPress={hide} />
        </View>
      </Animated.View>
    )
  );
};

export default ForegroundNotification;
