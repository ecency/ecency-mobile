import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIntl } from 'react-intl';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';

import { useAppSelector } from '../../../hooks';
import {
  bootstrapMattermostSession,
  fetchMattermostChannelPosts,
  fetchMattermostChannelMembers,
  fetchMattermostUsersByIds,
  sendMattermostMessage,
  getHiveUsernameFromMattermostUser,
  ensureMattermostUsersHaveHiveNames,
  deleteMattermostMessage,
  fetchMattermostChannelModeration,
  updateMattermostMessage,
  markMattermostChannelViewed,
} from '../../../providers/chat/mattermost';
import { uploadImage } from '../../../providers/ecency/ecency';
import { signImage } from '../../../providers/hive/dhive';
import { Icon, UserAvatar } from '../../../components';
import { chatThreadStyles as styles } from '../styles';
import { emojifyMessage } from '../../../utils/emoji';

interface ChatThreadParams {
  channelId: string;
  channelName?: string;
  channelDescription?: string;
  bootstrapResult?: any;
  userLookup?: Record<string, any>;
  lastViewedAt?: number;
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

const extractImageLinks = (text?: string) => {
  if (!text) {
    return [] as string[];
  }

  const matches = text.match(/https?:\/\/images\.ecency\.com\S+/gi);
  return matches || [];
};

const ChatThreadScreen = ({ route }: { route: { params: ChatThreadParams } }) => {
  const intl = useIntl();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasBootstrapped, setHasBootstrapped] = useState<boolean>(!!initialBootstrap);
  const [canModerate, setCanModerate] = useState<boolean>(false);
  const [lastViewedAt, setLastViewedAt] = useState<number | null>(
    route.params?.lastViewedAt ?? null,
  );
  const [firstUnreadIndex, setFirstUnreadIndex] = useState<number | null>(null);
  const [hasScrolledToUnread, setHasScrolledToUnread] = useState<boolean>(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const userLookupRef = useRef<Record<string, any>>({});
  const listRef = useRef<FlatList<ChatPost>>(null);
  const inputRef = useRef<TextInput>(null);
  const lastMarkedViewedAtRef = useRef<number | null>(null);

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

        const bootstrapUserId = bootstrapResult?.user?.id;
        if (!lastViewedAt && bootstrapUserId) {
          const selfMember = members?.find(
            (member: any) => member?.user_id === bootstrapUserId || member?.id === bootstrapUserId,
          );

          if (selfMember?.last_viewed_at) {
            setLastViewedAt(selfMember.last_viewed_at);
          }
        }

        if (memberIds.length) {
          const users = await fetchMattermostUsersByIds(memberIds);
          _mergeUserLookup((prev) => ({ ...prev, ...ensureMattermostUsersHaveHiveNames(users) }));
        }
      } catch (err) {
        // ignore member lookup failures so messages still load
      }
    };

    loadChannelMembers();
  }, [channelId, _ensureBootstrap, _mergeUserLookup, bootstrapResult, lastViewedAt]);

  useEffect(() => {
    const resolveModeration = async () => {
      try {
        await _ensureBootstrap();
        const moderation = await fetchMattermostChannelModeration(channelId);
        if (typeof moderation?.canModerate === 'boolean') {
          setCanModerate(moderation.canModerate);
        }
      } catch (err) {
        setCanModerate(false);
      }
    };

    resolveModeration();
  }, [channelId, _ensureBootstrap]);

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

  const _parseMessageContent = useCallback((rawMessage: string) => {
    const imageLinks = extractImageLinks(rawMessage);

    const textWithoutImages = rawMessage.replace(/https?:\/\/images\.ecency\.com\S+/gi, ' ').trim();
    const emojifiedText = emojifyMessage(textWithoutImages);

    return {
      text: emojifiedText,
      images: imageLinks,
    };
  }, []);

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
        const membershipRecord =
          data?.member ||
          data?.membership ||
          (Array.isArray(data?.members)
            ? data.members.find(
                (member: any) =>
                  member?.user_id === bootstrapResult?.user?.id ||
                  member?.id === bootstrapResult?.user?.id,
              )
            : null);

        if (membershipRecord?.last_viewed_at || membershipRecord?.last_view_at) {
          setLastViewedAt(membershipRecord.last_viewed_at || membershipRecord.last_view_at || null);
        }
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
      bootstrapResult,
    ],
  );

  useEffect(() => {
    _loadPosts(false);
  }, [_loadPosts]);

  useEffect(() => {
    setHasScrolledToUnread(false);
  }, [channelId, lastViewedAt]);

  useEffect(() => {
    if (firstUnreadIndex === null || hasScrolledToUnread) {
      return;
    }

    if (firstUnreadIndex >= 0) {
      try {
        listRef.current?.scrollToIndex({
          index: firstUnreadIndex,
          animated: true,
          viewPosition: 0.5,
        });
      } catch (err) {
        // ignore scroll failures; list will remain at the top
      }
    }

    setHasScrolledToUnread(true);
  }, [firstUnreadIndex, hasScrolledToUnread]);

  useEffect(() => {
    if (!posts.length) {
      setFirstUnreadIndex(null);
      return;
    }

    const lastViewed = lastViewedAt || 0;
    const nextIndex = posts.findIndex(
      (post) => (post.create_at || post.update_at || 0) > lastViewed,
    );

    setFirstUnreadIndex(nextIndex >= 0 ? nextIndex : null);
  }, [lastViewedAt, posts]);

  const latestPostTimestamp = useMemo(
    () =>
      posts.reduce((max, post) => {
        const timestamp = post.create_at || post.update_at || 0;
        return timestamp > max ? timestamp : max;
      }, 0),
    [posts],
  );

  const _markChannelViewed = useCallback(
    async (latestTimestamp: number) => {
      if (!latestTimestamp) {
        return;
      }

      if (lastMarkedViewedAtRef.current && latestTimestamp <= lastMarkedViewedAtRef.current) {
        return;
      }

      try {
        await _ensureBootstrap();
        await markMattermostChannelViewed(channelId);
        lastMarkedViewedAtRef.current = latestTimestamp;
        setLastViewedAt((prev) => {
          const previous = prev || 0;
          return latestTimestamp > previous ? latestTimestamp : prev;
        });
      } catch (err) {
        // ignore view update failures so the thread still renders
      }
    },
    [_ensureBootstrap, channelId],
  );

  useEffect(() => {
    const shouldMarkViewed =
      (firstUnreadIndex === null || hasScrolledToUnread) && latestPostTimestamp > 0;

    if (!shouldMarkViewed) {
      return;
    }

    _markChannelViewed(latestPostTimestamp);
  }, [firstUnreadIndex, hasScrolledToUnread, latestPostTimestamp, _markChannelViewed]);

  const _resetEditing = useCallback(() => {
    setEditingPostId(null);
    setMessage('');
  }, []);

  const _handleStartEdit = useCallback(
    (post: ChatPost) => {
      const body = _formatPostBody(post);
      setMessage(body);
      setEditingPostId(post.id || null);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [_formatPostBody],
  );

  const _handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    const emojifiedMessage = emojifyMessage(trimmedMessage);

    setError(null);
    setIsSending(true);
    try {
      await _ensureBootstrap();
      if (editingPostId) {
        const response = await updateMattermostMessage(channelId, editingPostId, emojifiedMessage);
        const updatedPost = normalizePost(response) || {
          id: editingPostId,
          message: emojifiedMessage,
        };
        setPosts((prev) =>
          _sortPosts(
            prev.map((item) =>
              item.id === editingPostId
                ? { ...item, ...updatedPost, message: emojifiedMessage }
                : item,
            ),
          ),
        );
        setEditingPostId(null);
      } else {
        const response = await sendMattermostMessage(channelId, emojifiedMessage);
        const newPost = normalizePost(response);
        if (newPost) {
          setPosts((prev) => _sortPosts([...prev, newPost]));
          _resolveUserProfiles(_collectMissingUserIds([newPost]));
        }
      }
      setMessage('');
    } catch (err: any) {
      setError(err?.message || 'Unable to send your message.');
    } finally {
      setIsSending(false);
    }
  };

  const _handleRemovePost = useCallback(
    async (post: ChatPost) => {
      if (!post?.id) {
        return;
      }

      try {
        await _ensureBootstrap();
        await deleteMattermostMessage(channelId, post.id);
        setPosts((prev) => prev.filter((item) => item.id !== post.id));
      } catch (err: any) {
        setError(err?.message || 'Unable to remove message.');
      }
    },
    [_ensureBootstrap, channelId],
  );

  const _handleAttachImage = useCallback(async () => {
    if (!currentAccount?.name) {
      return;
    }

    try {
      setIsUploadingImage(true);
      const selection = await ImagePicker.openPicker({ mediaType: 'photo' });
      const media = Array.isArray(selection) ? selection[0] : selection;

      if (!media) {
        setIsUploadingImage(false);
        return;
      }

      const sign = await signImage(media, currentAccount, pinCode);
      const uploadResult: any = await uploadImage(media, currentAccount.name, sign);
      const uploadedUrl = uploadResult?.url || uploadResult?.image || uploadResult?.[0]?.url;

      if (uploadedUrl) {
        setMessage((prev) => (prev ? `${prev.trim()} ${uploadedUrl}` : uploadedUrl));
      } else {
        setError('Unable to attach image.');
      }
    } catch (err: any) {
      if (err?.message?.toLowerCase?.().includes('cancelled')) {
        return;
      }
      setError(err?.message || 'Unable to attach image.');
    } finally {
      setIsUploadingImage(false);
    }
  }, [currentAccount, pinCode]);

  const _renderItem = ({ item, index }: { item: ChatPost; index: number }) => {
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
    const { text: messageText, images: messageImages } = _parseMessageContent(body);
    const isOwnMessage = authorId && bootstrapResult?.user?.id === authorId;
    const showUnreadMarker = firstUnreadIndex !== null && index === firstUnreadIndex;

    const _showActions = () => {
      const actions = [] as any[];

      if (isOwnMessage) {
        actions.push({
          text: intl.formatMessage({ id: 'chats.edit_message', defaultMessage: 'Edit message' }),
          onPress: () => _handleStartEdit(item),
        });
      }

      if (canModerate || isOwnMessage) {
        actions.push({
          text: intl.formatMessage({ id: 'chats.remove', defaultMessage: 'Remove' }),
          style: 'destructive',
          onPress: () => _confirmDelete(),
        });
      }

      actions.push({
        text: intl.formatMessage({ id: 'alert.cancel', defaultMessage: 'Cancel' }),
        style: 'cancel',
      });

      Alert.alert(
        intl.formatMessage({ id: 'chats.message_actions', defaultMessage: 'Message options' }),
        undefined,
        actions,
        { cancelable: true },
      );
    };

    const _confirmDelete = () => {
      Alert.alert(
        intl.formatMessage({ id: 'chats.remove_message', defaultMessage: 'Remove message?' }),
        intl.formatMessage({
          id: 'chats.remove_message_body',
          defaultMessage: 'This will remove the message for everyone in the channel.',
        }),
        [
          {
            text: intl.formatMessage({ id: 'alert.cancel', defaultMessage: 'Cancel' }),
            style: 'cancel',
          },
          {
            text: intl.formatMessage({ id: 'chats.remove', defaultMessage: 'Remove' }),
            style: 'destructive',
            onPress: () => _handleRemovePost(item),
          },
        ],
      );
    };

    if (isSystemAddMessage) {
      const systemContent = _parseMessageContent(body);

      return (
        <View>
          {showUnreadMarker && (
            <View style={styles.unreadMarker}>
              <View style={styles.unreadLine} />
              <Text style={styles.unreadLabel}>
                {intl.formatMessage({ id: 'chats.new_messages', defaultMessage: 'New messages' })}
              </Text>
              <View style={styles.unreadLine} />
            </View>
          )}
          <View style={[styles.message, styles.systemMessage]}>
            {!!timestamp && (
              <Text style={styles.systemTimestamp}>{moment(timestamp).fromNow()}</Text>
            )}
            {!!systemContent.text && <Text style={styles.systemBody}>{systemContent.text}</Text>}
          </View>
        </View>
      );
    }

    return (
      <View>
        {showUnreadMarker && (
          <View style={styles.unreadMarker}>
            <View style={styles.unreadLine} />
            <Text style={styles.unreadLabel}>
              {intl.formatMessage({ id: 'chats.new_messages', defaultMessage: 'New messages' })}
            </Text>
            <View style={styles.unreadLine} />
          </View>
        )}
        <TouchableOpacity
          style={styles.message}
          onLongPress={canModerate ? _confirmDelete : undefined}
          activeOpacity={0.9}
        >
          <View style={styles.messageHeader}>
            <UserAvatar username={author} style={styles.messageAvatar} disableSize />
            <View style={styles.messageMeta}>
              <Text style={styles.author}>{author}</Text>
              {timestamp ? (
                <Text style={styles.timestamp}>{moment(timestamp).fromNow()}</Text>
              ) : null}
            </View>
            {isOwnMessage ? (
              <TouchableOpacity
                onPress={_showActions}
                style={styles.messageActions}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon
                  name="dots-horizontal"
                  iconType="MaterialCommunityIcons"
                  size={20}
                  color={styles.actionsIcon.color}
                />
              </TouchableOpacity>
            ) : null}
          </View>
          {!!messageText && <Text style={styles.body}>{messageText}</Text>}
          {messageImages.map((url) => (
            <Image key={url} source={{ uri: url }} style={styles.chatImage} resizeMode="cover" />
          ))}
        </TouchableOpacity>
      </View>
    );
  };

  const _header = useMemo(
    () => (
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon
              name="chevron-left"
              iconType="MaterialCommunityIcons"
              size={26}
              color={styles.backIcon.color}
            />
          </TouchableOpacity>
          <View style={styles.headerTextGroup}>
            <Text style={styles.title}>{channelName || channelId}</Text>
            {!!channelDescription && <Text style={styles.meta}>{channelDescription}</Text>}
          </View>
        </View>
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

  const listContentStyle = useMemo(
    () => [styles.listContent, { paddingBottom: styles.listContent.paddingBottom + insets.bottom }],
    [insets.bottom],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {_header}

      {isLoading && <ActivityIndicator style={{ marginTop: 16 }} />}

      <FlatList
        ref={listRef}
        data={posts}
        keyExtractor={(item, index) => (item.id || index).toString()}
        renderItem={_renderItem}
        ListEmptyComponent={_emptyList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => _loadPosts(true)} />
        }
        contentContainerStyle={listContentStyle}
        onScrollToIndexFailed={({ index }) =>
          setTimeout(
            () => listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 }),
            400,
          )
        }
      />

      {editingPostId && (
        <View style={styles.editingBanner}>
          <Text style={styles.editingLabel}>
            {intl.formatMessage({ id: 'chats.editing_message', defaultMessage: 'Editing message' })}
          </Text>
          <TouchableOpacity onPress={_resetEditing} style={styles.cancelEditButton}>
            <Icon
              name="close"
              iconType="MaterialCommunityIcons"
              size={18}
              color={styles.cancelEditIcon.color}
            />
            <Text style={styles.cancelEditLabel}>
              {intl.formatMessage({ id: 'alert.cancel', defaultMessage: 'Cancel' })}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 + insets.top : 0}
      >
        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity
            style={[styles.attachButton, isUploadingImage && styles.disabledButton]}
            disabled={isUploadingImage || isSending}
            onPress={_handleAttachImage}
          >
            {isUploadingImage ? (
              <ActivityIndicator color={styles.attachIcon.color} />
            ) : (
              <Icon
                name="image"
                iconType="MaterialCommunityIcons"
                size={24}
                color={styles.attachIcon.color}
              />
            )}
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
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
            style={[
              styles.sendButton,
              (!message.trim() || isSending || isUploadingImage) && { opacity: 0.5 },
            ]}
            onPress={_handleSend}
            disabled={!message.trim() || isSending || isUploadingImage}
          >
            {isSending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.sendLabel}>
                {intl.formatMessage({
                  id: editingPostId ? 'chats.update' : 'chats.send',
                  defaultMessage: editingPostId ? 'Update' : 'Send',
                })}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatThreadScreen;
