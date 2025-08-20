/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableHighlight, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { UserAvatar } from '../../userAvatar';

import { rcFormatter, vestsToHp } from '../../../utils/conversions';

// Styles
import styles from './notificationLineStyles';

const NotificationLineView = ({
  notification,
  handleOnPressNotification,
  handleOnUserPress,
  globalProps,
}) => {
  const [isRead, setIsRead] = useState(notification.read);
  const intl = useIntl();
  let titleExtra = '';
  let _moreinfo = '';
  useEffect(() => {
    setIsRead(notification.read);
  }, [notification]);

  // Component Functions
  const _handleOnNotificationPress = () => {
    if (!isRead) {
      setIsRead(true);
    }

    handleOnPressNotification(notification);
  };

  if (notification.type === 'transfer' || notification.type === 'delegations') {
    if (notification.type === 'delegations') {
      if (notification.amount.includes('VESTS')) {
        titleExtra = `${
          Math.round(vestsToHp(notification.amount, get(globalProps, 'hivePerMVests')) * 1000) /
          1000
        } HP`;
      } else {
        titleExtra = `${rcFormatter(notification.amount)} RC`;
      }
    } else {
      titleExtra = notification.amount;
    }
  } else if (notification.weight) {
    const _percent = `${parseFloat((notification.weight / 100).toFixed(2))}% `;
    titleExtra = _percent;
  }

  const _title = `${titleExtra} ${intl.formatMessage({
    id: `notification.${notification.type}`,
  })}`;

  if (
    notification.type === 'vote' ||
    notification.type === 'reblog' ||
    notification.type === 'favorites' ||
    (notification.type === 'mention' && notification.post)
  ) {
    _moreinfo = notification.title || notification.permlink;
  }

  if (
    notification.type === 'reply' ||
    notification.type === 'bookmarks' ||
    (notification.type === 'mention' && !notification.post)
  ) {
    _moreinfo = notification.parent_title || notification.parent_permlink || notification.permlink;
  }

  return (
    <TouchableHighlight onPress={_handleOnNotificationPress}>
      <View
        key={`${get(notification, 'id')}${_title}`}
        style={[styles.notificationWrapper, !isRead && styles.isNewNotification]}
      >
        <TouchableOpacity onPress={handleOnUserPress}>
          <UserAvatar
            noAction={true}
            username={notification.source}
            style={[styles.avatar, !notification.avatar && styles.hasNoAvatar]}
          />
        </TouchableOpacity>

        <View style={styles.body}>
          <View style={styles.titleWrapper}>
            <Text style={styles.name}>{notification.source} </Text>
            <Text style={styles.title}>{_title} </Text>
            <Text style={styles.moreinfo} numberOfLines={1} ellipsizeMode="tail">
              {_moreinfo}
            </Text>
          </View>
          {notification.description && (
            <Text numberOfLines={1} style={styles.description}>
              {notification.description}
            </Text>
          )}
        </View>

        {get(notification, 'image', null) && (
          <Image
            style={styles.image}
            source={{ uri: notification.image }}
            defaultSource={require('../../../assets/no_image.png')}
          />
        )}
      </View>
    </TouchableHighlight>
  );
};

export default NotificationLineView;
/* eslint-enable */
