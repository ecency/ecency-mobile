import React, { Fragment } from 'react';
import { View, SectionList } from 'react-native';

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
  const notificationsListRef = React.useRef<SectionList>(null);
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
                  listRef={notificationsListRef}
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

  return (
    <Fragment>
      <Header />

      <TabView
        navigationState={{ index, routes }}
        style={styles.tabView}
        renderTabBar={(tabProps) => (
          <TabBar
            {...tabProps}
            onTabPress={({ route }) => {
              if (route.key === 'notifications') {
                if (!notifications || notifications.length === 0) {
                  return;
                }
                notificationsListRef.current?.scrollToLocation({
                  itemIndex: 0,
                  sectionIndex: 0,
                  animated: true,
                });
              }
            }}
          />
        )}
        onIndexChange={setIndex}
        renderScene={renderScene}
        commonOptions={{
          labelStyle: styles.tabLabelColor,
        }}
      />
    </Fragment>
  );
};

export default NotificationScreen;
