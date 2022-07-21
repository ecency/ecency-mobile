import React from 'react';
import { View as AnimatedView } from 'react-native-animatable'
import { Portal } from 'react-native-portalize';
import styles from '../children/inputSupportModal.styles';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

export interface InputSupportModalProps {
    visible:boolean;
    onClose:()=>void;
    children?:any
}

export const InputSupportModal = ({children, visible, onClose}: InputSupportModalProps, ref) => {


  return (
    <Portal>
      {
        visible && (
          <AnimatedView
            style={styles.container}
            duration={300}
            animation='fadeInUp'>
              <>
                <View style={styles.container}  onTouchEnd={onClose} />
                {
                  Platform.select({
                    ios: (
                      <KeyboardAvoidingView behavior="padding">
                        {children}
                      </KeyboardAvoidingView>
                    ),
                    android: <View>{children}</View>,
                  })
                }

              </>
          </AnimatedView>
        )
      }
    </Portal>
  );
};
