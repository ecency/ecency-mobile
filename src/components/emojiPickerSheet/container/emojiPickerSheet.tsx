import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import EmojiPicker from 'rn-emoji-keyboard';
import { useIntl } from 'react-intl';
import { unicodeToMattermost } from '../../../utils/emojiMapper';
import styles from '../styles/emojiPickerSheet.styles';

interface EmojiPickerSheetProps {
  payload?: {
    onEmojiSelected: (emojiName: string) => void;
  };
}

const EmojiPickerSheet = ({ payload }: EmojiPickerSheetProps) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(true);

  const handleEmojiSelected = useCallback(
    (emoji: any) => {
      const mattermostName = unicodeToMattermost(emoji.emoji);
      SheetManager.hide('emoji_picker');
      payload?.onEmojiSelected?.(mattermostName);
    },
    [payload],
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
    SheetManager.hide('emoji_picker');
  }, []);

  return (
    <ActionSheet gestureEnabled={true} containerStyle={styles.sheetContent}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{intl.formatMessage({ id: 'chats.select_emoji' })}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <EmojiPicker
          onEmojiSelected={handleEmojiSelected}
          open={isOpen}
          onClose={handleClose}
          enableSearchBar
          categoryPosition="top"
        />
      </View>
    </ActionSheet>
  );
};

export default EmojiPickerSheet;
