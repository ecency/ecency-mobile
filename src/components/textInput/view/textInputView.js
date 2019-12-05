import React from 'react';
import { TextInput } from 'react-native';

import { ThemeContainer } from '../../../containers';

// Styles
import styles from './textInputStyles';

const TextInputView = ({ innerRef, height, style, ...props }) => (
  <ThemeContainer>
    {({ isDarkTheme }) => (
      <TextInput
        {...props}
        ref={innerRef}
        keyboardAppearance={isDarkTheme ? 'dark' : 'light'}
        style={[styles.input, { minHeight: height }, style]}
      />
    )}
  </ThemeContainer>
);

export default TextInputView;
