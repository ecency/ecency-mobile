import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
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
} from '../../../providers/chat/mattermost';
import { UserAvatar } from '../../../components';
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
  const [error, setError] = useState<string | null>(null);
  const [userLookup, setUserLookup] = useState<Record<string, any>>({});

  const userLookupRef = useRef<Record<string, any>>({});

  const currentUserId = bootstrapResult?.user?.id;

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
        const session = await bootstrapMattermostSession(currentAccount, pinCode);
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
    [currentAccount, intl, isConnected, isLoggedIn, pinCode],
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

  const _renderChannel = ({ item }) => {
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
          <Text style={styles.channelName}>{displayName}</Text>
          {!!description && <Text style={styles.channelMeta}>{description}</Text>}
        </View>
      </TouchableOpacity>
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
        <View style={styles.card}>
          <TouchableOpacity style={styles.refreshButton} onPress={() => _loadChannels(true)}>
            <Text style={styles.refreshLabel}>
              {intl.formatMessage({ id: 'chats.refresh', defaultMessage: 'Refresh channels' })}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && <ActivityIndicator style={{ marginTop: 16 }} />}

        <FlatList
          data={channels}
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
