import React, { Component, Fragment } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';

// Components
import { Icon } from '../../icon';

// Styles
import styles from './mainButtonStyles';

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
    if (nextProps.isLoading !== isLoading || nextProps.isDisable !== isDisable) {
      this.setState({
        isDisable: !nextProps.isLoading && nextProps.isDisable,
      });
    }
  }

  // Component Functions
  _handleOnPress = () => {
    const { onPress } = this.props;

    if (onPress) onPress();
  };

  _getBody = () => {
    const { isLoading, text, secondText, iconColor, iconName, source } = this.props;

    if (isLoading) {
      this._getIndicator();
    }

    if (text) {
      return (
        <Fragment>
          {source ? (
            <Image source={source} style={styles.image} resizeMode="contain" />
          ) : (
            <Icon iconType="MaterialIcons" color={iconColor} name={iconName} style={styles.icon} />
          )}
          <Text style={styles.text}>
            {text}
            {secondText && <Text style={styles.secondText}>{secondText}</Text>}
          </Text>
        </Fragment>
      );
    }

    return <Icon iconType="MaterialIcons" color={iconColor} name={iconName} style={styles.icon} />;
  };

  _getIndicator = () => <ActivityIndicator color="white" style={styles.activityIndicator} />;

  render() {
    const { wrapperStyle, children, height, style, isLoading } = this.props;
    const { isDisable } = this.state;

    return (
      <View style={wrapperStyle}>
        <TouchableOpacity
          disabled={isLoading || isDisable}
          onPress={() => this._handleOnPress()}
          style={[
            styles.touchable,
            isDisable && styles.disableTouchable,
            height && { height },
            style && style,
          ]}
        >
          <View style={styles.body}>
            {isLoading ? this._getIndicator() : children || this._getBody()}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

export default MainButton;
