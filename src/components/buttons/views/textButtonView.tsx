import React, { Fragment } from 'react';
import { Text, View, TouchableWithoutFeedback } from 'react-native';

import styles from './textButtonStyles';

const TextButtonView = ({ text, onPress, style, textStyle, disabled }) => (
  <Fragment>
    <TouchableWithoutFeedback
      style={[styles.button]}
      disabled={disabled}
      onPress={() => onPress && onPress()}
    >
      <View style={style}>
        <Text style={[styles.buttonText, textStyle]}>{text}</Text>
      </View>
    </TouchableWithoutFeedback>
  </Fragment>
);

export default TextButtonView;
