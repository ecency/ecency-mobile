import { get } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import { IconButton } from '..';
import UserAvatar from '../userAvatar';
import ROUTES from '../../constants/routeNames';
import Animated, { FadeOutUp, SlideInUp } from 'react-native-reanimated';

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
    type: 'mention' | 'reply';
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
  const hideTimeoutRef = useRef<any>(null);

  const [duration] = useState(5000);
  const [activeId, setActiveId] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (remoteMessage) {
      const { source, target, type, id } = remoteMessage.data;
      if (activeId !== id && (type === 'reply' || type === 'mention')) {
        let titlePrefixId = '';
        switch (type) {
          case 'reply':
            titlePrefixId = 'notification.reply_on';
            break;
          case 'mention':
            titlePrefixId = 'notification.mention_on';
            break;
        }

        setActiveId(id);
        setUsername(source);
        setTitle(`${intl.formatMessage({ id: titlePrefixId })} @${target}`);
        setBody(intl.formatMessage({ id: 'notification.reply_body' }));
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
    const fullPermlink =
      get(data, 'permlink1', '') + get(data, 'permlink2', '') + get(data, 'permlink3', '');

    const params = {
      author: get(data, 'source', ''),
      permlink: fullPermlink,
    };
    const key = fullPermlink;
    const name = ROUTES.SCREENS.POST;

    RootNavigation.navigate({
      name,
      params,
      key,
    });
    hide();
  };

  return (
    isVisible && (
      <Animated.View
        style={styles.container}
        entering={SlideInUp.duration(500)}
        exiting={FadeOutUp}
      >
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
