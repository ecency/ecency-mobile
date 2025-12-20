import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, Platform, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinkifyIt from 'linkify-it';
import { useIntl } from 'react-intl';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { SheetManager } from 'react-native-actions-sheet';
import unionBy from 'lodash/unionBy';

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
  updateMattermostMessage,
  markMattermostChannelViewed,
  fetchMattermostPost,
  addMattermostReaction,
  removeMattermostReaction,
  joinMattermostChannel,
} from '../../../providers/chat/mattermost';
import { uploadImage } from '../../../providers/ecency/ecency';
import { signImage, getCommunity } from '../../../providers/hive/dhive';
import { BasicHeader } from '../../../components';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';
import { emojifyMessage } from '../../../utils/emoji';
import { SheetNames } from '../../../navigation/sheets';

// Import utils
import {
  formatPostBody,
  parseMessageContent,
  getAddedUserInfo,
  ChatPost,
} from '../utils/messageFormatters';
import {
  normalizePosts,
  normalizePost,
  normalizeUserLookup,
  normalizeUsersFromMap,
  sortPosts,
} from '../utils/postNormalizers';
import {
  getMentionUsername,
  collectMissingUserIds,
  safeExtractCommunityIdentifier,
} from '../utils/userLookupHelpers';

// Import child components
import { ThreadMessageList } from '../children/ThreadMessageList';
import { ThreadComposer } from '../children/ThreadComposer';
import { ReplyPreview } from '../children/ReplyPreview';
import { EditingBanner } from '../children/EditingBanner';
import { MentionSuggestions } from '../children/MentionSuggestions';
import { ThreadMessageItem } from '../children/ThreadMessageItem';
import { GroupedSystemMessages } from '../children/GroupedSystemMessages';
import { SystemMessageItem } from '../children/SystemMessageItem';
import { MessageReactions } from '../children/MessageReactions';

interface ChatReaction {
  emoji_name: string;
  user_id: string;
  create_at?: number;
}

interface ChatParentPreview {
  parent_id?: string;
  parent_message?: string;
  parent_username?: string;
}

interface GroupedSystemMessage {
  type: 'grouped_system_add';
  id: string;
  posts: ChatPost[];
  create_at: number;
}

export interface ChatThreadContainerProps {
  channelId: string;
  channelName?: string;
  channelDescription?: string;
  initialBootstrap?: any;
  initialUserLookup?: Record<string, any>;
  initialLastViewedAt?: number;
  communityIdentifier?: string;
}

