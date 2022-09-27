import React, { Component } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';

// Styles
import styles from './toastNotificationStyles';

class ToastNotification extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.animatedValue = new Animated.Value(0);
  }

  // Component Functions
  _showToast() {
    const { duration } = this.props;
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 350,
      easing: Easing.inOut(Easing.ease),
    }).start();
    if (duration) {
      this.closeTimer = setTimeout(() => {
        this._hideToast();
      }, duration);
    }
  }

  _hideToast() {
    const { onHide } = this.props;

    Animated.timing(this.animatedValue, {
      toValue: 0.0,
      duration: 350,
      easing: Easing.inOut(Easing.ease),
    }).start(() => {
      if (onHide) {
        onHide();
      }
    });

    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
  }

  // Component Life Cycles
  UNSAFE_componentWillMount() {
    this._showToast();
  }

  render() {
    const { text, textStyle, style, onPress, isTop } = this.props;
    const outputRange = isTop ? [-50, 0] : [50, 0];
    const y = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange,
    });
    const position = isTop ? { top: 150 } : { bottom: 150 };

    return (
      <TouchableOpacity disabled={!onPress} onPress={() => onPress && onPress()}>
        <Animated.View
          style={{
            ...styles.container,
            ...style,
            ...position,
            opacity: 0.75,
            transform: [{ translateY: y }],
          }}
        >
          <Text style={[styles.text, textStyle]}>{text}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }
}

export default ToastNotification;
