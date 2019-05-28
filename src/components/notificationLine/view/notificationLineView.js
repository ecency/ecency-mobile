import React, { PureComponent } from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import { injectIntl } from 'react-intl';
// Constants

// Components
import { UserAvatar } from '../../userAvatar';

// Styles
import styles from './notificationLineStyles';

class NotificationLineView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      isRead: props.notification.read,
    };
  }

  // Component Life Cycles
  componentWillReceiveProps(nextProps) {
    const { notification } = this.props;

    if (notification.read !== nextProps.notification.read) {
      this.setState({ isRead: nextProps.notification.read });
    }
  }

  // Component Functions
  _handleOnNotificationPress = () => {
    const { handleOnPressNotification, notification } = this.props;
    const { isRead } = this.state;

    if (!isRead) this.setState({ isRead: true });

    handleOnPressNotification(notification);
  };

  render() {
    const {
      notification,
      intl: { formatMessage },
    } = this.props;
    const { isRead } = this.state;

    let _title = formatMessage({
      id: `notification.${notification.type}`,
    });

    if (notification.weight) {
      const _percent = `${parseFloat((notification.weight / 100).toFixed(2))}% `;

      _title = _percent + _title;
    }

    return (
      <TouchableHighlight onPress={() => this._handleOnNotificationPress()}>
        <View
          key={Math.random()}
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
          {notification.image && (
            <Image
              style={styles.image}
              source={{ uri: notification.image }}
              defaultSource={require('../../../assets/no_image.png')}
            />
          )}
        </View>
      </TouchableHighlight>
    );
  }
}

export default injectIntl(NotificationLineView);