export const ChatThreadContainer: React.FC<ChatThreadContainerProps> = ({
  channelId,
  channelName,
  channelDescription,
  initialBootstrap,
  initialUserLookup,
  initialLastViewedAt,
  communityIdentifier: paramCommunityIdentifier,
}) => {
  const intl = useIntl();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { handleLink } = useLinkProcessor();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);

  // State management
  const [bootstrapResult, setBootstrapResult] = useState<any>(initialBootstrap);
  const [posts, setPosts] = useState<ChatPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasBootstrapped, setHasBootstrapped] = useState<boolean>(!!initialBootstrap);
  const [canModerate, setCanModerate] = useState<boolean>(false);
  const [lastViewedAt, setLastViewedAt] = useState<number | null>(initialLastViewedAt ?? null);
  const [unreadAnchor, setUnreadAnchor] = useState<number | null>(initialLastViewedAt ?? null);
  const [firstUnreadIndex, setFirstUnreadIndex] = useState<number | null>(null);
  const [hasScrolledToUnread, setHasScrolledToUnread] = useState<boolean>(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [headerUser, setHeaderUser] = useState<any>(null);
  const [rootMessages, setRootMessages] = useState<Record<string, ChatPost>>({});
  const [rootPost, setRootPost] = useState<ChatPost | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [lastPostId, setLastPostId] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);

  // Refs
  const unreadScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userLookupRef = useRef<Record<string, any>>({});
  const listRef = useRef<FlatList<ChatPost>>(null);
  const inputRef = useRef<TextInput>(null);
  const lastMarkedViewedAtRef = useRef<number | null>(null);

  // User lookup state
  const [userLookup, setUserLookup] = useState<Record<string, any>>(() => {
    const normalized = normalizeUserLookup(initialUserLookup);
    userLookupRef.current = normalized;
    return normalized;
  });

  const mentionableUsers = useMemo(() => normalizeUsersFromMap(userLookup), [userLookup]);

  const linkifyInstance = useMemo(() => {
    const linkify = new LinkifyIt();
    linkify.set({ fuzzyLink: false });
    return linkify;
  }, []);

  // Bootstrap user ID extraction
  const bootstrapUserId =
    bootstrapResult?.user?.id || bootstrapResult?.user?.userId || bootstrapResult?.userId;

  // Callbacks
  const _updateMentionState = useCallback((text: string) => {
    const match = text.match(/(^|[\s\n])@([a-zA-Z0-9_.-]*)$/);
    if (match) {
      const startIndex = (match.index || 0) + match[1].length;
      setMentionStartIndex(startIndex);
      setMentionQuery(match[2]);
    } else {
      setMentionStartIndex(null);
      setMentionQuery(null);
    }
  }, []);

  const _handleMessageChange = useCallback(
    (text: string) => {
      setMessage(text);
      _updateMentionState(text);
    },
    [_updateMentionState],
  );

  const mentionSuggestions = useMemo(() => {
    if (mentionQuery === null) {
      return [];
    }

    const query = mentionQuery.toLowerCase();
    const filtered = mentionableUsers.filter((user) => {
      const username = getMentionUsername(user);
      if (!username) {
        return false;
      }

      return query ? username.toLowerCase().includes(query) : true;
    });

    return filtered
      .sort((a, b) => getMentionUsername(a).localeCompare(getMentionUsername(b)))
      .slice(0, 8);
  }, [mentionQuery, mentionableUsers]);

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

  const derivedCommunityIdentifier = useMemo(
    () =>
      paramCommunityIdentifier ||
      safeExtractCommunityIdentifier({
        name: channelName,
        display_name: channelName,
        header: channelDescription,
      }),
    [channelDescription, channelName, paramCommunityIdentifier],
  );

  const _ensureBootstrap = useCallback(async () => {
    if (hasBootstrapped) {
      return;
    }

    const session = await bootstrapMattermostSession(currentAccount, pinCode);
    setBootstrapResult(session);
    setHasBootstrapped(true);
  }, [currentAccount, hasBootstrapped, pinCode]);

  // Bootstrap effect - add current user to lookup
  useEffect(() => {
    const bootstrapUser = bootstrapResult?.user;
    const userId = bootstrapUser?.id || bootstrapUser?.userId;

    if (userId) {
      _mergeUserLookup((prev) => ({
        ...prev,
        [userId]: {
          ...bootstrapUser,
          hiveUsername: getHiveUsernameFromMattermostUser(bootstrapUser),
        },
      }));
    }
  }, [bootstrapResult, _mergeUserLookup]);

  // Load channel members effect
  useEffect(() => {
    const loadChannelMembers = async () => {
      try {
        await _ensureBootstrap();
        const members = await fetchMattermostChannelMembers(channelId);
        const memberIds = (members || [])
          .map((member: any) => member?.user_id || member?.id)
          .filter(Boolean);

        if (!lastViewedAt && bootstrapUserId) {
          const selfMember = members?.find(
            (member: any) => member?.user_id === bootstrapUserId || member?.id === bootstrapUserId,
          );

          if (selfMember?.last_viewed_at) {
            setLastViewedAt(selfMember.last_viewed_at);
            setUnreadAnchor((prev) => (prev === null ? selfMember.last_viewed_at : prev));
          }
        }

        if (memberIds.length) {
          const users = await fetchMattermostUsersByIds(memberIds);
          const usersWithHiveNames = ensureMattermostUsersHaveHiveNames(users);
          _mergeUserLookup((prev) => ({ ...prev, ...usersWithHiveNames }));

          // Determine the other user for header (for DM channels)
          if (bootstrapUserId && memberIds.length === 2) {
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

  // Resolve moderation status effect
  useEffect(() => {
    const resolveModeration = async () => {
      if (!derivedCommunityIdentifier || !currentAccount?.name) {
        setCanModerate(false);
        return;
      }

      try {
        const community = await getCommunity(derivedCommunityIdentifier, currentAccount.name);
        const team = community?.team || [];
        const isModerator = team.some(
          (member: any) =>
            member?.account === currentAccount.name &&
            ['mod', 'admin', 'owner'].includes(member?.role as string),
        );
        setCanModerate(isModerator);
      } catch (err) {
        setCanModerate(false);
      }
    };

    resolveModeration();
  }, [currentAccount?.name, derivedCommunityIdentifier]);

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
      if (isRefreshing || isLoading) {
        return;
      }

      if (!refresh && !hasMorePosts) {
        return;
      }

      setIsLoading(!refresh);
      setIsRefreshing(refresh);
      setError(null);

      try {
        await _ensureBootstrap();
        let data;
        const _beforeId = refresh ? null : lastPostId;

        try {
          data = await fetchMattermostChannelPosts(channelId, _beforeId || undefined);
        } catch (err: any) {
          if (axios.isAxiosError(err) && [401, 403, 404].includes(err.response?.status || 0)) {
            const joined = await joinMattermostChannel(channelId);
            const resolvedId = joined?.id || joined?.channel_id || joined?.name || channelId;
            data = await fetchMattermostChannelPosts(resolvedId, _beforeId || undefined);
          } else {
            throw err;
          }
        }

        const membershipRecord =
          data?.member ||
          data?.membership ||
          (Array.isArray(data?.members)
            ? data.members.find(
                (member: any) =>
                  member?.user_id === bootstrapUserId || member?.id === bootstrapUserId,
              )
            : null);

        if (membershipRecord?.last_viewed_at || membershipRecord?.last_view_at) {
          setLastViewedAt(membershipRecord.last_viewed_at || membershipRecord.last_view_at || null);
        }

        // Update member count from response
        if (!!data?.memberCount && memberCount !== data.memberCount) {
          setMemberCount(data.memberCount);
        }

        const userMap = ensureMattermostUsersHaveHiveNames(normalizeUsersFromMap(data?.users));
        if (Object.keys(userMap).length) {
          _mergeUserLookup((prev) => ({ ...prev, ...userMap }));
        }

        const normalizedPosts = sortPosts(normalizePosts(data));

        // Check if we got new posts (for pagination detection)
        const hasNewPosts = normalizedPosts.length > 0;
        setHasMorePosts(hasNewPosts);

        setPosts((prev) => {
          if (refresh) {
            return normalizedPosts;
          }
          return unionBy(prev, normalizedPosts, 'id');
        });

        const lastPost = normalizedPosts[normalizedPosts.length - 1];
        if (lastPost?.id) {
          setLastPostId(lastPost.id);
        } else if (!hasNewPosts) {
          // No more posts available
          setHasMorePosts(false);
        }

        _resolveUserProfiles(collectMissingUserIds(normalizedPosts, userLookupRef.current));

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
      _resolveUserProfiles,
      _mergeUserLookup,
      channelId,
      bootstrapResult,
      lastPostId,
      isRefreshing,
      isLoading,
      memberCount,
      _fetchRootMessages,
    ],
  );

  // Initial load effect - reset state when channel changes
  useEffect(() => {
    // Clear all channel-specific state to prevent cross-channel bleed
    setPosts([]);
    setLastPostId(null);
    setRootMessages({});
    setRootPost(null);
    setFirstUnreadIndex(null);
    setLastViewedAt(initialLastViewedAt ?? null);
    setUnreadAnchor(initialLastViewedAt ?? null);
    setError(null);
    setHasMorePosts(true);
    setMemberCount(null);

    // Load posts for new channel
    _loadPosts(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, initialLastViewedAt]);

  // Reset scroll state when channel changes
  useEffect(() => {
    setHasScrolledToUnread(false);
  }, [channelId, unreadAnchor]);

  // Calculate first unread index
  useEffect(() => {
    if (!posts.length) {
      setFirstUnreadIndex(null);
      return;
    }

    const lastViewed = unreadAnchor || 0;
    let nextIndex = -1;
    for (let i = 0; i < posts.length; i++) {
      const postTimestamp = posts[i].create_at || posts[i].update_at || 0;
      if (postTimestamp > lastViewed) {
        nextIndex = i;
      } else {
        break;
      }
    }

    if (nextIndex >= 0) {
      setFirstUnreadIndex(nextIndex);
      return;
    }

    if (unreadAnchor !== null) {
      setFirstUnreadIndex(null);
      return;
    }

    setFirstUnreadIndex(null);
  }, [posts, unreadAnchor]);

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

  // Auto-scroll to unread effect
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

  // Mark channel viewed effect
  useEffect(() => {
    const shouldMarkViewed =
      (firstUnreadIndex === null || hasScrolledToUnread) && latestPostTimestamp > 0;

    if (!shouldMarkViewed) {
      return;
    }

    _markChannelViewed(latestPostTimestamp);
  }, [firstUnreadIndex, hasScrolledToUnread, latestPostTimestamp, _markChannelViewed]);

  // Keyboard visibility effect
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(
        e.endCoordinates.height + Platform.select({ android: insets.bottom, default: 0 }),
      );
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

  // Edit and reply actions
  const _resetEditing = useCallback(() => {
    setEditingPostId(null);
    setMessage('');
    setMentionQuery(null);
    setMentionStartIndex(null);
    setRootPost(null);
  }, []);

  const _cancelReply = useCallback(() => {
    setRootPost(null);
  }, []);

  const _handleSelectMention = useCallback(
    (user: any) => {
      const username = getMentionUsername(user);
      if (!username) {
        return;
      }

      setMessage((prev) => {
        const start = mentionStartIndex ?? prev.length;
        const queryLength = mentionQuery?.length ?? 0;
        const afterStart = (mentionStartIndex ?? prev.length) + 1 + queryLength;
        const before = mentionStartIndex !== null ? prev.slice(0, start) : prev;
        const after = mentionStartIndex !== null ? prev.slice(afterStart) : '';
        const mentionText = `@${username}`;
        const needsSpaceAfter =
          after.length === 0 ? ' ' : after.startsWith(' ') || after.startsWith('\n') ? '' : ' ';
        const nextMessage = `${before}${mentionText}${needsSpaceAfter}${after}`;
        _updateMentionState(nextMessage);
        return nextMessage;
      });

      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [mentionQuery, mentionStartIndex, _updateMentionState],
  );

  const _handleStartEdit = useCallback(
    (post: ChatPost) => {
      setRootPost(null);
      const timestamp = post.create_at || post.update_at;
      const body = formatPostBody(post, userLookup, timestamp);
      setMessage(body);
      _updateMentionState(body);
      setEditingPostId(post.id || null);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [userLookup, _updateMentionState],
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
          sortPosts(
            prev.map((item) =>
              item.id === editingPostId
                ? { ...item, ...updatedPost, message: emojifiedMessage }
                : item,
            ),
          ),
        );
        setEditingPostId(null);
      } else {
        const rootId = rootPost?.root_id || rootPost?.id || '';

        // Get username from userLookup
        const rootAuthorId = rootPost?.user_id;
        const rootMappedUser = rootAuthorId && userLookupRef.current[rootAuthorId];
        const hiveUsername = getHiveUsernameFromMattermostUser(rootMappedUser);
        const rootUsername =
          (typeof rootMappedUser?.hiveUsername === 'string' ? rootMappedUser.hiveUsername : null) ||
          (typeof hiveUsername === 'string' ? hiveUsername : null) ||
          (typeof rootMappedUser?.nickname === 'string' ? rootMappedUser.nickname : null) ||
          (typeof rootMappedUser?.username === 'string' ? rootMappedUser.username : null) ||
          (typeof rootMappedUser?.name === 'string' ? rootMappedUser.name : null) ||
          '';

        const metadata = rootId && {
          parent_id: rootPost?.id || '',
          parent_username: rootUsername,
          parent_message: typeof rootPost?.message === 'string' ? rootPost.message : '',
        };

        const response = await sendMattermostMessage(channelId, emojifiedMessage, rootId, metadata);
        const newPost = normalizePost(response);
        if (newPost) {
          setPosts((prev) => sortPosts([...prev, newPost]));
          _resolveUserProfiles(collectMissingUserIds([newPost], userLookupRef.current));

          // Scroll to bottom when new message is sent
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index: 0,
              animated: true,
              viewPosition: 0,
            });
          }, 100);
        }
      }
      setMessage('');
      _updateMentionState('');
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
        setMessage((prev) => {
          const next = prev ? `${prev.trim()} ${uploadedUrl}` : uploadedUrl;
          _updateMentionState(next);
          return next;
        });
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
  }, [currentAccount, pinCode, _updateMentionState]);

  // Render helpers
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

  const _handleReplyToPost = useCallback(
    (post: ChatPost) => {
      setEditingPostId(null);
      setMessage('');
      _updateMentionState('');
      setRootPost(post);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [_updateMentionState],
  );

  const _handleAddReaction = useCallback(
    async (post: ChatPost, emojiName: string) => {
      const currentUserId = bootstrapUserId;
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
          await removeMattermostReaction(channelId, post.id, emojiName);
        } else {
          await addMattermostReaction(channelId, post.id, emojiName);
        }

        // Manually update the reactions array
        setPosts((prev) =>
          prev.map((item) => {
            if (item.id !== post.id) {
              return item;
            }

            const existingReactions = item.metadata?.reactions || item.props?.reactions || [];
            let updatedReactions: ChatReaction[];

            if (hasUserReaction) {
              updatedReactions = existingReactions.filter(
                (r: ChatReaction) => !(r.emoji_name === emojiName && r.user_id === currentUserId),
              );
            } else {
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
    },
    [_ensureBootstrap, channelId, bootstrapUserId, dispatch, intl],
  );

  const _confirmDelete = useCallback(
    (postToDelete: ChatPost) => {
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
    },
    [intl, _handleRemovePost],
  );

  const _showChatOptionsSheet = useCallback(
    (post: ChatPost, isOwn: boolean) => {
      SheetManager.show(SheetNames.CHAT_OPTIONS, {
        payload: {
          post,
          channelId,
          currentUserId: bootstrapUserId,
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
                  _confirmDelete(post);
                }
              : undefined,
        },
      });
    },
    [
      channelId,
      bootstrapUserId,
      canModerate,
      _handleReplyToPost,
      _handleAddReaction,
      _handleStartEdit,
      _confirmDelete,
    ],
  );

  // Header title
  const headerTitle = useMemo(() => {
    let title = '';
    if (headerUser) {
      title = headerUser.display_name || headerUser.name || channelName || channelId;
    } else {
      title = channelName || channelId;
    }

    // Append member count if available and more than 2
    if (!!memberCount && memberCount > 2) {
      return intl.formatMessage(
        { id: 'chats.header_with_members', defaultMessage: '{title} - {count} members' },
        { title, count: memberCount },
      );
    }

    return title;
  }, [headerUser, channelName, channelId, memberCount, intl]);

  // Process and group posts
  const processedPosts = useMemo(() => {
    const result: Array<ChatPost | GroupedSystemMessage> = [];
    let currentGroup: ChatPost[] = [];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const isSystemAdd =
        post?.type === 'system_add_to_channel' ||
        post?.type === 'system_add_to_team' ||
        post?.type === 'system_join_team';

      if (isSystemAdd) {
        currentGroup.push(post);
      } else {
        // If we have a group, add it before processing the current post
        if (currentGroup.length > 1) {
          result.push({
            type: 'grouped_system_add',
            id: `group_${currentGroup[0].id}`,
            posts: currentGroup.sort((a, b) => (a.create_at || 0) - (b.create_at || 0)),
            create_at: currentGroup[0].create_at || currentGroup[0].update_at || 0,
          });
        } else if (currentGroup.length === 1) {
          // Single system add message, add it as-is
          result.push(currentGroup[0]);
        }
        currentGroup = [];
        result.push(post);
      }
    }

    // Handle remaining group at the end
    if (currentGroup.length > 1) {
      result.push({
        type: 'grouped_system_add',
        id: `group_${currentGroup[0].id}`,
        posts: currentGroup,
        create_at: currentGroup[0].create_at || currentGroup[0].update_at || 0,
      });
    } else if (currentGroup.length === 1) {
      result.push(currentGroup[0]);
    }

    return result;
  }, [posts]);

  // Auto-fetch more posts if needed
  useEffect(() => {
    if (
      processedPosts.length < 15 &&
      !isLoading &&
      !isRefreshing &&
      hasMorePosts &&
      posts.length > 0
    ) {
      _loadPosts(false);
    }
  }, [processedPosts.length, isLoading, isRefreshing, hasMorePosts, posts.length, _loadPosts]);

  // List content style
  const listContentStyle = useMemo(
    () => [styles.listContent, { paddingBottom: styles.listContent.paddingBottom + insets.bottom }],
    [insets.bottom],
  );

  // Helper function for rendering reply preview
  const _renderReplyPreview = useCallback(
    (rootId: string, parentPreview: ChatParentPreview | null, isOwnMessage: boolean) => {
      if (!parentPreview) {
        const rootMessage = rootMessages[rootId];
        if (!rootMessage) {
          return null;
        }
        // Get username from userLookup
        const rootAuthorId = rootMessage.user_id;
        const rootMappedUser = rootAuthorId && userLookup[rootAuthorId];
        const hiveUsername = getHiveUsernameFromMattermostUser(rootMappedUser);

        parentPreview = {
          parent_id: rootMessage.id,
          parent_message: rootMessage.message || '',
          parent_username: hiveUsername,
        };
      }

      return (
        <ReplyPreview
          rootId={rootId}
          parentPreview={parentPreview}
          isOwnMessage={isOwnMessage}
          showCloseButton={false}
          rootMessages={rootMessages}
          userLookup={userLookup}
        />
      );
    },
    [rootMessages, userLookup],
  );

  // Helper function for rendering reactions
  const _renderReactions = useCallback(
    (reactions: ChatReaction[] | undefined, isOwnMessage: boolean) => {
      return (
        <MessageReactions
          reactions={reactions}
          isOwnMessage={isOwnMessage}
          bootstrapUserId={bootstrapUserId}
        />
      );
    },
    [bootstrapUserId],
  );

  // Render item callback
  const _renderItem = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
    ({ item, index }: { item: any; index: number }) => {
      // Handle grouped system messages
      if ('type' in item && item.type === 'grouped_system_add') {
        const groupedItem = item as GroupedSystemMessage;

        return (
          <GroupedSystemMessages
            groupedItem={groupedItem}
            index={index}
            firstUnreadIndex={firstUnreadIndex}
            getAddedUserInfo={(post) => getAddedUserInfo(post, userLookup)}
            onShowUserProfile={_showUserProfile}
          />
        );
      }

      // Regular post rendering
      const postItem = item as ChatPost;
      const isSystemAddMessage =
        postItem?.type === 'system_add_to_channel' ||
        postItem?.type === 'system_add_to_team' ||
        postItem?.type === 'system_join_team';
      const authorId = postItem.user_id || postItem.user?.id;
      const isOwnMessage = authorId && bootstrapUserId === authorId;

      if (isSystemAddMessage) {
        return (
          <SystemMessageItem
            post={postItem}
            index={index}
            firstUnreadIndex={firstUnreadIndex}
            formatPostBody={(post, timestamp) => formatPostBody(post, userLookup, timestamp)}
            parseMessageContent={parseMessageContent}
            getAddedUserInfo={(post) => getAddedUserInfo(post, userLookup)}
            onShowUserProfile={_showUserProfile}
          />
        );
      }

      return (
        <ThreadMessageItem
          post={postItem}
          index={index}
          isOwnMessage={isOwnMessage}
          bootstrapUserId={bootstrapUserId}
          userLookup={userLookup}
          rootMessages={rootMessages}
          firstUnreadIndex={firstUnreadIndex}
          canModerate={canModerate}
          onShowActions={_showChatOptionsSheet}
          onShowUserProfile={_showUserProfile}
          formatPostBody={(post, timestamp) => formatPostBody(post, userLookup, timestamp)}
          parseMessageContent={parseMessageContent}
          renderReplyPreview={_renderReplyPreview}
          renderReactions={_renderReactions}
          linkifyInstance={linkifyInstance}
          handleLink={handleLink}
        />
      );
    },
    [
      firstUnreadIndex,
      userLookup,
      bootstrapUserId,
      rootMessages,
      canModerate,
      _showUserProfile,
      _showChatOptionsSheet,
      _renderReplyPreview,
      _renderReactions,
      linkifyInstance,
      handleLink,
    ],
  );

  // Render composer callback
  const _renderEditingBanner = useCallback(() => {
    return <EditingBanner editingPostId={editingPostId} onCancelEdit={_resetEditing} />;
  }, [editingPostId, _resetEditing]);

  const _renderComposerReplyPreview = useCallback(() => {
    if (!rootPost?.id) {
      return null;
    }

    const rootAuthorId = rootPost.user_id;
    const rootMappedUser = rootAuthorId && userLookup[rootAuthorId];
    const hiveUsername = getHiveUsernameFromMattermostUser(rootMappedUser);
    const parentPreview = {
      parent_id: rootPost.id,
      parent_message: rootPost.message || '',
      parent_username: hiveUsername,
    } as ChatParentPreview;

    return (
      <View style={styles.composerReplyPreview}>
        <ReplyPreview
          rootId={rootPost.id}
          parentPreview={parentPreview}
          isOwnMessage={false}
          showCloseButton={true}
          onClose={_cancelReply}
          rootMessages={rootMessages}
          userLookup={userLookup}
        />
      </View>
    );
  }, [rootPost, userLookup, rootMessages, _cancelReply]);

  const _renderMentionSuggestions = useCallback(() => {
    return (
      <MentionSuggestions
        mentionQuery={mentionQuery}
        suggestions={mentionSuggestions}
        onSelectMention={_handleSelectMention}
        getMentionUsername={getMentionUsername}
      />
    );
  }, [mentionQuery, mentionSuggestions, _handleSelectMention]);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <BasicHeader title={headerTitle} />

      <View style={{ flex: 1 }}>
        <ThreadMessageList
          listRef={listRef}
          processedPosts={processedPosts}
          renderItem={_renderItem}
          isRefreshing={isRefreshing}
          onRefresh={() => _loadPosts(true)}
          isLoading={isLoading}
          hasMorePosts={hasMorePosts}
          onLoadMore={() => _loadPosts()}
          error={error}
          listContentStyle={listContentStyle}
          onScrollToIndexFailed={({ index }) =>
            setTimeout(
              () => listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 }),
              400,
            )
          }
          onContentSizeChange={_scrollToUnread}
        />

        <ThreadComposer
          message={message}
          onMessageChange={_handleMessageChange}
          onSend={_handleSend}
          onAttachImage={_handleAttachImage}
          isSending={isSending}
          isUploadingImage={isUploadingImage}
          editingPostId={editingPostId}
          keyboardHeight={keyboardHeight}
          isKeyboardVisible={isKeyboardVisible}
          renderEditingBanner={_renderEditingBanner}
          renderComposerReplyPreview={_renderComposerReplyPreview}
          renderMentionSuggestions={_renderMentionSuggestions}
          inputRef={inputRef}
          insets={insets}
        />
      </View>
    </SafeAreaView>
  );
};

export default ChatThreadContainer;
