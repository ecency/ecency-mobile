import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import { Icon } from '../../../components/icon';
import styles from '../styles/children.styles';

export type WavesFeedType = 'for-you' | 'following';

interface WavesHeaderProps {
  feedType: WavesFeedType;
  activeTag: string | null;
  onTabChange: (tab: WavesFeedType) => void;
  onClearTag: () => void;
}

export const WavesHeader = ({ feedType, activeTag, onTabChange, onClearTag }: WavesHeaderProps) => {
  const intl = useIntl();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, feedType === 'for-you' && styles.activeTab]}
          onPress={() => onTabChange('for-you')}
        >
          <Text style={[styles.tabText, feedType === 'for-you' && styles.activeTabText]}>
            {intl.formatMessage({ id: 'waves.for_you' })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, feedType === 'following' && styles.activeTab]}
          onPress={() => onTabChange('following')}
        >
          <Text style={[styles.tabText, feedType === 'following' && styles.activeTabText]}>
            {intl.formatMessage({ id: 'waves.following' })}
          </Text>
        </TouchableOpacity>
      </View>

      {!!activeTag && (
        <View style={styles.tagChipRow}>
          <TouchableOpacity style={styles.tagChip} onPress={onClearTag}>
            <Text style={styles.tagChipText}>#{activeTag}</Text>
            <Icon iconType="MaterialIcons" name="close" size={16} style={styles.tagChipClose} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default WavesHeader;
