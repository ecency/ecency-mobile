import React, { Component } from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';

// Styles
import styles from './iconButtonStyles';

/*
 *            Props Name        Description                                     Value
 *@props -->  defaultToggled   it can be start with disable icon               bolean
 *@props -->  handleToggle     description here                                function
 *@props -->  isToggle         declaration toggle or normal icon button        boolean
 *@props -->  name             icon name                                       string
 *@props -->  size             icon size                                       numeric
 *@props -->  toggledName      disable toggled name                            string
 *@props -->  handleOnPress    handle for press                                string
 *@props -->  isCircle         button gona be circle                           bolean
 *
 */

class IconButtonView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Functions
  _handleOnPress = () => {
    const { handleOnPress } = this.props;

    if (handleOnPress) {
      handleOnPress();
    }
  };

  _getIconName = () => {
    const { name, androidName } = this.props;

    if (name) {
      const isIos = Platform.OS === 'ios';
      let iconName;

      if (isIos) {
        iconName = name;
      } else {
        iconName = androidName || name;
      }
      return iconName;
    }
    return null;
  };

  render() {
    const { buttonStyle, size, style, isCircle, color, buttonColor } = this.props;

    return (
      <TouchableOpacity
        style={[
          isCircle && styles.circleButton,
          buttonColor && { backgroundColor: buttonColor },
          styles.buttonStyle,
          buttonStyle,
        ]}
        onPress={() => this._handleOnPress()}
      >
        <Ionicons
          style={[styles.icon, style]}
          color={color}
          name={this._getIconName()}
          size={size}
        />
      </TouchableOpacity>
    );
  }
}

export default IconButtonView;
