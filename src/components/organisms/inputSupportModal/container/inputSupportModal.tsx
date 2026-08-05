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
  // iOS-only gating per 2d26cc4: declarative entering/exiting on
  // conditionally-mounted views race Fabric's transaction merging on Android
  // ("Unable to find viewState for tag" native crash); Android shows/hides
  // instantly instead.
  return visible ? (
    <Portal>
      <Animated.View
        entering={Platform.OS === 'ios' ? FadeIn : undefined}
        exiting={Platform.OS === 'ios' ? FadeOut : undefined}
        style={styles.container}
      >
        <Animated.View
          style={{ flex: 1 }}
          entering={Platform.OS === 'ios' ? SlideInUp.easing(Easing.ease) : undefined}
          exiting={Platform.OS === 'ios' ? SlideOutDown.easing(Easing.ease) : undefined}
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
