import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UserAvatar } from '../../../components';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';

interface MentionSuggestionsProps {
  mentionQuery: string | null;
  suggestions: any[];
  onSelectMention: (user: any) => void;
  getMentionUsername: (user: any) => string;
}

export const MentionSuggestions: React.FC<MentionSuggestionsProps> = React.memo(
  ({ mentionQuery, suggestions, onSelectMention, getMentionUsername }) => {
    if (mentionQuery === null || suggestions.length === 0) {
      return null;
    }

    return (
      <View style={styles.mentionSuggestionsContainer}>
        {suggestions.map((user) => {
          const username = getMentionUsername(user);
          const displayName =
            (typeof user?.nickname === 'string' && user.nickname) ||
            (typeof user?.name === 'string' && user.name) ||
            (typeof user?.username === 'string' && user.username) ||
            username;

          return (
            <TouchableOpacity
              key={user?.id || username}
              style={styles.mentionSuggestionRow}
              onPress={() => onSelectMention(user)}
            >
              <UserAvatar username={username} style={styles.mentionSuggestionAvatar} disableSize />
              <View style={styles.mentionSuggestionContent}>
                <Text style={styles.mentionSuggestionUsername}>{`@${username}`}</Text>
                {displayName && displayName !== username ? (
                  <Text style={styles.mentionSuggestionName} numberOfLines={1}>
                    {displayName}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  },
);

MentionSuggestions.displayName = 'MentionSuggestions';
