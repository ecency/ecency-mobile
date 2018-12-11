import React from 'react';
import { Animated, TouchableOpacity } from 'react-native';
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
    <TouchableOpacity
      onPress={() => onPress && onPress()}
      style={[
        styles.subButton,
        {
          width: size / 1.5,
          height: size / 1.5,
          borderRadius: size / 3,
        },
      ]}
    >
      <Icon name={icon} size={14} color="#F8F8F8" />
    </TouchableOpacity>
  </Animated.View>
);

export default SubPostButton;
