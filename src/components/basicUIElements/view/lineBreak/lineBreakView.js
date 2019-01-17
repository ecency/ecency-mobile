import React from 'react';
import { View } from 'react-native';
import styles from './lineBreakStyles';

const LineBreak = ({
  color, children, height, style,
}) => (
  <View style={[styles.lineBreak, style, { height, color }]}>{children}</View>
);

export default LineBreak;
