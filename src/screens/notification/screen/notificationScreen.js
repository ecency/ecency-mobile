import React, { PureComponent } from 'react';
import { View } from 'react-native';
import ScrollableTabView from '@esteemapp/react-native-scrollable-tab-view';
import { injectIntl } from 'react-intl';

// Styles
import styles from './notificationStyles';
// Components
import { TabBar } from '../../../components/tabBar';
import { Notification } from '../../../components/notification';
import { Header } from '../../../components/header';
import { NoPost } from '../../../components/basicUIElements';

// Styles
import MESSAGES_IMAGE from '../../../assets/keep_calm.png';
import globalStyles from '../../../globalStyles';

class NotificationScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      notifications,
      getActivities,
      intl,
      navigateToNotificationRoute,
      readAllNotification,
    } = this.props;
    return (
      <View style={styles.container}>
        <Header />
        <ScrollableTabView
          style={styles.tabView}
          renderTabBar={() => (
            <TabBar style={styles.tabbar} tabUnderlineDefaultWidth={100} tabUnderlineScaleX={2} />
          )}
        >
          <View
            tabLabel={intl.formatMessage({
              id: 'notification.notification',
            })}
            style={styles.notificationTab}
          >
            <Notification
              getActivities={getActivities}
              notifications={notifications}
              navigateToNotificationRoute={navigateToNotificationRoute}
              readAllNotification={readAllNotification}
            />
          </View>
          <View
            tabLabel={intl.formatMessage({
              id: 'notification.leaderboard',
            })}
            style={styles.leaderboardTab}
          >
            <NoPost
              style={{ marginTop: 118 }}
              imageStyle={{
                width: 193,
                height: 189,
              }}
              source={MESSAGES_IMAGE}
              defaultText={intl.formatMessage({
                id: 'notification.comingsoon',
              })}
            />
          </View>
        </ScrollableTabView>
      </View>
    );
  }
}
export default injectIntl(NotificationScreen);
