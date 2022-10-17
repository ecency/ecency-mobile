import React, { Ref } from 'react';
import { TextInput, NativeModules, TextInputProps, TextStyle } from 'react-native';

import { useAppSelector } from '../../../hooks';

// Styles
import styles from './textInputStyles';

interface Props extends TextInputProps {
  innerRef: Ref<TextInput>;
  height: number;
  style: TextStyle;
}

const TextInputView = ({ innerRef, height, style, ...props }: Props) => {
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);
  return (
    <TextInput
      ref={innerRef}
      keyboardAppearance={isDarkTheme ? 'dark' : 'light'}
      textAlign={NativeModules.I18nManager.isRTL ? 'right' : 'left'}
      {...props}
      style={[styles.input, { minHeight: height }, style]}
    />
  );
};

export default TextInputView;
