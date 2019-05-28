import React, { Component } from 'react';
import { Animated, TouchableOpacity, Text } from 'react-native';

// Styles
import styles from './toastNotificationStyles';

class ToastNotification extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      animatedValue: new Animated.Value(0),
    };
  }

  // Component Life Cycles
  componentWillMount() {
    this._showToast();
  }

  // Component Functions
  _showToast() {
    const { duration } = this.props;
    const animatedValue = new Animated.Value(0);

    this.setState({ animatedValue });

    Animated.timing(animatedValue, { toValue: 1, duration: 350 }).start();

    if (duration) {
      this.closeTimer = setTimeout(() => {
        this._hideToast();
      }, duration);
    }
  }

  _hideToast() {
    const { animatedValue } = this.state;
    const { onHide } = this.props;

    Animated.timing(animatedValue, { toValue: 0.0, duration: 350 }).start(() => {
      if (onHide) onHide();
    });

    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
  }

  render() {
    const { text, textStyle, style, onPress, isTop } = this.props;
    const { animatedValue } = this.state;
    const outputRange = isTop ? [-50, 0] : [50, 0];
    const y = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange,
    });
    const position = isTop ? { top: 100 } : { bottom: 100 };

    return (
      <TouchableOpacity disabled={!onPress} onPress={() => onPress && onPress()}>
        <Animated.View
          style={{
            ...styles.container,
            ...style,
            ...position,
            opacity: animatedValue,
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
