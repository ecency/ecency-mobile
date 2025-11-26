import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useIntl } from 'react-intl';

import ROUTES from '../../../constants/routeNames';
import { useAppSelector } from '../../../hooks';
import {
  bootstrapMattermostSession,
  fetchMattermostChannels,
  fetchMattermostUsersByIds,
  getHiveUsernameFromMattermostUser,
  extractHiveCommunityIdentifier,
  ensureMattermostUsersHaveHiveNames,
  searchMattermostChannels,
  searchMattermostUsers,
  joinMattermostChannel,
  startMattermostDirectMessage,
  toggleMattermostChannelFavorite,
  toggleMattermostChannelMute,
  leaveMattermostChannel,
} from '../../../providers/chat/mattermost';
import { Icon, UserAvatar } from '../../../components';
import { chatsStyles as styles } from '../styles';

const ChatsScreen = () => {
  const intl = useIntl();
  const navigation = useNavigation();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const isConnected = useAppSelector((state) => state.application.isConnected);

  const [bootstrapResult, setBootstrapResult] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLookup, setUserLookup] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{ channels: any[]; users: any[] }>(() => ({
    channels: [],
    users: [],
  }));

  const userLookupRef = useRef<Record<string, any>>({});
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUserId = bootstrapResult?.user?.id;

  const _ensureBootstrap = useCallback(async () => {
    if (bootstrapResult) {
      return bootstrapResult;
    }

    const session = await bootstrapMattermostSession(currentAccount, pinCode);
    setBootstrapResult(session);
    return session;
  }, [bootstrapResult, currentAccount, pinCode]);

  const _normalizeChannels = (rawChannels: any): any[] => {
    if (!rawChannels) {
      return [];
    }
    if (Array.isArray(rawChannels)) {
      return rawChannels;
    }
    if (Array.isArray(rawChannels.channels)) {
      return rawChannels.channels;
    }
    return [];
  };

  const _collectDmUserIds = (channelList: any[], knownUsers: Record<string, any>): string[] => {
    const ids = new Set<string>();

    channelList
      .filter((channel) => channel?.type === 'D')
      .forEach((channel) => {
        const teammateId = channel?.teammate_id;
        if (teammateId && teammateId !== currentUserId && !knownUsers[teammateId]) {
          ids.add(teammateId);
        }

        const dmIds = (channel?.name || '').split('__');
        dmIds.forEach((id: string) => {
          if (id && id !== currentUserId && !knownUsers[id]) {
            ids.add(id);
          }
        });
      });

    return Array.from(ids);
  };

  const _getUnreadMeta = useCallback((channel: any) => {
    const unreadMentions = Number.isFinite(channel?.unread_mentions)
      ? channel.unread_mentions
      : Number.isFinite(channel?.mention_count)
      ? channel.mention_count
      : Number.isFinite(channel?.mentions_count)
      ? channel.mentions_count
      : 0;

    const unreadMessages = Number.isFinite(channel?.unread_messages)
      ? channel.unread_messages
      : Number.isFinite(channel?.unread_msg_count)
      ? channel.unread_msg_count
      : Number.isFinite(channel?.unread_count)
      ? channel.unread_count
      : 0;

    const unreadCount = unreadMentions || unreadMessages || 0;
    const totalUnread = Math.max(0, unreadMentions) + Math.max(0, unreadMessages);

    return {
      unreadMentions,
      unreadMessages,
      unreadCount,
      totalUnread,
    };
  }, []);

  const _seedDirectUsers = useCallback((channelList: any[]) => {
    const next: Record<string, any> = {};

    channelList
      .filter((channel) => channel?.type === 'D' && channel?.directUser?.id)
      .forEach((channel) => {
        const { directUser } = channel;
        next[directUser.id] = {
          ...directUser,
          hiveUsername: getHiveUsernameFromMattermostUser(directUser),
        };
      });

    if (Object.keys(next).length) {
      setUserLookup((prev) => {
        const merged = { ...prev, ...next };
        userLookupRef.current = merged;
        return merged;
      });
    }
  }, []);

  const _resolveUserProfiles = useCallback(async (userIds: string[]) => {
    try {
      const users = await fetchMattermostUsersByIds(userIds);
      const usersWithHiveNames = ensureMattermostUsersHaveHiveNames(users);
      setUserLookup((prev) => {
        const merged = { ...prev, ...usersWithHiveNames };
        userLookupRef.current = merged;
        return merged;
      });
    } catch (err) {
      // silently ignore user lookup errors so channel loading still works
    }
  }, []);

  const _loadChannels = useCallback(
    async (refresh = false) => {
      if (!isLoggedIn) {
        setError(
          intl.formatMessage({
            id: 'chats.login_required',
            defaultMessage: 'Sign in to start chatting with your communities.',
          }),
        );
        return;
      }

      if (isConnected === false) {
        setError(
          intl.formatMessage({
            id: 'alert.no_internet',
            defaultMessage: 'No Internet Connection',
          }),
        );
        return;
      }

      setError(null);
      setIsLoading(!refresh);
      setIsRefreshing(refresh);

      try {
        const session = await _ensureBootstrap();
        setBootstrapResult(session);

        const channelResponse = await fetchMattermostChannels();
        const normalizedChannels = _normalizeChannels(channelResponse);
        setChannels(normalizedChannels);

        _seedDirectUsers(normalizedChannels);

        const dmUserIds = _collectDmUserIds(normalizedChannels, userLookupRef.current);
        if (dmUserIds.length) {
          _resolveUserProfiles(dmUserIds);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load chats');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [_ensureBootstrap, intl, isConnected, isLoggedIn, _resolveUserProfiles],
  );

  useEffect(() => {
    if (isLoggedIn) {
      _loadChannels(false);
    }
  }, [isLoggedIn, _loadChannels]);

  useEffect(() => {
    const bootstrapUser = bootstrapResult?.user;
    if (bootstrapUser?.id) {
      setUserLookup((prev) => ({
        ...prev,
        [bootstrapUser.id]: {
          ...bootstrapUser,
          hiveUsername: getHiveUsernameFromMattermostUser(bootstrapUser),
        },
      }));
      userLookupRef.current = {
        ...userLookupRef.current,
        [bootstrapUser.id]: {
          ...bootstrapUser,
          hiveUsername: getHiveUsernameFromMattermostUser(bootstrapUser),
        },
      };
    }
  }, [bootstrapResult]);

  const _updateChannelState = useCallback((channelId: string, updates: Record<string, any>) => {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === channelId || channel.channel_id === channelId || channel.name === channelId
          ? { ...channel, ...updates }
          : channel,
      ),
    );
  }, []);

  const _handleToggleFavorite = useCallback(
    async (channel: any) => {
      try {
        await _ensureBootstrap();
        const shouldFavorite = !channel.is_favorite;
        const updated = await toggleMattermostChannelFavorite(
          channel.id || channel.channel_id,
          shouldFavorite,
        );
        _updateChannelState(channel.id || channel.channel_id, {
          ...updated,
          is_favorite: shouldFavorite,
        });
      } catch (err: any) {
        setError(err?.message || 'Unable to update favorites');
      }
    },
    [_ensureBootstrap, _updateChannelState],
  );

  const _handleToggleMute = useCallback(
    async (channel: any) => {
      try {
        await _ensureBootstrap();
        const shouldMute = !channel.is_muted;
        const updated = await toggleMattermostChannelMute(
          channel.id || channel.channel_id,
          shouldMute,
        );
        _updateChannelState(channel.id || channel.channel_id, {
          ...updated,
          is_muted: shouldMute,
        });
      } catch (err: any) {
        setError(err?.message || 'Unable to update mute');
      }
    },
    [_ensureBootstrap, _updateChannelState],
  );

  const _handleLeaveChannel = useCallback(
    async (channel: any) => {
      try {
        await _ensureBootstrap();
        await leaveMattermostChannel(channel.id || channel.channel_id);
        setChannels((prev) =>
          prev.filter(
            (item) =>
              item.id !== (channel.id || channel.channel_id) &&
              item.channel_id !== (channel.id || channel.channel_id) &&
              item.name !== (channel.id || channel.channel_id),
          ),
        );
      } catch (err: any) {
        setError(err?.message || 'Unable to leave channel');
      }
    },
    [_ensureBootstrap],
  );

  const _confirmChannelOptions = useCallback(
    (channel: any) => {
      const name = channel.display_name || channel.name;
      Alert.alert(
        name || intl.formatMessage({ id: 'chats.channel', defaultMessage: 'Channel' }),
        intl.formatMessage({ id: 'chats.channel_options', defaultMessage: 'Channel options' }),
        [
          {
            text: channel.is_favorite
              ? intl.formatMessage({ id: 'chats.unfavorite', defaultMessage: 'Remove favorite' })
              : intl.formatMessage({ id: 'chats.favorite', defaultMessage: 'Favorite' }),
            onPress: () => _handleToggleFavorite(channel),
          },
          {
            text: channel.is_muted
              ? intl.formatMessage({ id: 'chats.unmute', defaultMessage: 'Unmute' })
              : intl.formatMessage({ id: 'chats.mute', defaultMessage: 'Mute' }),
            onPress: () => _handleToggleMute(channel),
          },
          {
            text: intl.formatMessage({ id: 'chats.leave', defaultMessage: 'Leave channel' }),
            style: 'destructive',
            onPress: () => _handleLeaveChannel(channel),
          },
          {
            text: intl.formatMessage({ id: 'alert.cancel', defaultMessage: 'Cancel' }),
            style: 'cancel',
          },
        ],
        { cancelable: true },
      );
    },
    [_handleLeaveChannel, _handleToggleFavorite, _handleToggleMute, intl],
  );

  const _search = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (trimmed.length < 2) {
        setSearchResults({ channels: [], users: [] });
        setSearchError(null);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        setSearchError(null);
        await _ensureBootstrap();

        const [channelData, userData] = await Promise.all([
          searchMattermostChannels(trimmed),
          searchMattermostUsers(trimmed),
        ]);

        setSearchResults({
          channels: _normalizeChannels(channelData),
          users: Array.isArray(userData) ? userData : userData?.users || [],
        });
      } catch (err: any) {
        setSearchError(err?.message || 'Unable to search');
      } finally {
        setIsSearching(false);
      }
    },
    [_ensureBootstrap],
  );

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setSearchResults({ channels: [], users: [] });
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      _search(trimmedQuery);
    }, 350);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [_search, searchQuery]);

  const _handleJoinChannel = useCallback(
    async (channel: any) => {
      try {
        await _ensureBootstrap();
        const joined = await joinMattermostChannel(
          channel.id || channel.channel_id || channel.name,
        );
        setChannels((prev) => {
          const exists = prev.find(
            (item) =>
              item.id === (joined.id || joined.channel_id || joined.name) ||
              item.channel_id === (joined.id || joined.channel_id || joined.name) ||
              item.name === (joined.id || joined.channel_id || joined.name),
          );
          if (exists) {
            return prev.map((item) =>
              item.id === joined.id || item.channel_id === joined.id
                ? { ...item, ...joined }
                : item,
            );
          }
          return [joined, ...prev];
        });
      } catch (err: any) {
        setSearchError(err?.message || 'Unable to join channel');
      }
    },
    [_ensureBootstrap],
  );

  const _handleStartDm = useCallback(
    async (user: any) => {
      try {
        await _ensureBootstrap();
        const dmChannel = await startMattermostDirectMessage(user.id || user.user_id);
        setChannels((prev) => [dmChannel, ...prev]);
        navigation.navigate(
          ROUTES.SCREENS.CHAT_THREAD as never,
          {
            channelId: dmChannel.id || dmChannel.channel_id || dmChannel.name,
            channelName: getHiveUsernameFromMattermostUser(user) || user.username || user.nickname,
            channelDescription: dmChannel.purpose,
            bootstrapResult,
            userLookup,
            lastViewedAt: dmChannel.last_viewed_at || dmChannel.last_view_at,
          } as never,
        );
      } catch (err: any) {
        setSearchError(err?.message || 'Unable to start chat');
      }
    },
    [_ensureBootstrap, bootstrapResult, navigation, userLookup],
  );

  const _renderChannel = ({ item }) => {
    const { unreadCount: derivedUnreadCount } = _getUnreadMeta(item);
    const channelId = item.id || item.channel_id || item.name;
    const name = item.display_name || item.name || channelId;
    const description = item.header || item.purpose || '';
    const isDirect = item?.type === 'D';

    const dmUserIds = (item?.name || '').split('__');
    const teammateId = item?.teammate_id;
    const otherUserId = isDirect
      ? teammateId && teammateId !== currentUserId
        ? teammateId
        : dmUserIds.find((id: string) => id && id !== currentUserId)
      : null;
    const directUser = isDirect
      ? item?.directUser || (otherUserId ? userLookup[otherUserId] : null)
      : null;
    const fallbackUser = otherUserId ? userLookup[otherUserId] : null;
    const avatarUsername =
      getHiveUsernameFromMattermostUser(directUser) ||
      directUser?.username ||
      fallbackUser?.hiveUsername ||
      getHiveUsernameFromMattermostUser(fallbackUser);
    const displayName = isDirect
      ? avatarUsername ||
        directUser?.username ||
        fallbackUser?.username ||
        item.display_name ||
        name
      : name;
    const communityIdentifier = extractHiveCommunityIdentifier(item);

    const channelInitial = name?.slice(0, 1)?.toUpperCase();

    const _onPress = () => {
      navigation.navigate(
        ROUTES.SCREENS.CHAT_THREAD as never,
        {
          channelId,
          channelName: displayName,
          channelDescription: description,
          bootstrapResult,
          userLookup,
          lastViewedAt:
            item?.last_viewed_at ||
            item?.last_view_at ||
            item?.lastViewedAt ||
            item?.lastViewed ||
            null,
        } as never,
      );
    };

    return (
      <TouchableOpacity style={styles.channelRow} onPress={_onPress}>
        {isDirect ? (
          <UserAvatar
            username={
              avatarUsername ||
              directUser?.username ||
              fallbackUser?.username ||
              otherUserId ||
              name
            }
            style={styles.channelAvatar}
            disableSize
          />
        ) : communityIdentifier ? (
          <UserAvatar username={communityIdentifier} style={styles.channelAvatar} disableSize />
        ) : (
          <View style={styles.channelAvatarFallback}>
            <Text style={styles.channelAvatarText}>{channelInitial}</Text>
          </View>
        )}
        <View style={styles.channelRowContent}>
          <View style={styles.channelTitleRow}>
            <Text style={styles.channelName}>{displayName}</Text>
            {item.is_favorite && (
              <Icon
                name="star"
                iconType="MaterialIcons"
                size={16}
                color="#E6B100"
                style={styles.channelMetaIcon}
              />
            )}
            {item.is_muted && (
              <Icon
                name="volume-off"
                iconType="MaterialCommunityIcons"
                size={16}
                color="#8A8F93"
                style={styles.channelMetaIcon}
              />
            )}
          </View>
          {!!description && <Text style={styles.channelMeta}>{description}</Text>}
        </View>
        {!!derivedUnreadCount && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{derivedUnreadCount}</Text>
          </View>
        )}
        {!isDirect && (
          <TouchableOpacity
            onPress={() => _confirmChannelOptions(item)}
            style={styles.channelOptions}
          >
            <Text style={styles.optionsLabel}>⋯</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const _renderSearchResults = () => {
    const hasResults = searchResults.channels.length || searchResults.users.length;
    return (
      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text.toLowerCase())}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={intl.formatMessage({
            id: 'chats.search_placeholder',
            defaultMessage: 'Search channels or users',
          })}
          placeholderTextColor="#788187"
          style={styles.searchInput}
        />
        {isSearching && <ActivityIndicator style={styles.searchSpinner} />}
        {!!searchError && <Text style={styles.errorText}>{searchError}</Text>}

        {hasResults ? (
          <View style={styles.searchResults}>
            {!!searchResults.channels.length && (
              <View style={styles.searchSection}>
                <Text style={styles.sectionHeading}>
                  {intl.formatMessage({ id: 'chats.search_channels', defaultMessage: 'Channels' })}
                </Text>
                {searchResults.channels.map((channel) => (
                  <View
                    key={channel.id || channel.channel_id || channel.name}
                    style={styles.searchRow}
                  >
                    <View style={styles.searchRowContent}>
                      <Text style={styles.channelName}>{channel.display_name || channel.name}</Text>
                      {!!channel.header && <Text style={styles.channelMeta}>{channel.header}</Text>}
                    </View>
                    <TouchableOpacity
                      style={styles.searchAction}
                      onPress={() => _handleJoinChannel(channel)}
                    >
                      <Text style={styles.searchActionLabel}>
                        {intl.formatMessage({ id: 'chats.join', defaultMessage: 'Join' })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {!!searchResults.users.length && (
              <View style={styles.searchSection}>
                <Text style={styles.sectionHeading}>
                  {intl.formatMessage({ id: 'chats.search_users', defaultMessage: 'Users' })}
                </Text>
                {searchResults.users.map((user) => (
                  <View key={user.id || user.user_id} style={styles.searchRow}>
                    <View style={styles.searchRowContent}>
                      <Text style={styles.channelName}>
                        {getHiveUsernameFromMattermostUser(user) || user.username || user.nickname}
                      </Text>
                      {!!user.position && <Text style={styles.channelMeta}>{user.position}</Text>}
                    </View>
                    <TouchableOpacity
                      style={styles.searchAction}
                      onPress={() => _handleStartDm(user)}
                    >
                      <Text style={styles.searchActionLabel}>
                        {intl.formatMessage({
                          id: 'chats.message_placeholder',
                          defaultMessage: 'Message',
                        })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}
      </View>
    );
  };

  const _listEmpty = useMemo(() => {
    if (isLoading) {
      return null;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (!isLoggedIn) {
      return (
        <Text style={styles.emptyState}>
          {intl.formatMessage({
            id: 'chats.login_required',
            defaultMessage: 'Sign in to start chatting with your communities.',
          })}
        </Text>
      );
    }

    return (
      <Text style={styles.emptyState}>
        {intl.formatMessage({
          id: 'chats.empty',
          defaultMessage: 'No chats yet. Join a community to see its channels here.',
        })}
      </Text>
    );
  }, [error, intl, isLoading, isLoggedIn]);

  const sortedChannels = useMemo(() => {
    const favorites: any[] = [];
    const unread: any[] = [];
    const regular: any[] = [];
    const muted: any[] = [];

    channels.forEach((channel) => {
      const unreadMeta = _getUnreadMeta(channel);
      const enriched = { ...channel, unreadMeta };

      if (channel?.is_muted) {
        muted.push(enriched);
      } else if (channel?.is_favorite) {
        favorites.push(enriched);
      } else if (unreadMeta.unreadCount > 0) {
        unread.push(enriched);
      } else {
        regular.push(enriched);
      }
    });

    const sortByUnreadThenName = (list: any[]) =>
      list.sort((a, b) => {
        const unreadDiff = (b.unreadMeta?.totalUnread || 0) - (a.unreadMeta?.totalUnread || 0);
        if (unreadDiff !== 0) {
          return unreadDiff;
        }

        const nameA = (a.display_name || a.name || '').toLowerCase();
        const nameB = (b.display_name || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

    const sortByName = (list: any[]) =>
      list.sort((a, b) =>
        (a.display_name || a.name || '')
          .toLowerCase()
          .localeCompare((b.display_name || b.name || '').toLowerCase()),
      );

    return [
      ...sortByUnreadThenName(favorites),
      ...sortByUnreadThenName(unread),
      ...sortByName(regular),
      ...sortByUnreadThenName(muted),
    ];
  }, [channels, _getUnreadMeta]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {intl.formatMessage({ id: 'chats.title', defaultMessage: 'Chats' })}
        </Text>
        <Text style={styles.subtitle}>
          {intl.formatMessage({
            id: 'chats.subtitle',
            defaultMessage:
              'Message your communities and friends. Ecency signs you in to our Mattermost-powered chat using your Hive session.',
          })}
        </Text>
        <View style={styles.statusRow}>
          <View
            style={[styles.statusDot, { backgroundColor: bootstrapResult ? '#4FD688' : '#c1c5c7' }]}
          />
          <Text style={styles.channelMeta}>
            {bootstrapResult
              ? intl.formatMessage({
                  id: 'chats.connected',
                  defaultMessage: 'Connected to chat.ecency.com',
                })
              : intl.formatMessage({
                  id: 'chats.connecting',
                  defaultMessage: 'Preparing your chat session…',
                })}
          </Text>
        </View>
        {error && !isLoading && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.content}>
        {_renderSearchResults()}

        {isLoading && <ActivityIndicator style={{ marginTop: 16 }} />}

        <FlatList
          data={sortedChannels}
          keyExtractor={(item, index) =>
            (item.id || item.channel_id || item.name || index).toString()
          }
          renderItem={_renderChannel}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => _loadChannels(true)} />
          }
          ListEmptyComponent={_listEmpty}
          contentContainerStyle={
            !channels.length ? { flex: 1, justifyContent: 'center' } : undefined
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default ChatsScreen;
