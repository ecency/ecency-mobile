import React, { useCallback, useMemo } from 'react';
import { Share, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import ActionSheet from 'react-native-actions-sheet';
import { FlatList } from 'react-native-gesture-handler';
import { SheetManager } from 'react-native-actions-sheet';

import { writeToClipboard } from '../../../utils/clipboard';
import { toastNotification } from '../../../redux/actions/uiAction';
import { useAppDispatch } from '../../../hooks';
import styles from '../styles/chatOptionsSheet.styles';

interface ChatReaction {
  emoji_name: string;
  user_id: string;
  create_at?: number;
}

interface ChatPost {
  id?: string;
  message?: string;
  user_id?: string;
  edit_at?: number;
  props?: { message?: string; reactions?: ChatReaction[] };
  metadata?: { reactions?: ChatReaction[] };
}

interface ChatOptionsSheetProps {
  payload?: {
    post: ChatPost;
    channelId: string;
    onReply?: () => void;
    onReaction?: (emojiName: string) => void;
    onEdit?: () => void;
    onRemove?: () => void;
    onTranslate?: () => void;
    onPin?: () => void;
    onUnpin?: () => void;
    currentUserId?: string;
    isOwnMessage?: boolean;
    canModerate?: boolean;
  };
}

const REACTION_EMOJIS = [
  { name: '+1', emoji: '👍' },
  { name: '-1', emoji: '👎' },
  { name: 'smile', emoji: '😄' },
  { name: 'heart', emoji: '❤️' },
  { name: 'tada', emoji: '🎉' },
  { name: 'rocket', emoji: '🚀' },
  { name: 'eyes', emoji: '👀' },
];

const ChatOptionsSheet = ({ payload }: ChatOptionsSheetProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const post = payload?.post;
  const onReply = payload?.onReply;
  const onReaction = payload?.onReaction;
  const onEdit = payload?.onEdit;
  const onRemove = payload?.onRemove;
  const onPin = payload?.onPin;
  const onUnpin = payload?.onUnpin;
  const isOwnMessage = payload?.isOwnMessage || false;
  const canModerate = payload?.canModerate || false;

  const _handleReactionPress = useCallback(
    (emojiName: string) => {
      SheetManager.hide('chat_options');
      if (onReaction) {
        onReaction(emojiName);
      }
    },
    [onReaction],
  );

  const _handleCopy = useCallback(async () => {
    const message = post?.message || post?.props?.message || '';
    if (message) {
      await writeToClipboard(message);
      SheetManager.hide('chat_options');
      dispatch(
        toastNotification(
          intl.formatMessage({ id: 'alert.copied', defaultMessage: 'Copied to clipboard' }),
        ),
      );
    }
  }, [post, dispatch, intl]);

  const _handleShare = useCallback(() => {
    const message = post?.message || post?.props?.message || '';
    if (message) {
      SheetManager.hide('chat_options');
      Share.share({
        message,
      });
    }
  }, [post]);

  const _handleTranslate = useCallback(() => {
    SheetManager.hide('chat_options');
    setTimeout(() => {
      if (payload?.onTranslate) {
        payload.onTranslate();
      }
    }, 300);
  }, [payload]);

  const _handleReply = useCallback(() => {
    SheetManager.hide('chat_options');
    if (onReply) {
      onReply();
    }
  }, [onReply]);

  const _handleEdit = useCallback(() => {
    SheetManager.hide('chat_options');
    if (onEdit) {
      onEdit();
    }
  }, [onEdit]);

  const _handleRemove = useCallback(() => {
    SheetManager.hide('chat_options');
    if (onRemove) {
      onRemove();
    }
  }, [onRemove]);

  const _handlePin = useCallback(() => {
    SheetManager.hide('chat_options');
    if (onPin) {
      onPin();
    }
  }, [onPin]);

  const _handleUnpin = useCallback(() => {
    SheetManager.hide('chat_options');
    if (onUnpin) {
      onUnpin();
    }
  }, [onUnpin]);

  const _renderReactionItem = useCallback(
    ({ item }: { item: { name: string; emoji: string } }) => {
      return (
        <TouchableOpacity
          style={styles.reactionButton}
          onPress={() => _handleReactionPress(item.name)}
        >
          <Text style={styles.reactionEmoji}>{item.emoji}</Text>
        </TouchableOpacity>
      );
    },
    [_handleReactionPress],
  );

  const _renderOptionItem = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
    ({ item }: { item: { key: string; label: string; destructive?: boolean } }) => {
      const _onPress = () => {
        switch (item.key) {
          case 'reply':
            _handleReply();
            break;
          case 'copy':
            _handleCopy();
            break;
          case 'share':
            _handleShare();
            break;
          case 'translate':
            _handleTranslate();
            break;
          case 'edit':
            _handleEdit();
            break;
          case 'pin':
            _handlePin();
            break;
          case 'unpin':
            _handleUnpin();
            break;
          case 'remove':
            _handleRemove();
            break;
          default:
            break;
        }
      };

      return (
        <TouchableHighlight
          underlayColor={EStyleSheet.value('$primaryLightBackground')}
          onPress={_onPress}
        >
          <Text style={[styles.optionItem, item.destructive && styles.optionItemDestructive]}>
            {item.label}
          </Text>
        </TouchableHighlight>
      );
    },
    [_handleReply, _handleCopy, _handleShare, _handleTranslate, _handleEdit, _handlePin, _handleUnpin, _handleRemove],
  );

  const options = useMemo(() => {
    const opts = [
      {
        key: 'reply',
        label: intl.formatMessage({ id: 'chats.reply', defaultMessage: 'REPLY' }),
      },
      {
        key: 'copy',
        label: intl.formatMessage({ id: 'chats.copy', defaultMessage: 'COPY' }),
      },
      {
        key: 'share',
        label: intl.formatMessage({ id: 'chats.share', defaultMessage: 'SHARE' }),
      },
      {
        key: 'translate',
        label: intl.formatMessage({ id: 'chats.translate', defaultMessage: 'TRANSLATE' }),
      },
    ];

    if (isOwnMessage && onEdit) {
      opts.push({
        key: 'edit',
        label: intl.formatMessage({
          id: 'chats.edit_message',
          defaultMessage: 'EDIT',
        }),
      });
    }

    if (onPin) {
      opts.push({
        key: 'pin',
        label: intl.formatMessage({
          id: 'chats.pin',
          defaultMessage: 'PIN',
        }),
      });
    }

    if (onUnpin) {
      opts.push({
        key: 'unpin',
        label: intl.formatMessage({
          id: 'chats.unpin',
          defaultMessage: 'UNPIN',
        }),
      });
    }

    if ((isOwnMessage || canModerate) && onRemove) {
      opts.push({
        key: 'remove',
        label: intl.formatMessage({ id: 'chats.remove', defaultMessage: 'REMOVE' }),
        destructive: true,
      });
    }

    return opts;
  }, [intl, isOwnMessage, canModerate, onEdit, onPin, onUnpin, onRemove]);

  return (
    <ActionSheet
      gestureEnabled={true}
      hideUnderlay={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.indicator}
    >
      <View style={styles.container}>
        <View style={styles.reactionsSection}>
          <FlatList
            data={REACTION_EMOJIS}
            renderItem={_renderReactionItem}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reactionsList}
          />
        </View>

        <View style={styles.optionsSection}>
          <FlatList
            data={options}
            renderItem={_renderOptionItem}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.optionsList}
          />
        </View>
      </View>
    </ActionSheet>
  );
};

export default ChatOptionsSheet;
