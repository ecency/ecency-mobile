import React, { useEffect, useRef, useState } from 'react';
import { View as AnimatedView } from 'react-native-animatable';
import { Portal } from 'react-native-portalize';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import styles from '../children/inputSupportModal.styles';

export interface InputSupportModalProps {
  visible: boolean;
  onClose: () => void;
  children?: any;
}

export const InputSupportModal = ({ children, visible, onClose }: InputSupportModalProps, ref) => {
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
        <AnimatedView ref={container} animation="fadeIn" duration={300} style={styles.container}>
          <AnimatedView
            ref={innerContainer}
            style={{ flex: 1 }}
            animation="slideInUp"
            duration={300}
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
          </AnimatedView>
        </AnimatedView>
      </Portal>
    )
  );
};
