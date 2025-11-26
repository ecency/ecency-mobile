import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIntl } from 'react-intl';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

import { useAppSelector } from '../../../hooks';
import {
  bootstrapMattermostSession,
  fetchMattermostChannelPosts,
  fetchMattermostChannelMembers,
  fetchMattermostUsersByIds,
  sendMattermostMessage,
  getHiveUsernameFromMattermostUser,
  ensureMattermostUsersHaveHiveNames,
} from '../../../providers/chat/mattermost';
import { UserAvatar } from '../../../components';
import { chatThreadStyles as styles } from '../styles';

interface ChatThreadParams {
  channelId: string;
  channelName?: string;
  channelDescription?: string;
  bootstrapResult?: any;
  userLookup?: Record<string, any>;
}

interface ChatPost {
  id?: string;
  message?: string;
  user_id?: string;
  user?: { username?: string; nickname?: string; name?: string };
  create_at?: number;
  update_at?: number;
  props?: { message?: string };
  type?: string;
  text?: string;
}

const normalizePosts = (payload: any): ChatPost[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload.posts) {
    if (Array.isArray(payload.posts)) {
      return payload.posts;
    }

    if (payload.order && Array.isArray(payload.order)) {
      return payload.order.map((id: string) => payload.posts[id]).filter(Boolean);
    }

    return Object.values(payload.posts) as ChatPost[];
  }

  if (payload.items && Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
};

const normalizePost = (payload: any): ChatPost | null => {
  if (!payload) {
    return null;
  }

  if (payload.post) {
    return payload.post;
  }

  return payload;
};

const normalizeUserLookup = (lookup: Record<string, any> = {}) => {
  const next: Record<string, any> = {};

  Object.keys(lookup || {}).forEach((key) => {
    const user = lookup[key];
    next[key] = {
      ...user,
      hiveUsername: user?.hiveUsername || getHiveUsernameFromMattermostUser(user),
    };
  });

  return next;
};

const normalizeUsersFromMap = (usersMap?: Record<string, any>) =>
  usersMap ? Object.values(usersMap) : [];

