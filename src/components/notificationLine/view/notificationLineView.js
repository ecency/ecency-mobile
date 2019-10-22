import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { UserAvatar } from '../../userAvatar';

// Styles
import styles from './notificationLineStyles';

const NotificationLineView = ({ notification, handleOnPressNotification }) => {
  const [isRead, setIsRead] = useState(notification.read);
  const intl = useIntl();
  let _title;
  let titleExtra = '';

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

  if (notification.type === 'transfer') {
    titleExtra = notification.amount;
  } else if (notification.weight) {
    const _percent = `${parseFloat((notification.weight / 100).toFixed(2))}% `;

    titleExtra = _percent;
  }

  _title = `${titleExtra} ${intl.formatMessage({
    id: `notification.${notification.type}`,
  })}`;

  return (
    <TouchableHighlight onPress={_handleOnNotificationPress}>
      <View
        key={`${get(notification, 'id')}${_title}`}
        style={[styles.notificationWrapper, !isRead && styles.isNewNotification]}
      >
        <UserAvatar
          username={notification.source}
          style={[styles.avatar, !notification.avatar && styles.hasNoAvatar]}
        />
        <View style={styles.body}>
          <View style={styles.titleWrapper}>
            <Text style={styles.name}>{notification.source} </Text>
            <Text style={styles.title}>{_title}</Text>
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
