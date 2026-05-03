import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions, TextInput } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { useIntl } from 'react-intl';
import emojiMap from '../../../constants/emojiMap.json';
import { SheetNames } from '../../../navigation/sheets';
import styles from '../styles/emojiPickerSheet.styles';

interface EmojiPickerSheetProps {
  payload?: {
    onEmojiSelected: (emojiName: string) => void;
  };
}

interface EmojiItem {
  name: string;
  emoji: string;
  aliases: string[];
}

const EMOJI_SIZE = 44;
const screenWidth = Dimensions.get('window').width;
const NUM_COLUMNS = Math.floor((screenWidth - 32) / EMOJI_SIZE);
const ROW_HEIGHT = EMOJI_SIZE + 4;

// Build the full emoji list once at module load.
// Dedupe by unicode (one entry per visual emoji), preferring the shortest name as canonical —
// this matches utils/emojiMapper.ts#unicodeToMattermost so reaction names stay
// consistent whether they come from this picker or a unicode reverse lookup.
// Other names are kept as aliases so search can match "+1", "thumbsup", etc.
const ALL_EMOJIS: EmojiItem[] = (() => {
  const byUnicode = new Map<string, { name: string; names: string[] }>();
  Object.entries(emojiMap as Record<string, string>).forEach(([name, unicode]) => {
    if (!unicode || unicode === name) return; // skip text-fallback entries
    const existing = byUnicode.get(unicode);
    if (!existing) {
      byUnicode.set(unicode, { name, names: [name] });
      return;
    }
    existing.names.push(name);
    if (name.length < existing.name.length) {
      existing.name = name;
    }
  });
  return Array.from(byUnicode.entries())
    .map(([emoji, { name, names }]) => ({
      name,
      emoji,
      aliases: names.filter((n) => n !== name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
})();

const EmojiPickerSheet = ({ payload }: EmojiPickerSheetProps) => {
  const intl = useIntl();
  const [query, setQuery] = useState('');

  const filteredEmojis = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_EMOJIS;
    return ALL_EMOJIS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.aliases.some((alias) => alias.toLowerCase().includes(q)),
    );
  }, [query]);

  const handleEmojiPress = useCallback(
    (emojiName: string) => {
      SheetManager.hide(SheetNames.EMOJI_PICKER);
      payload?.onEmojiSelected?.(emojiName);
    },
    [payload],
  );

  const handleClose = useCallback(() => {
    SheetManager.hide(SheetNames.EMOJI_PICKER);
  }, []);

  const renderEmojiItem = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
    ({ item }: { item: EmojiItem }) => (
      <TouchableOpacity style={styles.emojiButton} onPress={() => handleEmojiPress(item.name)}>
        <Text style={styles.emojiCharacter}>{item.emoji}</Text>
      </TouchableOpacity>
    ),
    [handleEmojiPress],
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<EmojiItem> | null | undefined, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * Math.floor(index / NUM_COLUMNS),
      index,
    }),
    [],
  );

  return (
    <ActionSheet gestureEnabled={true} containerStyle={styles.sheetContent}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{intl.formatMessage({ id: 'chats.select_emoji' })}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder={intl.formatMessage({
            id: 'chats.search_emojis',
            defaultMessage: 'Search emojis...',
          })}
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        <FlatList
          data={filteredEmojis}
          renderItem={renderEmojiItem}
          keyExtractor={(item) => item.name}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.emojiList}
          showsVerticalScrollIndicator={true}
          getItemLayout={getItemLayout}
          initialNumToRender={NUM_COLUMNS * 8}
          maxToRenderPerBatch={NUM_COLUMNS * 6}
          windowSize={11}
          removeClippedSubviews={true}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {intl.formatMessage({
                id: 'chats.no_emoji_found',
                defaultMessage: 'No emoji found',
              })}
            </Text>
          }
        />
      </View>
    </ActionSheet>
  );
};

export default EmojiPickerSheet;
