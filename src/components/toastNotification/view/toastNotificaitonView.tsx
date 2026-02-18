import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, Keyboard, Platform } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
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
          ...(keyboardHeight > 0 && { bottom: keyboardHeight + 10 }),
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
