import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { useIntl } from 'react-intl';
import { mattermostToUnicode } from '../../../utils/emojiMapper';
import { SheetNames } from '../../../navigation/sheets';
import styles from '../styles/emojiPickerSheet.styles';

interface EmojiPickerSheetProps {
  payload?: {
    onEmojiSelected: (emojiName: string) => void;
  };
}

const EMOJI_SIZE = 44;
const screenWidth = Dimensions.get('window').width;
const NUM_COLUMNS = Math.floor((screenWidth - 32) / EMOJI_SIZE);

// Common emojis to show
const COMMON_EMOJIS = [
  'grinning',
  'smiley',
  'smile',
  'grin',
  'laughing',
  'sweat_smile',
  'joy',
  'rofl',
  'relaxed',
  'blush',
  'innocent',
  'slightly_smiling_face',
  'upside_down_face',
  'wink',
  'relieved',
  'heart_eyes',
  'kissing_heart',
  'kissing',
  'kissing_smiling_eyes',
  'kissing_closed_eyes',
  'yum',
  'stuck_out_tongue_winking_eye',
  'stuck_out_tongue_closed_eyes',
  'stuck_out_tongue',
  'thinking_face',
  'neutral_face',
  'expressionless',
  'no_mouth',
  'smirk',
  'unamused',
  'grimacing',
  'lying_face',
  'pensive',
  'sleepy',
  'drooling_face',
  'sleeping',
  'mask',
  'face_with_thermometer',
  'face_with_head_bandage',
  'nauseated_face',
  'sneezing_face',
  'dizzy_face',
  'exploding_head',
  'cowboy_hat_face',
  'partying_face',
  'sunglasses',
  'nerd_face',
  'face_with_monocle',
  'confused',
  'worried',
  'slightly_frowning_face',
  'white_frowning_face',
  'open_mouth',
  'hushed',
  'astonished',
  'flushed',
  'pleading_face',
  'frowning',
  'anguished',
  'fearful',
  'cold_sweat',
  'disappointed_relieved',
  'cry',
  'sob',
  'scream',
  'confounded',
  'persevere',
  'disappointed',
  'sweat',
  'weary',
  'tired_face',
  'yawning_face',
  'triumph',
  'rage',
  'angry',
  'face_with_symbols_on_mouth',
  'smiling_imp',
  'imp',
  '+1',
  'thumbsup',
  '-1',
  'thumbsdown',
  'clap',
  'raised_hands',
  'pray',
  'handshake',
  'muscle',
  'metal',
  'ok_hand',
  'point_up',
  'point_down',
  'point_left',
  'point_right',
  'raised_hand',
  'wave',
  'heart',
  'broken_heart',
  'two_hearts',
  'sparkling_heart',
  'heartpulse',
  'heartbeat',
  'revolving_hearts',
  'cupid',
  'fire',
  'boom',
  'star',
  'star2',
  'sparkles',
  'zap',
  'tada',
  'confetti_ball',
  'balloon',
  'gift',
  'crown',
];

const EmojiPickerSheet = ({ payload }: EmojiPickerSheetProps) => {
  const intl = useIntl();

  // Convert emoji names to unicode characters
  const emojiData = useMemo(() => {
    return COMMON_EMOJIS.map((name) => ({
      name,
      emoji: mattermostToUnicode(name),
    })).filter((item) => item.emoji !== item.name); // Filter out items that didn't convert
  }, []);

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
    ({ item }: { item: { name: string; emoji: string } }) => (
      <TouchableOpacity style={styles.emojiButton} onPress={() => handleEmojiPress(item.name)}>
        <Text style={styles.emojiCharacter}>{item.emoji}</Text>
      </TouchableOpacity>
    ),
    [handleEmojiPress],
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

        <FlatList
          data={emojiData}
          renderItem={renderEmojiItem}
          keyExtractor={(item) => item.name}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.emojiList}
          showsVerticalScrollIndicator={true}
        />
      </View>
    </ActionSheet>
  );
};

export default EmojiPickerSheet;
