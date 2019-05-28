import React from 'react';
import { connect } from 'react-redux';
import { TextInput } from 'react-native';

const TextInputView = props => (
  <TextInput keyboardAppearance={props.isDarkTheme ? 'dark' : 'light'} {...props} />
);

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(TextInputView);
