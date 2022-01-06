import React from 'react';
import { TextInput, NativeModules } from 'react-native';

import { ThemeContainer } from '../../../containers';

// Styles
import styles from './textInputStyles';

const TextInputView = ({ innerRef, height, style, ...props }) => (
  <ThemeContainer>
    {({ isDarkTheme }) => (
      <TextInput
        ref={innerRef}
        keyboardAppearance={isDarkTheme ? 'dark' : 'light'}
        textAlign={NativeModules.I18nManager.isRTL ? 'right' : 'left'}
        {...props}
        style={[styles.input, { minHeight: height }, style]}
      />
    )}
  </ThemeContainer>
);

export default TextInputView;
