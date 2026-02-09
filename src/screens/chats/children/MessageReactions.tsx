import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getEmojiDisplay } from '../utils/messageFormatters';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';

interface ChatReaction {
  emoji_name: string;
  user_id: string;
  create_at?: number;
}

interface MessageReactionsProps {
  reactions: ChatReaction[] | undefined;
  isOwnMessage: boolean;
  bootstrapUserId: string;
  onReactionPress?: (emojiName: string) => void;
}

export const MessageReactions: React.FC<MessageReactionsProps> = React.memo(
  ({ reactions, isOwnMessage, bootstrapUserId, onReactionPress }) => {
    if (!reactions || reactions.length === 0) {
      return null;
    }

    // Group reactions by emoji_name
    const groupedReactions: Record<string, ChatReaction[]> = {};
    reactions.forEach((reaction) => {
      if (!groupedReactions[reaction.emoji_name]) {
        groupedReactions[reaction.emoji_name] = [];
      }
      groupedReactions[reaction.emoji_name].push(reaction);
    });

    return (
      <View
        style={[
          styles.reactionsContainer,
          isOwnMessage ? styles.reactionsContainerOwn : styles.reactionsContainerOther,
        ]}
      >
        {Object.entries(groupedReactions).map(([emojiName, reactionList]) => {
          const emojiDisplay = getEmojiDisplay(emojiName);
          const count = reactionList.length;
          const hasCurrentUserReaction = reactionList.some((r) => r.user_id === bootstrapUserId);

          return (
            <TouchableOpacity
              key={emojiName}
              style={[styles.reactionPill, hasCurrentUserReaction && styles.reactionPillActive]}
              onPress={() => onReactionPress?.(emojiName)}
              activeOpacity={0.7}
            >
              <Text style={styles.reactionEmoji}>{emojiDisplay}</Text>
              {count > 1 && (
                <Text
                  style={[
                    styles.reactionCount,
                    hasCurrentUserReaction && styles.reactionCountActive,
                  ]}
                >
                  {count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  },
);

MessageReactions.displayName = 'MessageReactions';
