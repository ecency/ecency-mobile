import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Hyperlink from 'react-native-hyperlink';
import LinkifyIt from 'linkify-it';
import { useIntl } from 'react-intl';
import moment from 'moment';
import ImagePicker from 'react-native-image-crop-picker';

import EStyleSheet from 'react-native-extended-stylesheet';
import { useDispatch } from 'react-redux';
import { SheetManager } from 'react-native-actions-sheet';
import { useAppSelector, useLinkProcessor } from '../../../hooks';
import { toastNotification } from '../../../redux/actions/uiAction';
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
  fetchMattermostPost,
  addMattermostReaction,
  removeMattermostReaction,
} from '../../../providers/chat/mattermost';
import { uploadImage } from '../../../providers/ecency/ecency';
import { signImage } from '../../../providers/hive/dhive';
import { Icon, UserAvatar, IconButton, BasicHeader } from '../../../components';
import { chatThreadStyles as styles } from '../styles';
import { emojifyMessage } from '../../../utils/emoji';
import { SheetNames } from '../../../navigation/sheets';
import { extractImageUrls } from '../../../utils/editor';

interface ChatThreadParams {
  channelId: string;
  channelName?: string;
  channelDescription?: string;
  bootstrapResult?: any;
  userLookup?: Record<string, any>;
  lastViewedAt?: number;
}

interface ChatReaction {
  emoji_name: string;
  user_id: string;
  create_at?: number;
}

interface ChatPost {
  id?: string;
  message?: string;
  user_id?: string;
  user?: { username?: string; nickname?: string; name?: string };
  create_at?: number;
  update_at?: number;
  props?: { message?: string; reactions?: ChatReaction[] };
  type?: string;
  text?: string;
  root_id?: string;
  metadata?: { reactions?: ChatReaction[] };
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
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { handleLink } = useLinkProcessor();

  const { channelId, channelName, bootstrapResult: initialBootstrap } = route.params;

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
  const [headerUser, setHeaderUser] = useState<any>(null);
  const [rootMessages, setRootMessages] = useState<Record<string, ChatPost>>({});
  const [rootPost, setRootPost] = useState<ChatPost | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const unreadScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userLookupRef = useRef<Record<string, any>>({});
  const listRef = useRef<FlatList<ChatPost>>(null);
  const inputRef = useRef<TextInput>(null);
  const lastMarkedViewedAtRef = useRef<number | null>(null);

  const [userLookup, setUserLookup] = useState<Record<string, any>>(() => {
    const normalized = normalizeUserLookup(route.params?.userLookup);
    userLookupRef.current = normalized;
    return normalized;
  });

  const linkifyInstance = useMemo(() => {
    const linkify = new LinkifyIt();
    linkify.set({ fuzzyLink: false });
    return linkify;
  }, []);

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
    if (bootstrapUser?.userId) {
      _mergeUserLookup((prev) => ({
        ...prev,
        [bootstrapUser.userId]: {
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

        const bootstrapUserId = bootstrapResult?.userId;
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
          const usersWithHiveNames = ensureMattermostUsersHaveHiveNames(users);
          _mergeUserLookup((prev) => ({ ...prev, ...usersWithHiveNames }));

          // Determine the other user for header (for DM channels)
          if (bootstrapUserId && memberIds.length === 2) {
            // Likely a DM with 2 members
            const otherUserId = memberIds.find((id: string) => id !== bootstrapUserId);
            if (otherUserId && usersWithHiveNames[otherUserId]) {
              const otherUser = usersWithHiveNames[otherUserId];
              const hiveUsername =
                otherUser.hiveUsername || getHiveUsernameFromMattermostUser(otherUser);
              setHeaderUser({
                name: hiveUsername || otherUser.username,
                display_name: otherUser.nickname || otherUser.name || otherUser.username,
              });
            }
          } else if (memberIds.length > 2 || !bootstrapUserId) {
            // Channel (not DM) - use channel name for header
            if (channelName) {
              setHeaderUser({
                name: channelName.toLowerCase().replace(/\s+/g, ''),
                display_name: channelName,
              });
            }
          }
        } else if (channelName) {
          // No members found, but we have channel name - use it for header
          setHeaderUser({
            name: channelName.toLowerCase().replace(/\s+/g, ''),
            display_name: channelName,
          });
        }
      } catch (err) {
        // ignore member lookup failures so messages still load
        // But still try to set channel name if available
        if (channelName && !headerUser) {
          setHeaderUser({
            name: channelName.toLowerCase().replace(/\s+/g, ''),
            display_name: channelName,
          });
        }
      }
    };

    loadChannelMembers();
  }, [
    channelId,
    _ensureBootstrap,
    _mergeUserLookup,
    bootstrapResult,
    lastViewedAt,
    channelName,
    headerUser,
  ]);

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

