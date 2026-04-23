import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../../../components/icon';
import styles from '../styles/children.styles';

export type WavesFeedType = 'for-you' | 'following';

interface WavesHeaderProps {
  activeTag: string | null;
  onClearTag: () => void;
}

export const WavesHeader = ({ activeTag, onClearTag }: WavesHeaderProps) => {
  if (!activeTag) {
    return null;
  }

  return (
    <View style={styles.tagChipRow}>
      <TouchableOpacity style={styles.tagChip} onPress={onClearTag}>
        <Text style={styles.tagChipText}>#{activeTag}</Text>
        <Icon iconType="MaterialIcons" name="close" size={16} style={styles.tagChipClose} />
      </TouchableOpacity>
    </View>
  );
};

export default WavesHeader;
