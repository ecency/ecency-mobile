import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useIntl } from 'react-intl';
import moment from 'moment';
import { SheetManager } from 'react-native-actions-sheet';

import ROUTES from '../../../constants/routeNames';
import { useAppSelector } from '../../../hooks';
import { SheetNames } from '../../../navigation/sheets';
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
import { Header, Icon, UserAvatar } from '../../../components';
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
    if (channel?.is_muted) {
      return {
        unreadMentions: 0,
        unreadMessages: 0,
        unreadCount: 0,
        totalUnread: 0,
      };
    }

    const unreadMentionValues = [
      channel?.unread_mentions,
      channel?.mention_count,
      channel?.mentions_count,
      channel?.mention_count_root,
      channel?.urgent_mention_count,
      channel?.channel_wide_mention_count,
    ].filter((value) => Number.isFinite(value)) as number[];

    const unreadMentions = unreadMentionValues.length ? Math.max(0, ...unreadMentionValues) : 0;

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

  const _getChannelId = useCallback((channel: any): string | undefined => {
    if (!channel) {
      return undefined;
    }

    return (
      channel.id ||
      channel.channel_id ||
      channel.channelId ||
      channel.channel?.id ||
      (typeof channel === 'string' ? channel : undefined)
    );
  }, []);

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
        const resolved = await _resolveChannelIdentity(channel);
        const channelId = resolved?.channelId || _getChannelId(channel) || channel?.name;

        if (!channelId) {
          throw new Error(
            intl.formatMessage({
              id: 'chats.unable_to_leave_channel',
              defaultMessage: 'Unable to leave channel. Please try again.',
            }),
          );
        }

        await leaveMattermostChannel(channelId);
        setChannels((prev) =>
          prev.filter(
            (item) =>
              item.id !== channelId &&
              item.channel_id !== channelId &&
              item.name !== channelId &&
              item.id !== channel.id &&
              item.channel_id !== channel.channel_id &&
              item.name !== channel.name,
          ),
        );
      } catch (err: any) {
        setError(
          err?.message ||
            intl.formatMessage({
              id: 'chats.unable_to_leave_channel',
              defaultMessage: 'Unable to leave channel. Please try again.',
            }),
        );
      }
    },
    [_ensureBootstrap, _getChannelId, _resolveChannelIdentity, intl],
  );

  const _confirmChannelOptions = useCallback(
    (channel: any) => {
      const name = channel.display_name || channel.name;
      SheetManager.show(SheetNames.ACTION_MODAL, {
        payload: {
          title: `${name} - ${intl.formatMessage({
            id: 'chats.channel_options',
            defaultMessage: 'Channel options',
          })}`,
          buttons: [
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
          ],
        },
      });
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
        const resolved = await _resolveChannelIdentity(channel);
        const channelId = resolved?.channelId || _getChannelId(channel) || channel?.name;

        if (channelId === channel?.name && (!resolved || resolved.channelId === channel?.name)) {
          throw new Error(
            intl.formatMessage({
              id: 'chats.unable_to_join_channel',
              defaultMessage: 'Unable to join channel. Please try again.',
            }),
          );
        }

        if (!channelId) {
          throw new Error(
            intl.formatMessage({
              id: 'chats.unable_to_join_channel',
              defaultMessage: 'Unable to join channel. Please try again.',
            }),
          );
        }

        const joined = await joinMattermostChannel(channelId);
        const joinedId = _getChannelId(joined) || channelId;
        const mergedChannel = { ...resolved?.resolvedChannel, ...channel, ...joined };
        const communityIdentifier = extractHiveCommunityIdentifier(mergedChannel);

        setChannels((prev) => {
          const exists = prev.find(
            (item) =>
              item.id === joinedId || item.channel_id === joinedId || item.name === joinedId,
          );
          if (exists) {
            return prev.map((item) =>
              item.id === joinedId || item.channel_id === joinedId || item.name === joinedId
                ? { ...item, ...mergedChannel }
                : item,
            );
          }
          return [mergedChannel, ...prev];
        });

        navigation.navigate(
          ROUTES.SCREENS.CHAT_THREAD as never,
          {
            channelId: joinedId,
            channelName: mergedChannel.display_name || mergedChannel.name || channel.name,
            channelDescription: mergedChannel.header || mergedChannel.purpose,
            communityIdentifier,
            bootstrapResult,
            userLookup,
            lastViewedAt: mergedChannel.last_viewed_at || mergedChannel.last_view_at,
          } as never,
        );
      } catch (err: any) {
        setSearchError(err?.message || 'Unable to join channel');
      }
    },
    [
      _ensureBootstrap,
      _getChannelId,
      _resolveChannelIdentity,
      bootstrapResult,
      intl,
      navigation,
      userLookup,
    ],
  );

  const _resolveDirectChannel = useCallback(
    async (dmChannel: any, user: any) => {
      const channelId = dmChannel?.id || dmChannel?.channel_id || dmChannel?.name;
      if (channelId) {
        setChannels((prev) => {
          const existing = prev.find(
            (item) =>
              item.id === channelId || item.channel_id === channelId || item.name === channelId,
          );

          if (existing) {
            return prev.map((item) =>
              item.id === channelId || item.channel_id === channelId || item.name === channelId
                ? { ...item, ...dmChannel }
                : item,
            );
          }

          return [dmChannel, ...prev];
        });

        return { channel: dmChannel, channelId };
      }

      const userId = user?.id || user?.user_id;
      if (!userId) {
        throw new Error(
          intl.formatMessage({
            id: 'chats.unable_to_start_dm',
            defaultMessage: 'Unable to start chat. Please try again.',
          }),
        );
      }

      const channelResponse = await fetchMattermostChannels();
      const normalizedChannels = _normalizeChannels(channelResponse);
      const existingDm = normalizedChannels.find(
        (channel) =>
          channel?.type === 'D' &&
          (channel?.teammate_id === userId || (channel?.name || '').split('__').includes(userId)),
      );

      if (existingDm) {
        const resolvedId = existingDm.id || existingDm.channel_id || existingDm.name;

        setChannels((prev) => {
          const already = prev.find(
            (item) =>
              item.id === resolvedId || item.channel_id === resolvedId || item.name === resolvedId,
          );

          if (already) {
            return prev.map((item) =>
              item.id === resolvedId || item.channel_id === resolvedId || item.name === resolvedId
                ? { ...item, ...existingDm }
                : item,
            );
          }

          return [existingDm, ...prev];
        });

        return { channel: existingDm, channelId: resolvedId };
      }

      throw new Error(
        intl.formatMessage({
          id: 'chats.unable_to_start_dm',
          defaultMessage: 'Unable to start chat. Please try again.',
        }),
      );
    },
    [_normalizeChannels, intl],
  );

  const _resolveChannelIdentity = useCallback(
    async (channel: any) => {
      const currentId = _getChannelId(channel);
      const name = channel?.name || channel?.display_name || currentId;

      if (currentId && name && currentId !== name) {
        return { channelId: currentId, resolvedChannel: channel };
      }

      if (!name) {
        return null;
      }

      const searched = await searchMattermostChannels(name);
      const normalized = _normalizeChannels(searched);
      const match = normalized.find(
        (item) =>
          _getChannelId(item) === currentId ||
          item.name === name ||
          item.display_name === channel?.display_name,
      );

      if (!match) {
        return null;
      }

      return { channelId: _getChannelId(match) || match.name || name, resolvedChannel: match };
    },
    [_getChannelId, _normalizeChannels],
  );

  const _handleStartDm = useCallback(
    async (user: any) => {
      try {
        await _ensureBootstrap();
        const dmChannel = await startMattermostDirectMessage(user);
        const { channel: resolvedChannel, channelId } = await _resolveDirectChannel(
          dmChannel,
          user,
        );
        const communityIdentifier = extractHiveCommunityIdentifier(resolvedChannel);

        navigation.navigate(
          ROUTES.SCREENS.CHAT_THREAD as never,
          {
            channelId,
            channelName: getHiveUsernameFromMattermostUser(user) || user.username || user.nickname,
            channelDescription: resolvedChannel.header || resolvedChannel.purpose,
            communityIdentifier,
            bootstrapResult,
            userLookup,
            lastViewedAt: resolvedChannel.last_viewed_at || resolvedChannel.last_view_at,
          } as never,
        );
      } catch (err: any) {
        setSearchError(err?.message || 'Unable to start chat');
      }
    },
    [_ensureBootstrap, _resolveDirectChannel, bootstrapResult, navigation, userLookup],
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
          communityIdentifier,
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
          {!!item.last_post_at && (
            <Text style={styles.channelMeta}>
              {moment(item.last_post_at).isSame(moment(), 'day')
                ? moment(item.last_post_at).format('h:mm A')
                : moment(item.last_post_at).format('MMM D, h:mm A')}
            </Text>
          )}
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

  const _renderSearchInput = () => {
    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon
            iconType="MaterialIcons"
            name="search"
            size={20}
            color="#788187"
            style={styles.searchIcon}
          />
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
          {!!searchQuery && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults({ channels: [], users: [] });
              }}
              style={styles.clearButton}
            >
              <Icon iconType="MaterialIcons" name="close" size={20} color="#788187" />
            </TouchableOpacity>
          )}
        </View>
        {!!searchError && <Text style={styles.errorText}>{searchError}</Text>}
      </View>
    );
  };

  const _renderSearchResults = () => {
    const hasResults = searchResults.channels.length || searchResults.users.length;
    if (!hasResults) {
      return null;
    }

    return (
      <View style={styles.searchResults}>
        {!!searchResults.channels.length && (
          <View style={styles.searchSection}>
            <Text style={styles.sectionHeading}>
              {intl.formatMessage({ id: 'chats.search_channels', defaultMessage: 'Channels' })}
            </Text>
            {searchResults.channels.map((channel) => {
              const isDirect = channel?.type === 'D';
              const communityIdentifier = extractHiveCommunityIdentifier(channel);
              const channelInitial = (channel.display_name || channel.name || '')
                ?.slice(0, 1)
                ?.toUpperCase();

              return (
                <View
                  key={channel.id || channel.channel_id || channel.name}
                  style={styles.searchRow}
                >
                  {isDirect ? (
                    <UserAvatar
                      username={channel.display_name || channel.name}
                      style={styles.searchRowAvatar}
                      disableSize
                    />
                  ) : communityIdentifier ? (
                    <UserAvatar
                      username={communityIdentifier}
                      style={styles.searchRowAvatar}
                      disableSize
                    />
                  ) : (
                    <View style={styles.searchRowAvatarFallback}>
                      <Text style={styles.searchRowAvatarText}>{channelInitial}</Text>
                    </View>
                  )}
                  <View style={styles.searchRowContent}>
                    <Text style={styles.channelName}>{channel.display_name || channel.name}</Text>
                    {!!channel.header && <Text style={styles.channelMeta}>{channel.header}</Text>}
                  </View>
                  <TouchableOpacity
                    style={styles.searchMessageAction}
                    onPress={() => _handleJoinChannel(channel)}
                  >
                    <Text style={styles.searchMessageActionLabel}>
                      {intl.formatMessage({ id: 'chats.join', defaultMessage: 'Join' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {!!searchResults.users.length && (
          <View style={styles.searchSection}>
            <Text style={styles.sectionHeading}>
              {intl.formatMessage({ id: 'chats.search_users', defaultMessage: 'Users' })}
            </Text>
            {searchResults.users.map((user) => {
              const username =
                getHiveUsernameFromMattermostUser(user) || user.username || user.nickname;
              return (
                <View key={user.id || user.user_id} style={styles.searchRow}>
                  <UserAvatar username={username} style={styles.searchRowAvatar} disableSize />
                  <View style={styles.searchRowContent}>
                    <Text style={styles.channelName}>{username}</Text>
                    {!!user.position && <Text style={styles.channelMeta}>{user.position}</Text>}
                  </View>
                  <TouchableOpacity
                    style={styles.searchMessageAction}
                    onPress={() => _handleStartDm(user)}
                  >
                    <Text style={styles.searchMessageActionLabel}>
                      {intl.formatMessage({ id: 'chats.message', defaultMessage: 'Message' })}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {(searchResults.channels.length > 0 || searchResults.users.length > 0) && (
          <Text style={{ ...styles.sectionHeading, marginTop: 8 }}>
            {intl.formatMessage({ id: 'chats.title', defaultMessage: 'Chats' })}
          </Text>
        )}
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
      const enriched = {
        ...channel,
        unreadMeta,
        // Order by the logged-in user's most recent interaction (last viewed),
        // falling back to latest post time if we have never opened the channel.
        lastInteraction: channel.last_viewed_at ?? channel.last_post_at ?? 0,
      };

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

    const sortByRecencyThenUnreadThenName = (list: any[]) =>
      list.sort((a, b) => {
        // First, sort by recency (most recent first)
        if (a.lastInteraction !== b.lastInteraction) {
          return b.lastInteraction - a.lastInteraction;
        }

        // Then by unread count (highest first)
        const unreadDiff = (b.unreadMeta?.totalUnread || 0) - (a.unreadMeta?.totalUnread || 0);
        if (unreadDiff !== 0) {
          return unreadDiff;
        }

        // Finally by name (alphabetical)
        const nameA = (a.display_name || a.name || '').toLowerCase();
        const nameB = (b.display_name || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

    const sortByRecencyThenName = (list: any[]) =>
      list.sort((a, b) => {
        // First, sort by recency (most recent first)
        if (a.lastInteraction !== b.lastInteraction) {
          return b.lastInteraction - a.lastInteraction;
        }

        // Then by name (alphabetical)
        const nameA = (a.display_name || a.name || '').toLowerCase();
        const nameB = (b.display_name || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

    return [
      ...sortByRecencyThenUnreadThenName(favorites),
      ...sortByRecencyThenUnreadThenName(unread),
      ...sortByRecencyThenName(regular),
      ...sortByRecencyThenUnreadThenName(muted),
    ];
  }, [channels, _getUnreadMeta]);

  return (
    <View style={styles.container}>
      <Header hideSearch={true} />

      <View style={styles.header}>
        {error && !isLoading && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.content}>
        {_renderSearchInput()}

        {(isLoading || isSearching) && <ActivityIndicator style={{ marginTop: 16 }} />}

        <FlatList
          data={sortedChannels}
          keyExtractor={(item, index) =>
            (item.id || item.channel_id || item.name || index).toString()
          }
          renderItem={_renderChannel}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => _loadChannels(true)} />
          }
          ListHeaderComponent={_renderSearchResults}
          ListEmptyComponent={_listEmpty}
          contentContainerStyle={
            !channels.length
              ? { flex: 1, justifyContent: 'center', paddingBottom: 56 }
              : { paddingBottom: 56, paddingHorizontal: 16 }
          }
        />
      </View>

      <View style={styles.statusPill}>
        <View
          style={[styles.statusDot, { backgroundColor: bootstrapResult ? '#4FD688' : '#c1c5c7' }]}
        />
        <Text style={styles.statusPillText}>
          {bootstrapResult
            ? intl.formatMessage({
                id: 'chats.connected',
                defaultMessage: 'Connected',
              })
            : intl.formatMessage({
                id: 'chats.connecting',
                defaultMessage: 'Connecting',
              })}
        </Text>
      </View>
    </View>
  );
};

export default ChatsScreen;
