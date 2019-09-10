import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './tagStyles';

const Tag = ({ onPress, isPin, value, isPostCardTag }) => (
  <TouchableOpacity onPress={() => onPress && onPress(value)}>
    <View
      style={[styles.textWrapper, isPin && styles.isPin, isPostCardTag && styles.isPostCardTag]}
    >
      <Text style={[styles.text]}>{value}</Text>
    </View>
  </TouchableOpacity>
);

export default Tag;
