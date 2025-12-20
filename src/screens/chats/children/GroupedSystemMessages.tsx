import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import moment from 'moment';
import { ChatPost, AddedUserInfo } from '../utils/messageFormatters';
import { UnreadMarker } from './UnreadMarker';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';

interface GroupedSystemMessage {
  type: 'grouped_system_add';
  id: string;
  posts: ChatPost[];
  create_at: number;
}

interface GroupedSystemMessagesProps {
  groupedItem: GroupedSystemMessage;
  index: number;
  firstUnreadIndex: number | null;
  getAddedUserInfo: (post: ChatPost) => AddedUserInfo;
  onShowUserProfile: (username?: string | null) => void;
}

export const GroupedSystemMessages: React.FC<GroupedSystemMessagesProps> = React.memo(
  ({ groupedItem, index, firstUnreadIndex, getAddedUserInfo, onShowUserProfile }) => {
    const intl = useIntl();
    const [isExpanded, setIsExpanded] = useState(false);
    const userCount = groupedItem.posts.length;

    const toggleExpanded = () => {
      setIsExpanded(!isExpanded);
    };

    return (
      <View>
        <UnreadMarker show={firstUnreadIndex !== null && index === firstUnreadIndex} />
        <View style={styles.systemMessageContainer}>
          <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.7}>
            <View style={styles.systemMessagePill}>
              <Text style={styles.systemBody}>
                {intl.formatMessage(
                  { id: 'chats.people_joined', defaultMessage: '{count} people joined' },
                  { count: userCount },
                )}
              </Text>
            </View>
          </TouchableOpacity>
          {isExpanded && (
            <View style={styles.expandedGroupContainer}>
              {groupedItem.posts.map((post, postIndex) => {
                const addedUserInfo = getAddedUserInfo(post);
                const timestamp = post.create_at || post.update_at;
                const durationSinceJoin = timestamp
                  ? moment.duration(moment().diff(moment(timestamp))).humanize()
                  : null;
                const joinedSuffix = durationSinceJoin
                  ? `joined ${durationSinceJoin} ago`
                  : 'joined';

                return (
                  <View
                    key={post.id || postIndex}
                    style={[styles.systemMessagePill, { marginBottom: 4 }]}
                  >
                    {addedUserInfo.normalizedUsername ? (
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
                      <Text style={styles.systemBody}>
                        {post.message || post.props?.message || post.text || 'Unknown user'}{' '}
                        {joinedSuffix}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  },
);

GroupedSystemMessages.displayName = 'GroupedSystemMessages';
