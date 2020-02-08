import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './tagStyles';

const Tag = ({ onPress, isPin, value, label, isPostCardTag, isFilter }) => (
  <TouchableOpacity onPress={() => onPress && onPress(value)}>
    <View
      style={[
        styles.textWrapper,
        isFilter && styles.isFilter,
        isPin && styles.isPin,
        isPostCardTag && styles.isPostCardTag,
      ]}
    >
      <Text
        style={[
          styles.text,
          !isPin && isFilter && styles.isFilterTextUnPin,
          isPin && isFilter && styles.isFilterTextPin,
        ]}
      >
        {isPostCardTag ? label : value}
      </Text>
    </View>
  </TouchableOpacity>
);

export default Tag;
