import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import moment from 'moment';
import Icon from '../../../components/icon';
import {
  fetchMattermostPinnedPosts,
  getHiveUsernameFromMattermostUser,
} from '../../../providers/chat/mattermost';
import { ChatPost } from '../utils/messageFormatters';
import { normalizePost } from '../utils/postNormalizers';

interface PinnedMessagesModalProps {
  visible: boolean;
  channelId: string;
  userLookup: Record<string, any>;
  onClose: () => void;
  onMessagePress: (postId: string) => void;
  onUnpin: (post: ChatPost) => Promise<void>;
  canUnpin: (post: ChatPost) => boolean;
}

export const PinnedMessagesModal: React.FC<PinnedMessagesModalProps> = ({
  visible,
  channelId,
  userLookup,
  onClose,
  onMessagePress,
  onUnpin,
  canUnpin,
}) => {
  const intl = useIntl();
  const [pinnedPosts, setPinnedPosts] = useState<ChatPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadPinnedMessages();
    }
  }, [visible, channelId]);

  const loadPinnedMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMattermostPinnedPosts(channelId);
      // data could be an array of post IDs or an object with posts
      let posts: ChatPost[] = [];

      if (Array.isArray(data)) {
        // If it's an array of post IDs, we need to fetch the posts
        // For now, assume the API returns full posts
        posts = data.map(normalizePost).filter(Boolean) as ChatPost[];
      } else if (data?.order && data?.posts) {
        // Order array with posts object - check this more specific case first
        posts = data.order
          .map((id: string) => data.posts[id])
          .map(normalizePost)
          .filter(Boolean) as ChatPost[];
      } else if (data?.posts) {
        posts = Object.values(data.posts).map(normalizePost).filter(Boolean) as ChatPost[];
      }

      // Sort by create_at descending (newest first)
      posts.sort((a, b) => (b.create_at || 0) - (a.create_at || 0));

      setPinnedPosts(posts);
    } catch (err: any) {
      setError(err?.message || 'Failed to load pinned messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessagePress = useCallback(
    (post: ChatPost) => {
      if (post.id) {
        onMessagePress(post.id);
        onClose();
      }
    },
    [onMessagePress, onClose],
  );

  const handleUnpin = useCallback(
    async (post: ChatPost) => {
      try {
        await onUnpin(post);
        // Optimistically remove from local list
        setPinnedPosts((prev) => prev.filter((p) => p.id !== post.id));
      } catch (err) {
        // Error already handled by onUnpin callback
      }
    },
    [onUnpin],
  );

  const renderPinnedMessage = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
    ({ item }: { item: ChatPost }) => {
      const authorId = item.user_id;
      const author = authorId ? userLookup[authorId] : null;
      const username =
        getHiveUsernameFromMattermostUser(author) ||
        author?.nickname ||
        author?.username ||
        intl.formatMessage({ id: 'chats.anonymous', defaultMessage: 'Unknown user' });

      const timestamp = item.create_at || item.update_at;
      const timeAgo = timestamp ? moment(timestamp).fromNow() : '';
      const showUnpinButton = canUnpin(item);

      return (
        <TouchableOpacity
          style={styles.pinnedMessageItem}
          onPress={() => handleMessagePress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.pinnedMessageHeader}>
            <Text style={styles.pinnedMessageUsername}>{username}</Text>
            <View style={styles.pinnedMessageHeaderRight}>
              <Text style={styles.pinnedMessageTime}>{timeAgo}</Text>
              {showUnpinButton && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleUnpin(item);
                  }}
                  style={styles.unpinButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name="close"
                    iconType="MaterialIcons"
                    size={18}
                    color={EStyleSheet.value('$iconColor')}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.pinnedMessageText} numberOfLines={3}>
            {item.message || item.text || ''}
          </Text>
        </TouchableOpacity>
      );
    },
    [userLookup, handleMessagePress, canUnpin, handleUnpin, intl],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Icon
                name="pin"
                iconType="MaterialCommunityIcons"
                size={20}
                color={EStyleSheet.value('$primaryBlue')}
              />
              <Text style={styles.modalTitle}>
                {intl.formatMessage({
                  id: 'chats.pinned_messages',
                  defaultMessage: 'Pinned Messages',
                })}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Icon
                name="close"
                iconType="MaterialIcons"
                size={24}
                color={EStyleSheet.value('$iconColor')}
              />
            </TouchableOpacity>
          </View>

          {isLoading && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={EStyleSheet.value('$primaryBlue')} />
            </View>
          )}

          {error && (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!isLoading && !error && pinnedPosts.length === 0 && (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {intl.formatMessage({
                  id: 'chats.no_pinned_messages',
                  defaultMessage: 'No pinned messages',
                })}
              </Text>
            </View>
          )}

          {!isLoading && !error && pinnedPosts.length > 0 && (
            <FlatList
              data={pinnedPosts}
              renderItem={renderPinnedMessage}
              keyExtractor={(item) => item.id || String(Math.random())}
              contentContainerStyle={styles.listContent}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = EStyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '$primaryBackgroundColor',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '$borderColor',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '$primaryBlack',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pinnedMessageItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 4,
    backgroundColor: '$primaryLightBackground',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '$primaryBlue',
  },
  pinnedMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pinnedMessageUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryBlue',
  },
  pinnedMessageTime: {
    fontSize: 12,
    color: '$primaryDarkGray',
  },
  pinnedMessageHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unpinButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
  },
  pinnedMessageText: {
    fontSize: 14,
    color: '$primaryBlack',
    lineHeight: 20,
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '$primaryDarkGray',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '$primaryRed',
    textAlign: 'center',
  },
});
