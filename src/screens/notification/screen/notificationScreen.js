import React, { Fragment, PureComponent } from 'react';
import { View } from 'react-native';
import ScrollableTabView from '@esteemapp/react-native-scrollable-tab-view';
import { TabBar } from '../../../components/tabBar';
import { Notification } from '../../../components/notification';
import { Header } from '../../../components/header';
// Styles
import styles from './notificationStyles';
// Components
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
    const { notifications, getActivities, navigateToNotificationRoute } = this.props;
    return (
      <View style={globalStyles.container}>
        <Header />
        <ScrollableTabView
          style={styles.tabView}
          renderTabBar={() => (
            <TabBar style={styles.tabbar} tabUnderlineDefaultWidth={100} tabUnderlineScaleX={2} />
          )}
        >
          <View tabLabel="Notification" style={styles.notificationTab}>
            <Notification
              getActivities={getActivities}
              notifications={notifications}
              navigateToNotificationRoute={navigateToNotificationRoute}
            />
          </View>
          <View tabLabel="Leaderboard" style={styles.leaderboardTab}>
            <NoPost
              style={{ marginTop: 118 }}
              imageStyle={{
                width: 193,
                height: 189,
              }}
              source={MESSAGES_IMAGE}
              defaultText="Leaderboard feature is coming soon!"
            />
          </View>
        </ScrollableTabView>
      </View>
    );
  }
}
export default NotificationScreen;
