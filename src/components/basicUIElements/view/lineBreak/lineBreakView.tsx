import React from 'react';
import { View } from 'react-native';
import styles from './lineBreakStyles';

const LineBreak = ({ color, children, height }: any) => (
  <View style={[styles.lineBreak, { height, color }]}>{children}</View>
);

export default LineBreak;
