import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import styles from './orDividerStyles';

interface OrDividerProps {
  containerStyle?: ViewStyle;
}
const OrDivider = ({ containerStyle }: OrDividerProps) => {
  return (
    <View style={[styles.dividerContainer, containerStyle]}>
      <View style={[styles.divider, styles.leftDivider]} />
      <Text style={styles.orText}>OR</Text>
      <View style={[styles.divider, styles.rightDivider]} />
    </View>
  );
};

export default OrDivider;
