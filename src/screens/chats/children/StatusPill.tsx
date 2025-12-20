import React from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { chatsStyles as styles } from '../styles/chats.styles';

interface StatusPillProps {
  isConnected: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = React.memo(({ isConnected }) => {
  const intl = useIntl();

  return (
    <View style={styles.statusPill}>
      <View style={[styles.statusDot, { backgroundColor: isConnected ? '#28a745' : '#dc3545' }]} />
      <Text style={styles.statusPillText}>
        {isConnected
          ? intl.formatMessage({ id: 'chats.connected', defaultMessage: 'Connected' })
          : intl.formatMessage({ id: 'chats.connecting', defaultMessage: 'Connecting...' })}
      </Text>
    </View>
  );
});

StatusPill.displayName = 'StatusPill';
