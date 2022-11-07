import React from 'react';
import { View } from 'react-native';
import styles from '../children/progresBarStyles';

export const ProgressBar = ({ progress }) => {
  const containerStyle = { ...styles.container };
  const filledStyle = { ...styles.filled, flex: progress };
  const unfilledStyle = { flex: 100 - progress };
  return (
    <View style={containerStyle}>
      <View style={filledStyle} />
      <View style={unfilledStyle} />
    </View>
  );
};
