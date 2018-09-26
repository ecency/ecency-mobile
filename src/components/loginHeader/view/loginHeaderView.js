import React, { Component } from "react";
import { View, Text, Image } from "react-native";
// Constants

// Components

// Styles
// eslint-disable-next-line
import styles from "./loginHeaderStyles";

class LoginHeaderView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { string }    title            - Title for header string.
    *   @prop { string }    description      - Description for header string.
    * 
    */
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const { description, title } = this.props;

    return (
      <View style={styles.wrapper}>
        <View style={styles.titleText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={{ flex: 0.7 }}>
          <Image
            style={styles.mascot}
            source={require("../../../assets/love_mascot.png")}
          />
        </View>
      </View>
    );
  }
}

export default LoginHeaderView;
