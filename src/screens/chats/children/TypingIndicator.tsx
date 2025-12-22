import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';

interface TypingIndicatorProps {
  typingUsers: Record<string, any>;
  userLookup: Record<string, any>;
  currentUserId: string;
  getHiveUsername: (user: any) => string | null;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = React.memo(
  ({ typingUsers, userLookup, currentUserId, getHiveUsername }) => {
    const [fadeAnim] = useState(new Animated.Value(0));

    // Filter out current user and get usernames
    const typingUserIds = Object.keys(typingUsers).filter((id) => id !== currentUserId);
    const typingUsernames = typingUserIds
      .map((id) => {
        const user = userLookup[id];
        if (!user) {
          return null;
        }
        return getHiveUsername(user) || user.nickname || user.username || 'Someone';
      })
      .filter(Boolean) as string[];

    useEffect(() => {
      if (typingUsernames.length > 0) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }, [typingUsernames.length, fadeAnim]);

    if (typingUsernames.length === 0) {
      return null;
    }

    let typingText = '';
    if (typingUsernames.length === 1) {
      typingText = `${typingUsernames[0]} is typing...`;
    } else if (typingUsernames.length === 2) {
      typingText = `${typingUsernames[0]} and ${typingUsernames[1]} are typing...`;
    } else if (typingUsernames.length === 3) {
      typingText = `${typingUsernames[0]}, ${typingUsernames[1]}, and ${typingUsernames[2]} are typing...`;
    } else {
      typingText = `${typingUsernames[0]}, ${typingUsernames[1]}, and ${
        typingUsernames.length - 2
      } others are typing...`;
    }

    return (
      <Animated.View style={[styles.typingIndicatorContainer, { opacity: fadeAnim }]}>
        <View style={styles.typingDots}>
          <Text style={styles.typingDot}>•</Text>
          <Text style={styles.typingDot}>•</Text>
          <Text style={styles.typingDot}>•</Text>
        </View>
        <Text style={styles.typingText}>{typingText}</Text>
      </Animated.View>
    );
  },
);

TypingIndicator.displayName = 'TypingIndicator';
