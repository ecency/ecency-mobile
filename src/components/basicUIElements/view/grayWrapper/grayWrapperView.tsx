import React from 'react';
import { View } from 'react-native';
import styles from './grayWrapperStyles';

const GrayWrapper = ({ children, isGray }: any) =>
  isGray ? <View style={styles.wrapper}>{children}</View> : children;

export default GrayWrapper;
