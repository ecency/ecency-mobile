import React, { Fragment } from 'react';
import {
  Text,
  View,
  TouchableWithoutFeedback,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

import styles from './textButtonStyles';

interface TextButtonProps {
  text?: string;
  onPress?: (event?: any) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

const TextButtonView = ({ text, onPress, style, textStyle, disabled }: TextButtonProps) => (
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
