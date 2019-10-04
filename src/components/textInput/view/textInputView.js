import React from 'react';
import { TextInput } from 'react-native';
import { connect } from 'react-redux';

// Styles
import styles from './textInputStyles';

const TextInputView = ({ isDarkTheme, innerRef, height, ...props }) => (
  <TextInput
    ref={innerRef}
    keyboardAppearance={isDarkTheme ? 'dark' : 'light'}
    {...props}
    style={[styles.input, { minHeight: height }, props.style]}
  />
);

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(TextInputView);