  const _getAddedUserInfo = useCallback(
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

      const normalizedUsername = addedUsername
        ? addedUsername.startsWith('@')
          ? addedUsername
          : `@${addedUsername}`
        : null;

      return {
        addedUserId,
        addedUsername,
        normalizedUsername,
      };
    },
    [userLookup],
  );

  const _formatJoinedMessage = useCallback(
    (post: ChatPost, timestamp?: number) => {
      const { normalizedUsername } = _getAddedUserInfo(post);

      if (normalizedUsername) {
        if (timestamp) {
          // Use moment's humanize() to get full format like "2 days ago"
          const duration = moment.duration(moment().diff(moment(timestamp)));
          const timeAgo = duration.humanize();
          return `${normalizedUsername} joined ${timeAgo} ago`;
        }
        return `${normalizedUsername} joined`;
      }

      return post.message || post.props?.message || post.text || '';
    },
    [_getAddedUserInfo],
  );

  const _formatPostBody = useCallback(
    (post: ChatPost, timestamp?: number) => {
      if (post?.type === 'system_add_to_channel' || post?.type === 'system_add_to_team') {
        return _formatJoinedMessage(post, timestamp);
      }

      return post.message || post.props?.message || post.text || '';
    },
    [_formatJoinedMessage],
  );

  const _parseMessageContent = useCallback((rawMessage: string, parseMentionUrl = true) => {
    const imageLinks = extractImageUrls({ body: rawMessage });

    // Only remove links that were found in imageLinks from rawMessage (not all links)

    let textNoImages = rawMessage;
    if (imageLinks && Array.isArray(imageLinks) && imageLinks.length > 0) {
      imageLinks.forEach((imgUrl) => {
        // Remove any ![](<url>) occurrence
        textNoImages = textNoImages.replace(new RegExp(`!\\[.*?\\]\\(${imgUrl}\\)`, 'g'), '');
        // Remove any [alt](<url>) link for image
        textNoImages = textNoImages.replace(new RegExp(`\\[.*?\\]\\(${imgUrl}\\)`, 'g'), '');
        // Remove raw link
        textNoImages = textNoImages.replace(new RegExp(imgUrl, 'g'), '');
      });
    }

    if (parseMentionUrl) {
      // Check if text already contains /@[username] patterns (existing profile URLs)
      const hasExistingProfileLinks = /\/@([a-zA-Z0-9\-.]+)/.test(textNoImages);

      // Only replace @[username] with https://ecency.com/@[username] if there are no existing profile links
      if (!hasExistingProfileLinks) {
        textNoImages = textNoImages
          .split(' ')
          .map((word) => {
            // If word starts with http:// or https://, leave it unchanged
            if (word.match(/^https?:\/\//)) {
              return word;
            }
            // Otherwise, replace @mentions with ecency.com URLs
            return word.replace(/^@([a-zA-Z0-9\-.]+)/, 'https://ecency.com/@$1');
          })
          .join(' ');
      }
    }

    const cleanedText = textNoImages.trim();
    const emojifiedText = emojifyMessage(cleanedText);

    return {
      text: emojifiedText,
      images: imageLinks,
    };
  }, []);

  const _showUserProfile = useCallback((username?: string | null) => {
    const cleanedUsername = (username || '').replace(/^@/, '');
    if (!cleanedUsername) {
      return;
    }

    SheetManager.show(SheetNames.QUICK_PROFILE, {
      payload: {
        username: cleanedUsername,
      },
    });
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

  const _fetchRootMessages = useCallback(
    async (rootIds: string[]) => {
      if (!rootIds.length) {
        return;
      }

      try {
        await _ensureBootstrap();
        const fetchPromises = rootIds.map((rootId) =>
          fetchMattermostPost(channelId, rootId).catch(() => null),
        );
        const results = await Promise.all(fetchPromises);

        const rootMessagesMap: Record<string, ChatPost> = {};
        results.forEach((post) => {
          if (post) {
            const normalized = normalizePost(post);
            if (normalized?.id) {
              rootMessagesMap[normalized.id] = normalized;
            }
          }
        });

        if (Object.keys(rootMessagesMap).length > 0) {
          setRootMessages((prev) => ({ ...prev, ...rootMessagesMap }));
          // Resolve user profiles for root messages
          const rootUserIds = Object.values(rootMessagesMap)
            .map((post) => post.user_id || post.user?.id)
            .filter(Boolean);
          if (rootUserIds.length > 0) {
            _resolveUserProfiles(rootUserIds);
          }
        }
      } catch (err) {
        // silently ignore root message fetch errors
      }
    },
    [channelId, _ensureBootstrap, _resolveUserProfiles],
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
                  member?.user_id === bootstrapResult?.userId ||
                  member?.id === bootstrapResult?.userId,
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

        // Collect root_ids and fetch root messages
        const rootIds = new Set<string>();
        normalizedPosts.forEach((post: ChatPost) => {
          if (post.root_id && !normalizedPosts.find((p: ChatPost) => p.id === post.root_id)) {
            rootIds.add(post.root_id);
          }
        });

        if (rootIds.size > 0) {
          _fetchRootMessages(Array.from(rootIds));
        }
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

  const _clearUnreadScrollTimeout = useCallback(() => {
    if (unreadScrollTimeoutRef.current) {
      clearTimeout(unreadScrollTimeoutRef.current);
      unreadScrollTimeoutRef.current = null;
    }
  }, []);

  const _scrollToUnread = useCallback(() => {
    if (firstUnreadIndex === null || hasScrolledToUnread || !posts.length) {
      return;
    }

    const targetIndex = Math.min(Math.max(firstUnreadIndex, 0), posts.length - 1);

    try {
      listRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
        viewPosition: 0.5,
      });
      setHasScrolledToUnread(true);
      _clearUnreadScrollTimeout();
    } catch (err) {
      _clearUnreadScrollTimeout();
      unreadScrollTimeoutRef.current = setTimeout(() => {
        _scrollToUnread();
      }, 250);
    }
  }, [_clearUnreadScrollTimeout, firstUnreadIndex, hasScrolledToUnread, posts.length]);

  useEffect(() => {
    _scrollToUnread();

    return () => {
      _clearUnreadScrollTimeout();
    };
  }, [_scrollToUnread, _clearUnreadScrollTimeout]);

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

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(
        e.endCoordinates.height + Platform.select({ android: insets.bottom, default: 0 }),
      );

      // Scroll to bottom when keyboard appears
      if (posts.length > 0 && listRef.current) {
        setTimeout(() => {
          try {
            listRef.current?.scrollToIndex({
              index: posts.length - 1,
              animated: true,
              viewPosition: 0,
            });
          } catch (err) {
            // Fallback to scrollToEnd if scrollToIndex fails
            listRef.current?.scrollToEnd({ animated: true });
          }
        }, 100);
      }
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', (_) => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [insets.bottom, posts.length]);

  const _resetEditing = useCallback(() => {
    setEditingPostId(null);
    setMessage('');
    setRootPost(null);
  }, []);

  const _cancelReply = useCallback(() => {
    setRootPost(null);
  }, []);

  const _handleStartEdit = useCallback(
    (post: ChatPost) => {
      setRootPost(null);
      const timestamp = post.create_at || post.update_at;
      const body = _formatPostBody(post, timestamp);
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
        const rootId = rootPost?.id || '';
        const response = await sendMattermostMessage(channelId, emojifiedMessage, rootId);
        const newPost = normalizePost(response);
        if (newPost) {
          setPosts((prev) => _sortPosts([...prev, newPost]));
          _resolveUserProfiles(_collectMissingUserIds([newPost]));
        }
      }
      setMessage('');
      setRootPost(null);
    } catch (err: any) {
      // Check if this is a ban error
      if (err?.isBanError) {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'chats.banned_from_chat',
              defaultMessage: 'Unusual activity detected. Please try again after some time.',
            }),
          ),
        );
      } else {
        setError(err?.message || 'Unable to send your message.');
      }
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

  const _renderReplyPreview = useCallback(
    (rootId: string, isOwnMessage: boolean, showCloseButton?: boolean, onClose?: () => void) => {
      const rootMessage = rootMessages[rootId] || posts.find((p: ChatPost) => p.id === rootId);
      if (!rootMessage) {
        return null;
      }

      const rootAuthorId = rootMessage.user_id || rootMessage.user?.id;
      const rootMappedUser = (rootAuthorId && userLookup[rootAuthorId]) || rootMessage.user;
      const rootHiveUsername =
        rootMappedUser?.hiveUsername || getHiveUsernameFromMattermostUser(rootMappedUser);
      const rootAuthor =
        rootHiveUsername ||
        rootMappedUser?.nickname ||
        rootMappedUser?.username ||
        rootMappedUser?.name ||
        rootAuthorId ||
        intl.formatMessage({ id: 'chats.anonymous', defaultMessage: 'Unknown user' });
      const rootBody = rootMessage.message || rootMessage.props?.message || rootMessage.text || '';
      const rootText = rootBody.length > 100 ? `${rootBody.substring(0, 100)}...` : rootBody;

      return (
        <View
          style={[
            styles.replyPreview,
            isOwnMessage ? styles.replyPreviewOwn : styles.replyPreviewOther,
            showCloseButton && styles.replyPreviewWithClose,
          ]}
        >
          <View style={styles.replyPreviewLine} />
          <View style={styles.replyPreviewContent}>
            <Text
              style={[
                styles.replyPreviewAuthor,
                isOwnMessage ? styles.replyPreviewAuthorOwn : styles.replyPreviewAuthorOther,
              ]}
            >
              {rootAuthor}
            </Text>
            <Text
              style={[
                styles.replyPreviewText,
                isOwnMessage ? styles.replyPreviewTextOwn : styles.replyPreviewTextOther,
              ]}
              numberOfLines={2}
            >
              {rootText}
            </Text>
          </View>
          {showCloseButton && onClose && (
            <TouchableOpacity onPress={onClose} style={styles.cancelReplyButton}>
              <Icon
                name="close"
                iconType="MaterialCommunityIcons"
                size={18}
                color={EStyleSheet.value('$primaryDarkText')}
              />
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [rootMessages, posts, userLookup, intl],
  );

  const _renderComposerReplyPreview = useCallback(() => {
    if (!rootPost?.id) {
      return null;
    }

    return (
      <View style={styles.composerReplyPreview}>
        {_renderReplyPreview(rootPost.id, false, true, _cancelReply)}
      </View>
    );
  }, [rootPost, bootstrapResult, _renderReplyPreview, _cancelReply]);

  const _renderEditingBanner = useCallback(() => {
    if (!editingPostId) {
      return null;
    }

    return (
      <View style={styles.composerEditingBanner}>
        <Text style={styles.editingLabel}>
          {intl.formatMessage({ id: 'chats.editing_message', defaultMessage: 'Editing message' })}
        </Text>
        <TouchableOpacity onPress={_resetEditing} style={styles.cancelEditButton}>
          <Icon
            name="close"
            iconType="MaterialCommunityIcons"
            size={18}
            color={EStyleSheet.value('$primaryDarkText')}
          />
        </TouchableOpacity>
      </View>
    );
  }, [editingPostId, intl]);

  const _getEmojiDisplay = useCallback((emojiName: string) => {
    // Map emoji names to actual emoji characters
    const emojiMap: Record<string, string> = {
      '+1': '👍',
      '-1': '👎',
      smile: '😄',
      heart: '❤️',
      tada: '🎉',
      rocket: '🚀',
      eyes: '👀',
    };
    return emojiMap[emojiName] || emojiName;
  }, []);

  const _renderReactions = useCallback(
    (reactions: ChatReaction[] | undefined, isOwnMessage: boolean) => {
      if (!reactions || reactions.length === 0) {
        return null;
      }

      // Group reactions by emoji_name
      const groupedReactions: Record<string, ChatReaction[]> = {};
      reactions.forEach((reaction) => {
        if (!groupedReactions[reaction.emoji_name]) {
          groupedReactions[reaction.emoji_name] = [];
        }
        groupedReactions[reaction.emoji_name].push(reaction);
      });

      return (
        <View
          style={[
            styles.reactionsContainer,
            isOwnMessage ? styles.reactionsContainerOwn : styles.reactionsContainerOther,
          ]}
        >
          {Object.entries(groupedReactions).map(([emojiName, reactionList]) => {
            const emojiDisplay = _getEmojiDisplay(emojiName);
            const count = reactionList.length;
            const hasCurrentUserReaction = reactionList.some(
              (r) => r.user_id === bootstrapResult?.userId,
            );

            return (
              <View
                key={emojiName}
                style={[styles.reactionPill, hasCurrentUserReaction && styles.reactionPillActive]}
              >
                <Text style={styles.reactionEmoji}>{emojiDisplay}</Text>
                {count > 1 && (
                  <Text
                    style={[
                      styles.reactionCount,
                      hasCurrentUserReaction && styles.reactionCountActive,
                    ]}
                  >
                    {count}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      );
    },
    [_getEmojiDisplay, bootstrapResult],
  );

  const _renderItem = ({ item, index }: { item: ChatPost; index: number }) => {
    const isSystemAddMessage =
      item?.type === 'system_add_to_channel' ||
      item?.type === 'system_add_to_team' ||
      item?.type === 'system_join_team';
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
    const body = _formatPostBody(item, timestamp);
    const { text: messageText, images: messageImages } = _parseMessageContent(body);
    const isOwnMessage = authorId && bootstrapResult?.userId === authorId;
    const showUnreadMarker = firstUnreadIndex !== null && index === firstUnreadIndex;

    const _showActions = () => {
      _showChatOptionsSheet(item, isOwnMessage);
    };

    const _showChatOptionsSheet = (post: ChatPost, isOwn: boolean) => {
      SheetManager.show(SheetNames.CHAT_OPTIONS, {
        payload: {
          post,
          channelId,
          currentUserId: bootstrapResult?.userId,
          isOwnMessage: isOwn,
          canModerate,
          onReply: () => {
            _handleReplyToPost(post);
          },
          onReaction: (emojiName: string) => {
            _handleAddReaction(post, emojiName);
          },
          onEdit: isOwn
            ? () => {
                _handleStartEdit(post);
              }
            : undefined,
          onRemove:
            isOwn || canModerate
              ? () => {
                  _confirmDelete(item);
                }
              : undefined,
        },
      });
    };

    const _handleReplyToPost = (post: ChatPost) => {
      setEditingPostId(null);
      setMessage('');
      setRootPost(post);
      setTimeout(() => inputRef.current?.focus(), 100);
    };

    const _handleAddReaction = async (post: ChatPost, emojiName: string) => {
      const currentUserId = bootstrapResult?.userId;
      if (!post?.id || !currentUserId) {
        return;
      }

      try {
        await _ensureBootstrap();

        const currentReactions = post.metadata?.reactions || post.props?.reactions || [];
        const hasUserReaction = currentReactions.some(
          (r: ChatReaction) => r.emoji_name === emojiName && r.user_id === currentUserId,
        );

        if (hasUserReaction) {
          // Remove reaction
          await removeMattermostReaction(channelId, post.id, emojiName);
        } else {
          // Add reaction
          await addMattermostReaction(channelId, post.id, emojiName);
        }

        // Response format: { post_id, emoji_name, user_id, channel_id }
        // Manually update the reactions array
        setPosts((prev) =>
          prev.map((item) => {
            if (item.id !== post.id) {
              return item;
            }

            const existingReactions = item.metadata?.reactions || item.props?.reactions || [];
            let updatedReactions: ChatReaction[];

            if (hasUserReaction) {
              // Remove reaction: filter out the reaction matching emoji_name and user_id
              updatedReactions = existingReactions.filter(
                (r: ChatReaction) => !(r.emoji_name === emojiName && r.user_id === currentUserId),
              );
            } else {
              // Add reaction: add new reaction object
              updatedReactions = [
                ...existingReactions,
                {
                  emoji_name: emojiName,
                  user_id: currentUserId,
                  create_at: Date.now(),
                },
              ];
            }

            return {
              ...item,
              metadata: {
                ...item.metadata,
                reactions: updatedReactions,
              },
              props: {
                ...item.props,
                reactions: updatedReactions,
              },
            };
          }),
        );
      } catch (error: any) {
        console.error('Failed to toggle reaction:', error);
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'chats.reaction_error',
              defaultMessage: 'Failed to update reaction',
            }),
          ),
        );
      } finally {
        SheetManager.hide(SheetNames.CHAT_OPTIONS);
      }
    };

    const _confirmDelete = (postToDelete: ChatPost) => {
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
            onPress: () => _handleRemovePost(postToDelete),
          },
        ],
      );
    };

    const _setLinkText = (url: string) => {
      // Check for exact format: "https://ecency.com/@username" or "https://ecency.com/@username/"
      // Do NOT match if there are additional path components after the username
      const ecencyUserPattern = /^https:\/\/ecency\.com\/@([a-zA-Z0-9\-.]+)\/?$/;
      const match = url.match(ecencyUserPattern);
      if (match) {
        const username = match[1];
        return `@${username}`;
      }
      return url;
    };

    if (isSystemAddMessage) {
      const formattedBody = _formatPostBody(item, timestamp);
      const systemContent = _parseMessageContent(formattedBody, false);
      const addedUserInfo = _getAddedUserInfo(item);
      const durationSinceJoin = timestamp
        ? moment.duration(moment().diff(moment(timestamp))).humanize()
        : null;
      const joinedSuffix = durationSinceJoin ? `joined ${durationSinceJoin} ago` : 'joined';
      const joinedContent = addedUserInfo.normalizedUsername ? (
        <Text style={styles.systemBody}>
          <Text
            style={[styles.systemBody, styles.systemUsername]}
            onPress={() => _showUserProfile(addedUserInfo.normalizedUsername)}
          >
            {addedUserInfo.normalizedUsername}
          </Text>{' '}
          {joinedSuffix}
        </Text>
      ) : (
        !!systemContent.text && <Text style={styles.systemBody}>{systemContent.text}</Text>
      );

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
          <View style={styles.systemMessageContainer}>
            <View style={styles.systemMessagePill}>{joinedContent}</View>
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
        <View
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.messageContainerOwn : styles.messageContainerOther,
          ]}
        >
          {!isOwnMessage && (
            <UserAvatar username={author} style={styles.messageAvatar} disableSize />
          )}
          <TouchableOpacity
            style={[
              styles.messageBubble,
              isOwnMessage ? styles.messageBubbleOwn : styles.messageBubbleOther,
            ]}
            onLongPress={_showActions}
            activeOpacity={0.9}
          >
            {item.root_id && _renderReplyPreview(item.root_id, isOwnMessage)}
            {!isOwnMessage && <Text style={styles.author}>{author}</Text>}
            {!!messageText && (
              <Hyperlink
                linkStyle={[
                  styles.hyperlink,
                  isOwnMessage ? styles.hyperlinkOwn : styles.hyperlinkOther,
                ]}
                linkText={(url: string) => _setLinkText(url)}
                onPress={(url: string) => handleLink(url)}
                linkify={linkifyInstance}
              >
                <Text style={[styles.body, isOwnMessage ? styles.bodyOwn : styles.bodyOther]}>
                  {messageText}
                </Text>
              </Hyperlink>
            )}
            {messageImages.map((url) => (
              <Image
                key={url}
                source={{ uri: url }}
                style={[
                  styles.chatImage,
                  isOwnMessage ? styles.chatImageOwn : styles.chatImageOther,
                ]}
                resizeMode="cover"
              />
            ))}
            <View style={styles.timestampContainer}>
              {timestamp && (
                <Text
                  style={[
                    styles.timestamp,
                    isOwnMessage ? styles.timestampOwn : styles.timestampOther,
                  ]}
                >
                  {moment(timestamp).fromNow()}
                </Text>
              )}
              {isOwnMessage && (
                <TouchableOpacity
                  onPress={_showActions}
                  style={styles.messageActions}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon
                    name="dots-horizontal"
                    iconType="MaterialCommunityIcons"
                    size={16}
                    color={styles.actionsIcon.color}
                  />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </View>
        {_renderReactions(item.metadata?.reactions || item.props?.reactions, isOwnMessage)}
      </View>
    );
  };

  const headerTitle = useMemo(() => {
    if (headerUser) {
      return headerUser.display_name || headerUser.name || channelName || channelId;
    }
    return channelName || channelId;
  }, [headerUser, channelName, channelId]);

  // const headerUsername = useMemo(() => {
  //   if (headerUser?.name) {
  //     return headerUser.name.startsWith('@') ? headerUser.name : `@${headerUser.name}`;
  //   }
  //   return null;
  // }, [headerUser]);

  // const _header = useMemo(
  //   () => (
  //     <View style={styles.headerContainer}>
  //       <View style={styles.basicHeaderContainer}>
  //         <View style={styles.basicHeaderBackWrapper}>
  //           <IconButton
  //             iconStyle={styles.basicHeaderBackIcon}
  //             iconType="MaterialIcons"
  //             name="arrow-back"
  //             onPress={() => navigation.goBack()}
  //           />
  //           {headerUsername && headerUser ? (
  //             <View style={styles.headerTitleContainer}>
  //               <UserAvatar
  //                 username={headerUser.name}
  //                 style={styles.headerAvatar}
  //                 disableSize
  //               />
  //               <View style={styles.headerTitleTextContainer}>
  //                 <Text style={styles.headerTitle} numberOfLines={1}>
  //                   {headerTitle}
  //                 </Text>
  //                 <Text style={styles.headerSubtitle} numberOfLines={1}>
  //                   {headerUsername}
  //                 </Text>
  //               </View>
  //             </View>
  //           ) : (
  //             <Text style={styles.basicHeaderTitle} numberOfLines={1}>
  //               {headerTitle}
  //             </Text>
  //           )}
  //         </View>
  //       </View>
  //     </View>
  //   ),
  //   [headerUser, headerTitle, headerUsername, navigation],
  // );

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

  const _renderComposer = useCallback(() => {
    const composerStyle = {
      ...styles.composer,
      marginBottom: Platform.OS === 'android' && Platform.Version < 35 ? 12 : keyboardHeight + 12,
      paddingBottom: !isKeyboardVisible ? insets.bottom : 0,
    };

    return (
      <View style={composerStyle}>
        <View style={styles.inputContainer}>
          <IconButton
            style={[styles.attachButton, isUploadingImage && styles.disabledButton]}
            iconType="MaterialCommunityIcons"
            name="plus"
            color={EStyleSheet.value('$primaryDarkText')}
            size={24}
            onPress={_handleAttachImage}
            disabled={isUploadingImage || isSending}
            isLoading={isUploadingImage}
          />

          <View style={styles.inputWrapper}>
            {_renderEditingBanner()}
            {_renderComposerReplyPreview()}
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
          </View>
        </View>

        <IconButton
          style={[
            styles.sendButton,
            (!message.trim() || isSending || isUploadingImage) && styles.sendButtonDisabled,
          ]}
          iconType="MaterialCommunityIcons"
          name="send"
          color={EStyleSheet.value('$pureWhite')}
          size={20}
          onPress={_handleSend}
          disabled={!message.trim() || isSending || isUploadingImage}
          isLoading={isSending}
        />
      </View>
    );
  }, [
    isUploadingImage,
    isSending,
    message,
    keyboardHeight,
    isKeyboardVisible,
    insets.bottom,
    _handleAttachImage,
    _renderEditingBanner,
    _renderComposerReplyPreview,
    _handleSend,
    intl,
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BasicHeader title={headerTitle} />

      <View style={{ flex: 1 }}>
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
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={_scrollToUnread}
          onScrollToIndexFailed={({ index }) =>
            setTimeout(
              () => listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 }),
              400,
            )
          }
        />

        {_renderComposer()}
      </View>
    </SafeAreaView>
  );
};

export default ChatThreadScreen;
