import React from 'react';
import { View, SafeAreaView } from 'react-native';
import styles from './stickyBarStyles';

const StickyBar = ({ children, isFixedFooter }) => (
  <SafeAreaView>
    <View style={[styles.container, isFixedFooter && styles.fixedFooter]}>{children}</View>
  </SafeAreaView>
);

export default StickyBar;
