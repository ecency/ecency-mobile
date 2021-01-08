import React from 'react';
import { View, SafeAreaView } from 'react-native';
import styles from './stickyBarStyles';

const StickyBar = ({ children, isFixedFooter, style }) => (
  <SafeAreaView>
    <View style={[styles.container, isFixedFooter && styles.fixedFooter, style]}>{children}</View>
  </SafeAreaView>
);

export default StickyBar;
