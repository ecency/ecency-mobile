import React from 'react';
import { View } from 'react-native';
import styles from './stickyBarStyles';

const StickyBar = ({ children, isFixedFooter }) => (
  <View style={[styles.container, isFixedFooter && styles.fixedFooter]}>{children}</View>
);

export default StickyBar;
