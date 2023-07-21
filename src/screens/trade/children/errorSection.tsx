import React from 'react';
import { View, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from '../styles/errorSection.styles';
import { Icon } from '../../../components';

interface Props {
  message: string | null;
}

// Reusable component for label, text input, and bottom text
export const ErrorSection = ({ message }: Props) => {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{message}</Text>
      <Icon
        iconType="MaterialIcons"
        name="error"
        color={EStyleSheet.value('$pureWhite')}
        size={24}
      />
    </View>
  );
};
