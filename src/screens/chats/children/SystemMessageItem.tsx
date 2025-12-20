import React from 'react';
import { View, Text } from 'react-native';
import moment from 'moment';
import { ChatPost, ParsedMessageContent, AddedUserInfo } from '../utils/messageFormatters';
import { UnreadMarker } from './UnreadMarker';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';

interface SystemMessageItemProps {
  post: ChatPost;
  index: number;
  firstUnreadIndex: number | null;
  formatPostBody: (post: ChatPost, timestamp?: number) => string;
  parseMessageContent: (rawMessage: string, parseMentionUrl?: boolean) => ParsedMessageContent;
  getAddedUserInfo: (post: ChatPost) => AddedUserInfo;
  onShowUserProfile: (username?: string | null) => void;
}

export const SystemMessageItem: React.FC<SystemMessageItemProps> = React.memo(
  ({
    post,
    index,
    firstUnreadIndex,
    formatPostBody,
    parseMessageContent,
    getAddedUserInfo,
    onShowUserProfile,
  }) => {
    const timestamp = post.create_at || post.update_at;
    const formattedBody = formatPostBody(post, timestamp);
    const systemContent = parseMessageContent(formattedBody, false);
    const addedUserInfo = getAddedUserInfo(post);

    const durationSinceJoin = timestamp
      ? moment.duration(moment().diff(moment(timestamp))).humanize()
      : null;
    const joinedSuffix = durationSinceJoin ? `joined ${durationSinceJoin} ago` : 'joined';

    const joinedContent = addedUserInfo.normalizedUsername ? (
      <Text style={styles.systemBody}>
        <Text
          style={[styles.systemBody, styles.systemUsername]}
          onPress={() => onShowUserProfile(addedUserInfo.normalizedUsername)}
        >
          {addedUserInfo.normalizedUsername}
        </Text>{' '}
        {joinedSuffix}
      </Text>
    ) : (
      !!systemContent.text && <Text style={styles.systemBody}>{systemContent.text}</Text>
    );

    return (
      <View>
        <UnreadMarker show={firstUnreadIndex !== null && index === firstUnreadIndex} />
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemMessagePill}>{joinedContent}</View>
        </View>
      </View>
    );
  },
);

SystemMessageItem.displayName = 'SystemMessageItem';
