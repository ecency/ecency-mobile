import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './tagStyles';

const Tag = ({
  onPress,
  isPin,
  value,
  label,
  isPostCardTag,
  isFilter,
  style,
  textStyle,
  disabled,
}) => (
  <TouchableOpacity
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    onPress={() => onPress && onPress(value)}
    disabled={disabled}
  >
    <View
      style={[
        styles.textWrapper,
        isFilter && styles.isFilter,
        isPin && styles.isPin,
        isPostCardTag && styles.isPostCardTag,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          !isPin && isFilter && styles.isFilterTextUnPin,
          isPin && isFilter && styles.isFilterTextPin,
          textStyle,
        ]}
      >
        {` ${label} `}
      </Text>
    </View>
  </TouchableOpacity>
);

export default Tag;
