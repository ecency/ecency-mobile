import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

import styles from './squareButtonStyles';

/* Props
 *
 *   @prop { string }    text             - Text inside of button.
 *   @prop { func }      onPress          - When button clicked, this function will call.
 *   @prop { array }     style            - It is addionatly syle for button.
 *   @prop { array }     textStyle        - It is addionatly syle for text of button.
 *   @prop { any }       value            - When button clicked, this value will push with on press func.
 */
const SquareButtonView = ({ text, onPress, style, value, textStyle, ...rest }) => (
  <TouchableOpacity
    {...rest}
    style={[styles.button, style]}
    onPress={() => onPress && onPress(value)}
  >
    <Text style={[styles.buttonText, textStyle]}>{text}</Text>
  </TouchableOpacity>
);

export default SquareButtonView;
