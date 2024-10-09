import React, { Fragment } from 'react';
import { View } from 'react-native';

// Components
import { TabView } from 'react-native-tab-view';
import { useIntl } from 'react-intl';
import { LeaderBoard, Notification, Header, TabBar } from '../../../components';
import { LoggedInContainer } from '../../../containers';

// Styles
import styles from './notificationStyles';

const NotificationScreen = ({
  notifications,
  getActivities,
  navigateToNotificationRoute,
  handleOnUserPress,
  readAllNotification,
  isNotificationRefreshing,
  isLoading,
  changeSelectedFilter,
  globalProps,
}) => {
  const intl = useIntl();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: 'notifications',
      title: intl.formatMessage({
        id: 'notification.notification',
      }),
    },
    {
      key: 'leaderboard',
      title: intl.formatMessage({
        id: 'notification.leaderboard',
      }),
    },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'notifications':
        return (
          <View style={styles.tabView}>
            <LoggedInContainer>
              {() => (
                <Notification
                  getActivities={getActivities}
                  notifications={notifications}
                  navigateToNotificationRoute={navigateToNotificationRoute}
                  handleOnUserPress={handleOnUserPress}
                  readAllNotification={readAllNotification}
                  isNotificationRefreshing={isNotificationRefreshing}
                  isLoading={isLoading}
                  changeSelectedFilter={changeSelectedFilter}
                  globalProps={globalProps}
                />
              )}
            </LoggedInContainer>
          </View>
        );
      case 'leaderboard':
        return (
          <View style={styles.tabView}>
            <LeaderBoard />
          </View>
        );
    }
  };

  // const renderTabBar = (props) => (
  //   <TabBar
  //     {...props}
  //  />
  // )

  return (
    <Fragment>
      <Header />

      <TabView
        navigationState={{ index, routes }}
        style={styles.tabView}
        renderTabBar={TabBar}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
    </Fragment>
  );
};

export default NotificationScreen;
