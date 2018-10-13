import React, { Fragment, PureComponent } from 'react';
import { Text, View } from 'react-native';
import ScrollableTabView from '@esteemapp/react-native-scrollable-tab-view';
import { TabBar } from '../../../components/tabBar';
import { Notification } from '../../../components/notification';
import { Header } from '../../../components/header';
// Styles
import styles from './notificationStyles';

class NotificationScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Fragment>
        <Header />
        <ScrollableTabView
          style={styles.tabView}
          renderTabBar={() => (
            <TabBar
              style={styles.tabbar}
              tabUnderlineDefaultWidth={100}
              tabUnderlineScaleX={2}
              activeColor="#357ce6"
              inactiveColor="#222"
            />
          )}
        >
          <View tabLabel="Notification" style={styles.notificationTab}>
            <Notification />
          </View>
          <View tabLabel="Leaderboard" style={styles.leaderboardTab}>
            <Text>Leaderboard</Text>
          </View>
        </ScrollableTabView>
      </Fragment>
    );
  }
}
export default NotificationScreen;
