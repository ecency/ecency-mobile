import { get } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import Animated, { FadeOutUp, SlideInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '..';
import UserAvatar from '../userAvatar';
import ROUTES from '../../constants/routeNames';

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
    type: 'mention' | 'reply' | 'transfer' | 'delegations';
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
      if (
        activeId !== id &&
        (type === 'reply' || type === 'mention' || type === 'transfer' || type === 'delegations')
      ) {
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
          case 'delegations':
            titleText = `@${source} ${intl.formatMessage({ id: 'notification.delegations' })}`;
            bodyText =
              amount ||
              intl.formatMessage({
                id: 'notification.amount_unknown',
                defaultMessage: 'Amount unavailable',
              });
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

    let routeName;
    let params;
    let key;

    if (type === 'transfer' || type === 'delegations') {
      // Navigate to wallet for financial transactions
      routeName = ROUTES.TABBAR.WALLET;
    } else {
      // Navigate to post for reply/mention
      const fullPermlink =
        get(data, 'permlink1', '') + get(data, 'permlink2', '') + get(data, 'permlink3', '');

      params = {
        author: get(data, 'source', ''),
        permlink: fullPermlink,
      };
      key = fullPermlink;
      routeName = ROUTES.SCREENS.POST;
    }

    RootNavigation.navigate({
      name: routeName,
      params,
      key,
    });
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
