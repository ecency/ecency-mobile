import React from 'react';
import { FlatList, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { chatsStyles as styles } from '../styles/chats.styles';

interface ChannelListProps {
  channels: any[];
  renderChannel: (info: { item: any }) => JSX.Element;
  isRefreshing: boolean;
  onRefresh: () => void;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  isLoggedIn: boolean;
  searchResultsComponent: JSX.Element;
}

export const ChannelList: React.FC<ChannelListProps> = React.memo(
  ({
    channels,
    renderChannel,
    isRefreshing,
    onRefresh,
    isLoading,
    isSearching,
    error,
    isLoggedIn,
    searchResultsComponent,
  }) => {
    const intl = useIntl();

    const renderEmptyList = () => {
      if (isLoading) {
        return <ActivityIndicator style={{ marginTop: 32 }} />;
      }

      if (error) {
        return <Text style={styles.emptyState}>{error}</Text>;
      }

      if (!isLoggedIn) {
        return null;
      }

      return (
        <Text style={styles.emptyState}>
          {intl.formatMessage({
            id: 'chats.no_channels',
            defaultMessage: 'No channels yet. Search to join or start a new conversation.',
          })}
        </Text>
      );
    };

    if (isSearching) {
      return searchResultsComponent;
    }

    return (
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id || item.channel_id || item.name}
        renderItem={renderChannel}
        ListEmptyComponent={renderEmptyList()}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      />
    );
  },
);

ChannelList.displayName = 'ChannelList';
