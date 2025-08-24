import React from 'react';
import { View } from 'react-native';
import styles from './lineBreakStyles';

const LineBreak = ({ color, children, height }) => (
  <View style={[styles.lineBreak, { height, color }]}>{children}</View>
);

export default LineBreak;
