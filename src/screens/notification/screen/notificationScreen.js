import React, { Fragment } from "react";
import { Text, View } from "react-native";
import ScrollableTabView from "@esteemapp/react-native-scrollable-tab-view";
import { TabBar } from "../../../components/tabBar";
import { Notification } from "../../../components/notification";
// Styles
import styles from "./notificationStyles";

class NotificationScreen extends React.Component {
  render() {
    return (
      <Fragment>
        <ScrollableTabView
          style={styles.tabView}
          renderTabBar={() => (
            <TabBar
              style={styles.tabbar}
              tabUnderlineDefaultWidth={100}
              tabUnderlineScaleX={2}
              activeColor={"$primaryBlue"}
              inactiveColor={"#222"}
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
