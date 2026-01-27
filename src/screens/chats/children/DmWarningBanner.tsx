import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';

interface DmWarningBannerProps {
  onDismiss: () => void;
  onSettingsPress: () => void;
}

export const DmWarningBanner: React.FC<DmWarningBannerProps> = ({ onDismiss, onSettingsPress }) => {
  const intl = useIntl();

  return (
    <View style={styles.dmWarningContainer}>
      {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
      <Text style={styles.dmWarningIcon}>⚠️</Text>
      <View style={styles.dmWarningContent}>
        <Text style={styles.dmWarningTitle}>
          {intl.formatMessage({ id: 'chats.dm_warning_title' })}
        </Text>
        <Text style={styles.dmWarningBody}>
          {intl.formatMessage({ id: 'chats.dm_warning_body' })}{' '}
          <Text style={styles.dmWarningLink} onPress={onSettingsPress}>
            {intl.formatMessage({ id: 'chats.dm_warning_settings' })}
          </Text>
        </Text>
      </View>
      <TouchableOpacity onPress={onDismiss} style={styles.dmWarningClose}>
        {}
        <Text style={styles.dmWarningCloseText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};
