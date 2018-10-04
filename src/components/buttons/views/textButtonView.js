import React, { Fragment } from 'react';
import { TouchableWithoutFeedback, Text, View } from 'react-native';

import styles from './textButtonStyles';

const TextButtonView = ({ text, onPress, style }) => (
  <Fragment>
    <TouchableWithoutFeedback
      style={[styles.button, style]}
      onPress={() => onPress && onPress()}
    >
      <View>
        <Text style={styles.buttonText}>{text}</Text>
      </View>
    </TouchableWithoutFeedback>
  </Fragment>
);

export default TextButtonView;
