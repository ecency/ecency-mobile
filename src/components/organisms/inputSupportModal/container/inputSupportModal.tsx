import React from 'react';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { Portal } from 'react-native-portalize';
import { Easing, KeyboardAvoidingView, Platform, View } from 'react-native';
import styles from '../children/inputSupportModal.styles';

export interface InputSupportModalProps {
  visible: boolean;
  onClose: () => void;
  children?: any;
}

export const InputSupportModal = ({ children, visible, onClose }: InputSupportModalProps) => {
  // Reanimated defers the unmount until the exiting animations below finish,
  // so rendering can track `visible` directly with no delayed-hide state.
  return visible ? (
    <Portal>
      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.container}>
        <Animated.View
          style={{ flex: 1 }}
          entering={SlideInUp.easing(Easing.ease)}
          exiting={SlideOutDown.easing(Easing.ease)}
        >
          <View style={{ flex: 1 }} onTouchEnd={onClose} />

          {Platform.select({
            ios: (
              <KeyboardAvoidingView behavior="padding" style={{}}>
                {children}
              </KeyboardAvoidingView>
            ),
            android: <View>{children}</View>,
          })}
        </Animated.View>
      </Animated.View>
    </Portal>
  ) : null;
};
