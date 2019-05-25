import React, { Fragment } from 'react';
import { TouchableWithoutFeedback, Text, View } from 'react-native';

import styles from './textButtonStyles';

const TextButtonView = ({ text, onPress, style, textStyle }) => (
  <Fragment>
    <TouchableWithoutFeedback style={[styles.button]} onPress={() => onPress && onPress()}>
      <View style={style}>
        <Text style={[styles.buttonText, textStyle]}>{text}</Text>
      </View>
    </TouchableWithoutFeedback>
  </Fragment>
);

export default TextButtonView;
