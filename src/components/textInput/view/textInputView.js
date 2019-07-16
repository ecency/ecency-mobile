import React, { Fragment } from 'react';
import { TextInput } from 'react-native';
import { connect } from 'react-redux';

// Styles
import styles from './textInputStyles';

const TextInputView = ({ isDarkTheme, innerRef, ...props }) => (
  <Fragment>
    <TextInput
      style={styles.input}
      ref={innerRef}
      keyboardAppearance={isDarkTheme ? 'dark' : 'light'}
      {...props}
    />
  </Fragment>
);

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(TextInputView);
