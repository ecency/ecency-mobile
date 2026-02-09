import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableHighlight, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { UserAvatar } from '../../userAvatar';

import { rcFormatter, vestsToHp } from '../../../utils/conversions';
import { formatNotificationTimestamp } from '../../../utils/time';

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
  const _getMessageValues = () => {
    switch (notification.type) {
      case 'checkin':
      case 'monthly_posts': {
        const count = Number(notification.count) || 0;
        const suffix = notification.suffix ?? (count === 1 ? '' : 's');
        return { count, suffix };
      }
      case 'payouts':
        return { amount: notification.amount || '' };
      default:
        return {};
    }
  };

  const _messageValues = _getMessageValues();
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

  const _title = [
    intl.formatMessage({ id: `notification.${notification.type}` }, _messageValues),
    titleExtra,
  ]
    .filter((part) => !!part)
    .join(' ');

  if (
    notification.type === 'vote' ||
    notification.type === 'reblog' ||
    notification.type === 'favorites' ||
    notification.type === 'checkin' ||
    notification.type === 'monthly_posts' ||
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
          <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
            <Text style={styles.name}>{notification.source} </Text>
            {_title}
          </Text>
          {_moreinfo ? (
            <Text style={styles.moreinfo} numberOfLines={1} ellipsizeMode="tail">
              {_moreinfo}
            </Text>
          ) : null}
          {notification.description && (
            <Text numberOfLines={2} style={styles.description} ellipsizeMode="tail">
              {notification.description}
            </Text>
          )}
          {(notification.timestamp || notification.ts) && (
            <Text style={styles.timestamp}>
              {formatNotificationTimestamp(notification.timestamp || notification.ts)}
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
