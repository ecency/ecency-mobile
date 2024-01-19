import React from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import styles from '../styles/swapFeeSection.styles';

// Reusable component for label, text input, and bottom text
export const SwapFeeSection = () => {
  const intl = useIntl();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{intl.formatMessage({ id: 'trade.fee' })}</Text>
      <View style={styles.freeContainer}>
        <Text style={styles.free}>{intl.formatMessage({ id: 'trade.free' })}</Text>
      </View>
    </View>
  );
};
