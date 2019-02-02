import React, { Component } from 'react';
import { Animated, Text } from 'react-native';

// Constants

// Components

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

  // Component Functions

  componentWillMount() {
    this._showToast();
  }

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
    const { handleOnHide } = this.props;

    Animated.timing(animatedValue, { toValue: 0.0, duration: 350 }).start(() => {
      if (handleOnHide) handleOnHide();
    });

    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
  }

  render() {
    const { text } = this.props;
    const { animatedValue } = this.state;
    const y = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    return (
      <Animated.View
        style={{
          ...styles.container,
          opacity: animatedValue,
          transform: [{ translateY: y }],
        }}
      >
        <Text style={styles.text}>{text}</Text>
      </Animated.View>
    );
  }
}

export default ToastNotification;
