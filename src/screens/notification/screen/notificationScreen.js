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
import { LeaderBoard } from '../../../components/leaderboard';

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
      handleLoginPress,
      isLoggedIn,
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
            {isLoggedIn ? (
              <Notification
                getActivities={getActivities}
                notifications={notifications}
                navigateToNotificationRoute={navigateToNotificationRoute}
                readAllNotification={readAllNotification}
              />
            ) : (
              <NoPost
                isButtonText
                defaultText={intl.formatMessage({
                  id: 'profile.login_to_see',
                })}
                handleOnButtonPress={handleLoginPress}
              />
            )}
          </View>
          <View
            tabLabel={intl.formatMessage({
              id: 'notification.leaderboard',
            })}
            style={styles.leaderboardTab}
          >
            <LeaderBoard />
          </View>
        </ScrollableTabView>
      </View>
    );
  }
}
export default injectIntl(NotificationScreen);
