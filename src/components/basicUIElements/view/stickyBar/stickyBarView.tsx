import React from 'react';
import { View } from 'react-native';
import styles from './stickyBarStyles';

const StickyBar = ({ children, isFixedFooter, style }) => (
  <View style={[styles.container, isFixedFooter && styles.fixedFooter, style]}>{children}</View>
);

export default StickyBar;
