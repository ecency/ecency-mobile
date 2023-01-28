import React, { useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
// import { View as AnimatedView } from 'react-native-animatable';

// Styles
import styles from './toastNotificationStyles';
interface ToastNotificationProps {
  duration: number;
  text: string;
  textStyle?: any;
  style?: any;
  onPress?: () => void;
  onHide: () => void;
}
const ToastNotification = ({
  duration,
  text,
  textStyle,
  style,
  onPress,
  onHide,
}: ToastNotificationProps) => {
  // Component Life Cycles
  useEffect(() => {
    if (duration) {
      const closeTimer = setTimeout(() => {
        _hideToast();
      }, duration);
      return () => {
        clearTimeout(closeTimer);
      };
    }
  }, []);

  // Component Functions

  const _hideToast = () => {
    if (onHide) {
      onHide();
    }
  };

  // const finalPosition = isTop ? { top: 100 } : { bottom: 100 };
  return (
    <TouchableOpacity disabled={!onPress} onPress={() => onPress && onPress()}>
      <Animated.View
        style={{
          ...styles.container,
          ...style,
        }}
        entering={SlideInDown.duration(750)}
        exiting={SlideOutDown.duration(500)}
      >
        <Text style={[styles.text, textStyle]} numberOfLines={2}>
          {text}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ToastNotification;
