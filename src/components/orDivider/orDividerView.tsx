import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useIntl } from 'react-intl';
import styles from './orDividerStyles';

interface OrDividerProps {
  containerStyle?: ViewStyle;
}
const OrDivider = ({ containerStyle }: OrDividerProps) => {
  const intl = useIntl();
  return (
    <View style={[styles.dividerContainer, containerStyle]}>
      <View style={[styles.divider, styles.leftDivider]} />
      <Text style={styles.orText}>
        {intl.formatMessage({
          id: 'login.or',
        })}
      </Text>
      <View style={[styles.divider, styles.rightDivider]} />
    </View>
  );
};

export default OrDivider;
