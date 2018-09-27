import React, { Component, Fragment } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

// Constants

// Components

// Styles
import styles from "./mainButtonStyles";

class MainButton extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { string }     isLoading       - TODO:
    *   @prop { string }     text              - TODO:
    *   @prop { boolean }    secondText      - TODO:
    *   @prop { boolean }    iconColor        - TODO:
    *   @prop { boolean }    iconName           - TODO:
    *   @prop { boolean }    isDisable   - TODO:
    *
    * 
    */
  constructor(props) {
    super(props);

    this.state = {};
  }

  // Component Life Cycles

  // Component Functions
  _handleOnPress = () => {
    const { onPress, isDisable } = this.props;

    onPress && !isDisable && onPress();
  };

  _getBody = () => {
    const { isLoading, text, secondText, iconColor, iconName } = this.props;

    if (isLoading) {
      return (
        <ActivityIndicator color="white" style={styles.activityIndicator} />
      );
    } else if (text) {
      return (
        <Fragment>
          <Ionicons color={iconColor} name={iconName} style={styles.icon} />
          <Text style={styles.text}>
            {text}
            {secondText && <Text style={styles.secondText}>{secondText}</Text>}
          </Text>
        </Fragment>
      );
    }
    return <Ionicons color={iconColor} name={iconName} style={styles.icon} />;
  };

  render() {
    const { wrapperStyle, isDisable } = this.props;

    return (
      <View style={wrapperStyle}>
        <TouchableOpacity
          onPress={() => this._handleOnPress()}
          style={styles.touchable}
        >
          <View style={styles.body}>{this._getBody()}</View>
        </TouchableOpacity>
      </View>
    );
  }
}

export default MainButton;