const ChatThreadScreen = ({ route }: { route: { params: ChatThreadParams } }) => {
  const intl = useIntl();
  const navigation = useNavigation();

  const {
    channelId,
    channelName,
    channelDescription,
    bootstrapResult: initialBootstrap,
  } = route.params;

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);

  const [bootstrapResult, setBootstrapResult] = useState<any>(initialBootstrap);
  const [posts, setPosts] = useState<ChatPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasBootstrapped, setHasBootstrapped] = useState<boolean>(!!initialBootstrap);

  const userLookupRef = useRef<Record<string, any>>({});

  const [userLookup, setUserLookup] = useState<Record<string, any>>(() => {
    const normalized = normalizeUserLookup(route.params?.userLookup);
    userLookupRef.current = normalized;
    return normalized;
  });

  const _mergeUserLookup = useCallback(
    (mergeFn: (prev: Record<string, any>) => Record<string, any>) => {
      setUserLookup((prev) => {
        const next = mergeFn(prev);
        userLookupRef.current = next;
        return next;
      });
    },
    [],
  );

  const _sortPosts = useCallback(
    (list: ChatPost[]) =>
      [...list].sort((a, b) => {
        const first = a?.create_at || 0;
        const second = b?.create_at || 0;
        return first - second;
      }),
    [],
  );

  const _ensureBootstrap = useCallback(async () => {
    if (hasBootstrapped) {
      return;
    }

    const session = await bootstrapMattermostSession(currentAccount, pinCode);
    setBootstrapResult(session);
    setHasBootstrapped(true);
  }, [currentAccount, hasBootstrapped, pinCode]);

  useEffect(() => {
    const bootstrapUser = bootstrapResult?.user;
    if (bootstrapUser?.id) {
      _mergeUserLookup((prev) => ({
        ...prev,
        [bootstrapUser.id]: {
          ...bootstrapUser,
          hiveUsername: getHiveUsernameFromMattermostUser(bootstrapUser),
        },
      }));
    }
  }, [bootstrapResult, _mergeUserLookup]);

  useEffect(() => {
    const loadChannelMembers = async () => {
      try {
        await _ensureBootstrap();
        const members = await fetchMattermostChannelMembers(channelId);
        const memberIds = (members || [])
          .map((member: any) => member?.user_id || member?.id)
          .filter(Boolean);

        if (memberIds.length) {
          const users = await fetchMattermostUsersByIds(memberIds);
          _mergeUserLookup((prev) => ({ ...prev, ...ensureMattermostUsersHaveHiveNames(users) }));
        }
      } catch (err) {
        // ignore member lookup failures so messages still load
      }
    };

    loadChannelMembers();
  }, [channelId, _ensureBootstrap, _mergeUserLookup]);

  const _collectMissingUserIds = useCallback((list: ChatPost[]): string[] => {
    const ids = new Set<string>();

    list.forEach((post) => {
      const idFromPost = post?.user_id || post?.user?.id;
      if (idFromPost && !userLookupRef.current[idFromPost]) {
        ids.add(idFromPost);
      }
    });

    return Array.from(ids);
  }, []);

  const _formatJoinedMessage = useCallback(
    (post: ChatPost) => {
      const addedUserId =
        (post?.props as any)?.addedUserId ||
        (post?.props as any)?.userId ||
        (post?.props as any)?.added_user_id ||
        (post?.props as any)?.user_id;
      const addedUsername =
        (post?.props as any)?.addedUsername ||
        (post?.props as any)?.username ||
        (addedUserId &&
          (userLookup[addedUserId]?.hiveUsername ||
            getHiveUsernameFromMattermostUser(userLookup[addedUserId])));

      if (addedUsername) {
        const normalized = addedUsername.startsWith('@') ? addedUsername : `@${addedUsername}`;
        return `${normalized} joined`;
      }

      return post.message || post.props?.message || post.text || '';
    },
    [userLookup],
  );

  const _formatPostBody = useCallback(
    (post: ChatPost) => {
      if (post?.type === 'system_add_to_channel' || post?.type === 'system_add_to_team') {
        return _formatJoinedMessage(post);
      }

      return post.message || post.props?.message || post.text || '';
    },
    [_formatJoinedMessage],
  );

  const _resolveUserProfiles = useCallback(
    async (userIds: string[]) => {
      if (!userIds.length) {
        return;
      }

      try {
        const users = await fetchMattermostUsersByIds(userIds);
        const usersWithHiveNames = ensureMattermostUsersHaveHiveNames(users);
        _mergeUserLookup((prev) => ({ ...prev, ...usersWithHiveNames }));
      } catch (err) {
        // silently ignore user lookup errors so messages still load
      }
    },
    [_mergeUserLookup],
  );

  const _loadPosts = useCallback(
    async (refresh = false) => {
      setIsLoading(!refresh);
      setIsRefreshing(refresh);
      setError(null);

      try {
        await _ensureBootstrap();
        const data = await fetchMattermostChannelPosts(channelId);
        const userMap = ensureMattermostUsersHaveHiveNames(normalizeUsersFromMap(data?.users));
        if (Object.keys(userMap).length) {
          _mergeUserLookup((prev) => ({ ...prev, ...userMap }));
        }
        const normalizedPosts = _sortPosts(normalizePosts(data));
        setPosts(normalizedPosts);
        _resolveUserProfiles(_collectMissingUserIds(normalizedPosts));
      } catch (err: any) {
        setError(err?.message || 'Unable to load messages.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      _ensureBootstrap,
      _sortPosts,
      _collectMissingUserIds,
      _resolveUserProfiles,
      _mergeUserLookup,
      channelId,
    ],
  );

  useEffect(() => {
    _loadPosts(false);
  }, [_loadPosts]);

  const _handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    setError(null);
    setIsSending(true);
    try {
      await _ensureBootstrap();
      const response = await sendMattermostMessage(channelId, trimmedMessage);
      const newPost = normalizePost(response);
      if (newPost) {
        setPosts((prev) => _sortPosts([...prev, newPost]));
        _resolveUserProfiles(_collectMissingUserIds([newPost]));
      }
      setMessage('');
    } catch (err: any) {
      setError(err?.message || 'Unable to send your message.');
    } finally {
      setIsSending(false);
    }
  };

  const _renderItem = ({ item }: { item: ChatPost }) => {
    const isSystemAddMessage =
      item?.type === 'system_add_to_channel' || item?.type === 'system_add_to_team';
    const authorId = item.user_id || item.user?.id;
    const mappedUser = (authorId && userLookup[authorId]) || item.user;
    const hiveUsername = mappedUser?.hiveUsername || getHiveUsernameFromMattermostUser(mappedUser);
    const author =
      hiveUsername ||
      mappedUser?.nickname ||
      mappedUser?.username ||
      mappedUser?.name ||
      authorId ||
      intl.formatMessage({ id: 'chats.anonymous', defaultMessage: 'Unknown user' });
    const timestamp = item.create_at || item.update_at;
    const body = _formatPostBody(item);

    if (isSystemAddMessage) {
      return (
        <View style={[styles.message, styles.systemMessage]}>
          {!!timestamp && <Text style={styles.systemTimestamp}>{moment(timestamp).fromNow()}</Text>}
          {!!body && <Text style={styles.systemBody}>{body}</Text>}
        </View>
      );
    }

    return (
      <View style={styles.message}>
        <View style={styles.messageHeader}>
          <UserAvatar username={author} style={styles.messageAvatar} disableSize />
          <View style={styles.messageMeta}>
            <Text style={styles.author}>{author}</Text>
            {timestamp ? <Text style={styles.timestamp}>{moment(timestamp).fromNow()}</Text> : null}
          </View>
        </View>
        {!!body && <Text style={styles.body}>{body}</Text>}
      </View>
    );
  };

  const _header = useMemo(
    () => (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backLabel}>
            {intl.formatMessage({ id: 'chats.back', defaultMessage: 'Back to chats' })}
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>{channelName || channelId}</Text>
        {!!channelDescription && <Text style={styles.meta}>{channelDescription}</Text>}
      </View>
    ),
    [channelDescription, channelId, channelName, intl, navigation],
  );

  const _emptyList = useMemo(() => {
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
  }, [error, intl, isLoading]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {_header}

      {isLoading && <ActivityIndicator style={{ marginTop: 16 }} />}

      <FlatList
        data={posts}
        keyExtractor={(item, index) => (item.id || index).toString()}
        renderItem={_renderItem}
        ListEmptyComponent={_emptyList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => _loadPosts(true)} />
        }
        contentContainerStyle={styles.listContent}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder={intl.formatMessage({
              id: 'chats.message_placeholder',
              defaultMessage: 'Message',
            })}
            placeholderTextColor="#788187"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!message.trim() || isSending) && { opacity: 0.5 }]}
            onPress={_handleSend}
            disabled={!message.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.sendLabel}>
                {intl.formatMessage({ id: 'chats.send', defaultMessage: 'Send' })}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatThreadScreen;
