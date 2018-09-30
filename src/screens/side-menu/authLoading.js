import React from "react";
/*eslint-disable no-unused-vars*/
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";

import { getAuthStatus, getUserData } from "../../realm/realm";

export class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.checkAuth();
  }

  // Fetch the login state from storage then navigate to our appropriate place
  checkAuth = async () => {
    await getAuthStatus()
      .then(result => {
        if (result) {
          getUserData()
            .then(userData => {
              // This will switch to the App screen or Auth screen and this loading
              // screen will be unmounted and thrown away.
              this.props.navigation.navigate("LoggedIn", {
                account: userData["0"].username,
              });
            })
            .catch(err => {
              alert(err);
            });
        } else {
          this.props.navigation.navigate("LoggedOut");
        }
      })
      .catch(err => {
        alert(err);
      });
  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="default" />
        <ActivityIndicator />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 32,
  },
});
