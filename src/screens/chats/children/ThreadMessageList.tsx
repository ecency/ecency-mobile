import React from 'react';
import { FlatList, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { ChatPost } from '../utils/messageFormatters';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';

interface GroupedSystemMessage {
  type: 'grouped_system_add';
  id: string;
  posts: ChatPost[];
  create_at: number;
}

interface ThreadMessageListProps {
  listRef: React.RefObject<FlatList>;
  processedPosts: Array<ChatPost | GroupedSystemMessage>;
  renderItem: (info: { item: any; index: number }) => JSX.Element;
  isRefreshing: boolean;
  onRefresh: () => void;
  isLoading: boolean;
  hasMorePosts: boolean;
  onLoadMore: () => void;
  error: string | null;
  listContentStyle: any;
  onScrollToIndexFailed: (info: { index: number }) => void;
  onContentSizeChange: () => void;
}

export const ThreadMessageList: React.FC<ThreadMessageListProps> = React.memo(
  ({
    listRef,
    processedPosts,
    renderItem,
    isRefreshing,
    onRefresh,
    isLoading,
    hasMorePosts,
    onLoadMore,
    error,
    listContentStyle,
    onScrollToIndexFailed,
    onContentSizeChange,
  }) => {
    const intl = useIntl();

    const renderEmptyList = () => {
      if (isLoading) {
        return null;
      }

      if (error) {
        return <Text style={styles.emptyState}>{error}</Text>;
      }

      return (
        <Text style={styles.emptyState}>
          {intl.formatMessage({
            id: 'chats.thread_empty',
            defaultMessage: 'No messages yet. Say hello to get the conversation started.',
          })}
        </Text>
      );
    };

    const renderFooter = () => {
      if (isLoading) {
        return <ActivityIndicator style={{ marginVertical: 24 }} />;
      }

      if (!hasMorePosts) {
        return (
          <Text style={styles.no_more_messages}>
            {intl.formatMessage({
              id: 'chats.no_more_messages',
              defaultMessage: 'No more messages here',
            })}
          </Text>
        );
      }

      return null;
    };

    return (
      <FlatList
        ref={listRef}
        data={processedPosts}
        keyExtractor={(item, index) => {
          if ('type' in item && item.type === 'grouped_system_add') {
            return item.id;
          }
          const postId = (item as ChatPost).id;
          return postId || `post_${index}`;
        }}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyList()}
        ListFooterComponent={renderFooter()}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={listContentStyle}
        keyboardShouldPersistTaps="handled"
        inverted={true}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        onContentSizeChange={onContentSizeChange}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />
    );
  },
);

ThreadMessageList.displayName = 'ThreadMessageList';
