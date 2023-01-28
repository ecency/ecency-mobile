import React, { Component } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { View as AnimatedView } from 'react-native-animatable';

// Styles
import styles from './toastNotificationStyles';

class ToastNotification extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
  }

  // Component Life Cycles
  componentDidMount() {
    this._showToast();
  }

  handleViewRef = (ref) => (this.view = ref);

  // Component Functions
  _showToast = () => {
    const { duration, isTop } = this.props;
    const initialPosition = isTop ? { top: 0 } : { bottom: 0 };
    const finalPosition = isTop ? { top: 100 } : { bottom: 100 };
    this.view
      .animate({ 0: { opacity: 0, ...initialPosition }, 1: { opacity: 1, ...finalPosition } })
      .then((endState) => {
        if (duration) {
          this.closeTimer = setTimeout(() => {
            this._hideToast();
          }, duration);
        }
      });
  };

  _hideToast = () => {
    const { isTop } = this.props;
    const finalPosition = isTop ? { top: 0 } : { bottom: 0 };
    const initialPosition = isTop ? { top: 100 } : { bottom: 100 };
    this.view
      .animate({ 0: { opacity: 1, ...initialPosition }, 1: { opacity: 0, ...finalPosition } })
      .then((endState) => {
        const { onHide } = this.props;
        if (onHide) {
          onHide();
        }
      });
  };

  render() {
    const { text, textStyle, style, onPress } = this.props;

    return (
      <TouchableOpacity disabled={!onPress} onPress={() => onPress && onPress()}>
        <AnimatedView
          style={{
            ...styles.container,
            ...style,
          }}
          easing="ease-in-out"
          duration={500}
          ref={this.handleViewRef}
        >
          <Text style={[styles.text, textStyle]} numberOfLines={2}>
            {text}
          </Text>
        </AnimatedView>
      </TouchableOpacity>
    );
  }
}

export default ToastNotification;
