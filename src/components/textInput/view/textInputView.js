import React, { Fragment } from 'react';
import { TextInput, Text, View } from 'react-native';
import { connect } from 'react-redux';

// Styles
import styles from './textInputStyles';

const TextInputView = ({ isDarkTheme, innerRef, options, ...props }) => (
  <Fragment>
    <TextInput
      style={styles.input}
      ref={innerRef}
      keyboardAppearance={isDarkTheme ? 'dark' : 'light'}
      {...props}
    />
    {!!options && (
      <View style={styles.optionsWrapper}>
        <Text>sa</Text>
        <Text>sa</Text>
        <Text>sa</Text>
        <Text>sa</Text>
        <Text>sa</Text>
        <Text>sa</Text>
        <Text>sa</Text>
        <Text>sa</Text>
      </View>
    )}
  </Fragment>
);

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(TextInputView);
