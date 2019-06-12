import React from 'react';
import { TextInput } from 'react-native';
import { connect } from 'react-redux';

const TextInputView = ({ isDarkTheme, innerRef, ...props }) => (
  <TextInput ref={innerRef} keyboardAppearance={isDarkTheme ? 'dark' : 'light'} {...props} />
);

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(TextInputView);
