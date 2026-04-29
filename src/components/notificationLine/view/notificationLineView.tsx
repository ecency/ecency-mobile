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
        return { amount: notification.amount_usd || notification.amount || '' };
      case 'weekly_earnings': {
        const total = notification.total_usd || notification.amount || '0';
        const authorUsd = notification.author_usd;
        const curationUsd = notification.curation_usd;
        const breakdown =
          authorUsd && curationUsd
            ? ` - $${authorUsd} from posts, $${curationUsd} from curation.`
            : ' from your posts and curation.';
        return { amount: total, breakdown };
      }
      case 'account_update': {
        const granted: any[] = Array.isArray(notification.accounts_granted)
          ? notification.accounts_granted
          : [];
        return {
          accounts: granted.map((g: any) => `@${g.account}`).join(', '),
        };
      }
      default:
        return {};
    }
  };

  // Pick a more specific i18n key for account_update based on what actually changed.
  // Falls back to the generic key if the backend didn't include the new fields.
  const _getAccountUpdateIntlKey = () => {
    const keys = Array.isArray(notification.keys_changed) ? notification.keys_changed : [];
    const granted = Array.isArray(notification.accounts_granted)
      ? notification.accounts_granted
      : [];

    if (keys.includes('owner')) return 'notification.account_update_owner_key';
    if (keys.includes('active')) return 'notification.account_update_active_key';
    if (keys.includes('posting')) return 'notification.account_update_posting_key';

    if (granted.length) {
      const authorities = new Set(granted.map((g: any) => g.authority));
      if (authorities.has('owner')) return 'notification.account_update_owner_authority';
      if (authorities.has('active')) return 'notification.account_update_active_authority';
      return 'notification.account_update_posting_authority';
    }

    return 'notification.account_update';
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

  const _intlId =
    notification.type === 'account_update'
      ? _getAccountUpdateIntlKey()
      : `notification.${notification.type}`;

  const _notificationText = intl.formatMessage(
    {
      id: _intlId,
      defaultMessage: notification.type?.replace(/_/g, ' ') || 'notification',
    },
    _messageValues,
  );
  const _title = [_notificationText, titleExtra].filter((part) => !!part).join(' ');

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
