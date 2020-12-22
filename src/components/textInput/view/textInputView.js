import React from 'react';
import { TextInput } from 'react-native';

import { ThemeContainer } from '../../../containers';

// Styles
import styles from './textInputStyles';

const TextInputView = ({ innerRef, height, style, onScrollToTop, ...props }) => (
  <ThemeContainer>
    {({ isDarkTheme }) => (
      <TextInput
        ref={innerRef}
        keyboardAppearance={isDarkTheme ? 'dark' : 'light'}
        {...props}
        style={[styles.input, { minHeight: height }, style]}
        onScroll={(event) => event.nativeEvent.contentOffset.y === 0 && onScrollToTop()}
      />
    )}
  </ThemeContainer>
);

export default TextInputView;
