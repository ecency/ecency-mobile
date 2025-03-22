import React, { useEffect, useRef, useState } from 'react';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { Portal } from 'react-native-portalize';
import { Easing, KeyboardAvoidingView, Platform, View } from 'react-native';
import styles from '../children/inputSupportModal.styles';

export interface InputSupportModalProps {
  visible: boolean;
  onClose: () => void;
  children?: any;
}

export const InputSupportModal = ({ children, visible, onClose }: InputSupportModalProps) => {
  const container = useRef<AnimatedView>(null);
  const innerContainer = useRef<AnimatedView>(null);

  const [showModal, setShowModal] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
    } else if (!visible && container.current && innerContainer.current) {
      innerContainer.current.slideOutDown(1000);
      setTimeout(async () => {
        await container.current?.fadeOut(200);
        setShowModal(false);
      }, 300);
    }
  }, [visible]);

  return (
    showModal && (
      <Portal>
        <Animated.View ref={container} entering={FadeIn} style={styles.container}>
          <Animated.View
            ref={innerContainer}
            style={{ flex: 1 }}
            entering={SlideInUp.easing(Easing.ease)}
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
    )
  );
};
