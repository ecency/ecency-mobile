import React, { Component, Fragment } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

// Constants

// Components

// Styles
import styles from "./mainButtonStyles";

class MainButton extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { string }     isLoading          - TODO:
    *   @prop { string }     text               - TODO:
    *   @prop { boolean }    secondText         - TODO:
    *   @prop { boolean }    iconColor          - TODO:
    *   @prop { boolean }    iconName           - TODO:
    *   @prop { boolean }    isDisable          - TODO:
    *
    * 
    */
  constructor(props) {
    super(props);

    this.state = {
      isDisable: !props.isLoading && props.isDisable,
    };
  }

  // Component Life Cycles
  componentWillReceiveProps(nextProps) {
    const { isLoading, isDisable } = this.props;
    if (
      nextProps.isLoading !== isLoading ||
      nextProps.isDisable !== isDisable
    ) {
      this.setState({
        isDisable: !nextProps.isLoading && nextProps.isDisable,
      });
    }
  }

  // Component Functions
  _handleOnPress = () => {
    const { onPress } = this.props;

    onPress && onPress();
  };

  _getBody = () => {
    const {
      isLoading,
      text,
      secondText,
      iconColor,
      iconName,
      source,
    } = this.props;

    if (isLoading) {
      return (
        <ActivityIndicator color="white" style={styles.activityIndicator} />
      );
    } else if (text) {
      return (
        <Fragment>
          {source ? (
            <Image source={source} style={styles.image} resizeMode="contain" />
          ) : (
            <Ionicons color={iconColor} name={iconName} style={styles.icon} />
          )}
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
    const { wrapperStyle } = this.props;
    const { isDisable } = this.state;

    return (
      <View style={wrapperStyle}>
        <TouchableOpacity
          disabled={isDisable}
          onPress={() => this._handleOnPress()}
          style={[styles.touchable, isDisable && styles.disableTouchable]}
        >
          <View style={styles.body}>{this._getBody()}</View>
        </TouchableOpacity>
      </View>
    );
  }
}

export default MainButton;
