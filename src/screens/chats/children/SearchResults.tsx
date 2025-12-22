import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import { Icon, UserAvatar } from '../../../components';
import { getHiveUsernameFromMattermostUser } from '../../../providers/chat/mattermost';
import { chatsStyles as styles } from '../styles/chats.styles';

interface SearchResultsProps {
  searchResults: { channels: any[]; users: any[] };
  safeExtractCommunityIdentifier: (channel: any) => string | undefined;
  onJoinChannel: (channel: any) => void;
  onStartDm: (user: any) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = React.memo(
  ({ searchResults, safeExtractCommunityIdentifier, onJoinChannel, onStartDm }) => {
    const intl = useIntl();

    const hasChannels = searchResults.channels.length > 0;
    const hasUsers = searchResults.users.length > 0;

    if (!hasChannels && !hasUsers) {
      return null;
    }

    return (
      <View style={styles.searchResults}>
        {hasChannels && (
          <View style={styles.searchSection}>
            <Text style={styles.sectionHeading}>
              {intl.formatMessage({ id: 'chats.channels', defaultMessage: 'Channels' })}
            </Text>
            {searchResults.channels.map((channel) => {
              const channelName = channel?.display_name || channel?.name || 'Unknown';
              const communityId = safeExtractCommunityIdentifier(channel);

              return (
                <View key={channel.id} style={styles.searchRow}>
                  {communityId ? (
                    <UserAvatar username={communityId} style={styles.searchRowAvatar} disableSize />
                  ) : (
                    <View style={styles.searchRowAvatarFallback}>
                      <Text style={styles.searchRowAvatarText}>
                        {channelName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.searchRowContent}>
                    <Text style={styles.channelName} numberOfLines={1}>
                      {channelName}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onJoinChannel(channel)}
                    style={styles.searchAction}
                  >
                    <Text style={styles.searchActionLabel}>
                      {intl.formatMessage({ id: 'chats.join', defaultMessage: 'Join' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {hasUsers && (
          <View style={styles.searchSection}>
            <Text style={styles.sectionHeading}>
              {intl.formatMessage({ id: 'chats.users', defaultMessage: 'Users' })}
            </Text>
            {searchResults.users.map((user) => {
              const hiveUsername = getHiveUsernameFromMattermostUser(user);
              const displayName = user?.nickname || user?.name || user?.username || hiveUsername;

              return (
                <View key={user.id} style={styles.searchRow}>
                  <UserAvatar username={hiveUsername} style={styles.searchRowAvatar} disableSize />
                  <View style={styles.searchRowContent}>
                    <Text style={styles.channelName} numberOfLines={1}>
                      {displayName}
                    </Text>
                    {hiveUsername && displayName !== hiveUsername && (
                      <Text style={styles.channelMeta} numberOfLines={1}>
                        @{hiveUsername}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => onStartDm(user)}
                    style={styles.searchMessageAction}
                  >
                    <Icon
                      name="message"
                      iconType="MaterialCommunityIcons"
                      size={20}
                      color="#357ce6"
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  },
);

SearchResults.displayName = 'SearchResults';
