import React from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';

interface UnreadMarkerProps {
  show: boolean;
}

export const UnreadMarker: React.FC<UnreadMarkerProps> = React.memo(({ show }) => {
  const intl = useIntl();

  if (!show) {
    return null;
  }

  return (
    <View style={styles.unreadMarker}>
      <View style={styles.unreadLine} />
      <Text style={styles.unreadLabel}>
        {intl.formatMessage({ id: 'chats.new_messages', defaultMessage: 'New messages' })}
      </Text>
      <View style={styles.unreadLine} />
    </View>
  );
});

UnreadMarker.displayName = 'UnreadMarker';
