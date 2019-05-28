import React, { PureComponent } from 'react';
import { View } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { injectIntl } from 'react-intl';

// Components
import { TabBar } from '../../../components/tabBar';
import { Notification } from '../../../components/notification';
import { Header } from '../../../components/header';
import { NoPost } from '../../../components/basicUIElements';
import { LeaderBoard } from '../../../components/leaderboard';

// Styles
import styles from './notificationStyles';
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
      handleLoginPress,
      isLoggedIn,
      isNotificationRefreshing,
      changeSelectedFilter,
    } = this.props;

    return (
      <View style={styles.container}>
        <Header />
        <ScrollableTabView
          style={globalStyles.tabView}
          renderTabBar={() => (
            <TabBar style={styles.tabbar} tabUnderlineDefaultWidth={100} tabUnderlineScaleX={2} />
          )}
        >
          <View
            tabLabel={intl.formatMessage({
              id: 'notification.notification',
            })}
            style={styles.tabbarItem}
          >
            {isLoggedIn ? (
              <Notification
                getActivities={getActivities}
                notifications={notifications}
                navigateToNotificationRoute={navigateToNotificationRoute}
                readAllNotification={readAllNotification}
                isNotificationRefreshing={isNotificationRefreshing}
                changeSelectedFilter={changeSelectedFilter}
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
            style={styles.tabbarItem}
          >
            <LeaderBoard />
          </View>
        </ScrollableTabView>
      </View>
    );
  }
}
export default injectIntl(NotificationScreen);
