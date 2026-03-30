import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../../../components/icon';
import styles from '../styles/children.styles';

export type WavesFeedType = 'for-you' | 'following';

interface WavesHeaderProps {
  activeTag: string | null;
  activeAuthor: string | null;
  onClearTag: () => void;
  onClearAuthor: () => void;
}

export const WavesHeader = ({
  activeTag,
  activeAuthor,
  onClearTag,
  onClearAuthor,
}: WavesHeaderProps) => {
  if (!activeTag && !activeAuthor) {
    return null;
  }

  return (
    <View style={styles.tagChipRow}>
      {!!activeTag && (
        <TouchableOpacity style={styles.tagChip} onPress={onClearTag}>
          <Text style={styles.tagChipText}>#{activeTag}</Text>
          <Icon iconType="MaterialIcons" name="close" size={16} style={styles.tagChipClose} />
        </TouchableOpacity>
      )}
      {!!activeAuthor && (
        <TouchableOpacity style={styles.tagChip} onPress={onClearAuthor}>
          <Text style={styles.tagChipText}>@{activeAuthor}</Text>
          <Icon iconType="MaterialIcons" name="close" size={16} style={styles.tagChipClose} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default WavesHeader;
