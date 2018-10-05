import React from 'react';
import { Animated, TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Styles
import styles from './postButtonStyles';

/* Props
  * ------------------------------------------------
  *   @prop { type }    size                 - Description....
  *   @prop { type }    onPress              - Description....
  *   @prop { type }    style                - Description....
  *   @prop { type }    icon                 - Description....
  *
  */

const SubPostButton = ({
  style, icon, onPress, size,
}) => (
  <Animated.View
    style={[
      styles.subButtonWrapper,
      {
        ...style,
      },
    ]}
  >
    <TouchableHighlight
      onPress={() => onPress && onPress()}
      style={[
        styles.subButton,
        {
          width: size / 2,
          height: size / 2,
          borderRadius: size / 4,
        },
      ]}
    >
      <Icon name={icon} size={14} color="#F8F8F8" />
    </TouchableHighlight>
  </Animated.View>
);

export default SubPostButton;
