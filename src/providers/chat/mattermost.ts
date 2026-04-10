import axios from 'axios';
import get from 'lodash/get';
import chatApi, { setChatApiToken } from '../../config/chatApi';
import { getDigitPinCode } from '../hive/hive';
import { decryptKey } from '../../utils/crypto';
import { getSCAccount } from '../../realm/realm';

interface MattermostBootstrapPayload {
  accessToken: string;
  refreshToken?: string;
  username: string;
}

export const resolveMattermostTokens = async (
  currentAccount: any,
  pinCode: string | null,
): Promise<MattermostBootstrapPayload> => {
  if (!currentAccount?.name) {
    throw new Error('No authenticated user found');
  }

  const digitPinCode = getDigitPinCode(pinCode);
  const encryptedAccessToken = get(currentAccount, 'local.accessToken');
  const accessToken = encryptedAccessToken ? decryptKey(encryptedAccessToken, digitPinCode) : null;

  if (!accessToken) {
    throw new Error('Hive access token missing. Please log out and log back in.');
  }

  const scAccount = await getSCAccount(currentAccount.name);

  return {
    accessToken,
    refreshToken: scAccount?.refreshToken,
    username: currentAccount.name,
  };
};

// ---------------------------------------------------------------------------
// Bootstrap dedup + short-lived result cache
// ---------------------------------------------------------------------------
//
// /api/mattermost/bootstrap is expensive (3–6s p95 on the backend) and a
// single mobile user can naturally trigger 2–4 concurrent calls during a
// cold start: applicationContainer._refreshUnreadChats fires one, then the
// user navigates to the chats screen which fires another, then into a
// specific thread which fires a third. Previously each of those hit the
// backend independently, producing duplicate/retry-storm traffic and a high
// CLOSE_WAIT count on origins when React Native later tears down orphaned
// sockets.
//
// The cache below collapses those paths:
//   - In-flight dedup: while a bootstrap is pending for a given username,
//     subsequent callers await the same promise instead of firing their own.
//   - TTL result cache: a successful bootstrap is reused for 30 seconds.
//     This covers quick background→foreground cycles and cross-screen
//     navigation. Unread counts still refresh via fetchMattermostChannels
//     (a separate endpoint) so no staleness is user-visible.
//
// Keyed by username so multi-account users never cross-pollute sessions.
const BOOTSTRAP_CACHE_TTL_MS = 30_000;
const inFlightBootstrap = new Map<string, Promise<any>>();
const bootstrapCache = new Map<string, { data: any; expiresAt: number }>();

// Generation counter used to invalidate in-flight bootstrap requests that
// resolve *after* the cache has been cleared (e.g. user logged out mid-flight).
// Each time clearMattermostBootstrapCache() runs we bump the generation; any
// pending IIFE checks its captured generation before writing the token back
// to the shared axios instance or re-populating the TTL cache.
let bootstrapGeneration = 0;

export const clearMattermostBootstrapCache = (username?: string) => {
  if (username) {
    bootstrapCache.delete(username);
    inFlightBootstrap.delete(username);
  } else {
    bootstrapCache.clear();
    inFlightBootstrap.clear();
  }
  // Invalidate any bootstrap that was already on the wire when this cleared.
  // Their resolved side-effects (setChatApiToken + cache.set) will be skipped.
  bootstrapGeneration += 1;
};

export const bootstrapMattermostSession = async (
  currentAccount: any,
  pinCode: string | null,
): Promise<any> => {
  const username = currentAccount?.name;
  if (!username) {
    throw new Error('No authenticated user found');
  }

  // Fresh cache hit: return without hitting the network. Reapply the token
  // to the shared axios instance in case another account's bootstrap has
  // overwritten it since we cached this entry.
  const cached = bootstrapCache.get(username);
  if (cached && cached.expiresAt > Date.now()) {
    if (cached.data?.token) {
      setChatApiToken(cached.data.token, username);
    }
    return cached.data;
  }

  // In-flight dedup: await any request already on the wire for this user.
  const existing = inFlightBootstrap.get(username);
  if (existing) {
    return existing;
  }

  const startGeneration = bootstrapGeneration;
  let promise: Promise<any>;
  const run = async () => {
    try {
      const payload = await resolveMattermostTokens(currentAccount, pinCode);
      const { data } = await chatApi.post('/api/mattermost/bootstrap', payload);

      // If the cache was cleared while this request was in flight (logout,
      // account teardown, data clear), do not repopulate the shared token or
      // TTL cache — that would silently re-authenticate the old user.
      if (bootstrapGeneration !== startGeneration) {
        return data;
      }

      // Store token explicitly with the username so subsequent requests
      // don't depend on the async cookie jar, and multi-account switches
      // can't contaminate each other's channels
      if (data?.token) {
        setChatApiToken(data.token, payload.username);
      }

      bootstrapCache.set(username, {
        data,
        expiresAt: Date.now() + BOOTSTRAP_CACHE_TTL_MS,
      });

      return data;
    } finally {
      // Only clear the in-flight slot if we're still the current one — a
      // concurrent clear() may have already deleted it (and potentially
      // started a newer request with the same key).
      if (inFlightBootstrap.get(username) === promise) {
        inFlightBootstrap.delete(username);
      }
    }
  };
  promise = run();

  inFlightBootstrap.set(username, promise);
  return promise;
};

export const fetchMattermostChannels = async () => {
  const { data } = await chatApi.get('/api/mattermost/channels');
  return data.channels || data;
};

export const normalizeMattermostChannels = (rawChannels: any): any[] => {
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

export const getChannelUnreadTotal = (channel: any): number => {
  if (channel?.is_muted) {
    return 0;
  }

  // Channels that have never been viewed (null/undefined last_viewed_at)
  // should not count unreads — prevents auto-joined channels from
  // inflating the badge with all historical messages.
  const lastViewed = channel?.last_viewed_at ?? channel?.last_view_at;
  if (lastViewed == null) {
    return 0;
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

  const unreadMessages = Number.isFinite(channel?.message_count)
    ? channel.message_count
    : Number.isFinite(channel?.unread_messages)
    ? channel.unread_messages
    : Number.isFinite(channel?.unread_msg_count)
    ? channel.unread_msg_count
    : Number.isFinite(channel?.unread_count)
    ? channel.unread_count
    : 0;

  // mentions are a subset of unread messages, use max to avoid double-counting
  return Math.max(unreadMentions, unreadMessages);
};

export const calculateGlobalUnreadTotal = async (): Promise<number> => {
  const channelResponse = await fetchMattermostChannels();
  const channels = normalizeMattermostChannels(channelResponse);
  return channels.reduce((total: number, item: any) => total + getChannelUnreadTotal(item), 0);
};

export const searchMattermostChannels = async (query: string) => {
  const term = query.trim();

  if (term.length < 2) {
    return [];
  }

  try {
    const { data } = await chatApi.post('/api/mattermost/channels/search', {
      term,
      include_public: true,
      include_private: true,
    });
    return data.channels || data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 405) {
        const { data } = await chatApi.get('/api/mattermost/channels/search', {
          params: { term },
        });
        return data.channels || data;
      }

      if (err.response?.status === 400) {
        return [];
      }
    }

    throw err;
  }
};

export const searchMattermostUsers = async (query: string) => {
  const term = query.trim();

  if (term.length < 2) {
    return [];
  }

  try {
    const { data } = await chatApi.get('/api/mattermost/users/search', {
      params: { q: term },
    });
    return data.users || data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 405) {
      const { data } = await chatApi.post('/api/mattermost/users/search', { q: term });
      return data.users || data;
    }

    throw err;
  }
};

export const joinMattermostChannel = async (channelId: string) => {
  const { data } = await chatApi.post(`/api/mattermost/channels/${channelId}/join`);
  return data.channel || data;
};

export const toggleMattermostChannelFavorite = async (channelId: string, favorite: boolean) => {
  const { data } = await chatApi.post(`/api/mattermost/channels/${channelId}/favorite`, {
    favorite,
  });
  return data.channel || data;
};

export const toggleMattermostChannelMute = async (channelId: string, muted: boolean) => {
  const { data } = await chatApi.post(`/api/mattermost/channels/${channelId}/mute`, {
    muted,
  });
  return data.channel || data;
};

export const leaveMattermostChannel = async (channelId: string) => {
  try {
    const { data } = await chatApi.post(`/api/mattermost/channels/${channelId}/leave`);
    return data.channel || data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      const { data } = await chatApi.delete(`/api/mattermost/channels/${channelId}/members/me`);
      return data.channel || data;
    }

    throw err;
  }
};

export const fetchMattermostChannelPosts = async (channelId: string, before?: string) => {
  const params = before !== undefined ? { before } : {};
  const { data } = await chatApi.get(`/api/mattermost/channels/${channelId}/posts`, { params });
  return data;
};

export const fetchMattermostPost = async (channelId: string, postId: string) => {
  const { data } = await chatApi.get(`/api/mattermost/channels/${channelId}/posts/${postId}`);
  return data.post || data;
};

export const markMattermostChannelViewed = async (
  channelId: string,
  prevChannelId?: string | null,
) => {
  const payload: { channel_id: string; prev_channel_id?: string | null } = {
    channel_id: channelId,
  };

  if (prevChannelId) {
    payload.prev_channel_id = prevChannelId;
  }

  const { data } = await chatApi.post(`/api/mattermost/channels/${channelId}/view`, payload);
  return data;
};

export const deleteMattermostMessage = async (channelId: string, postId: string) => {
  const { data } = await chatApi.delete(`/api/mattermost/channels/${channelId}/posts/${postId}`);
  return data;
};

export const updateMattermostMessage = async (
  channelId: string,
  postId: string,
  message: string,
) => {
  const payload = { message };
  const { data } = await chatApi.patch(
    `/api/mattermost/channels/${channelId}/posts/${postId}`,
    payload,
  );
  return data.post || data;
};

export const fetchMattermostChannelMembers = async (channelId: string) => {
  const { data } = await chatApi.get(`/api/mattermost/channels/${channelId}/members`);
  return data.members || data;
};

export const sendMattermostMessage = async (
  channelId: string,
  message: string,
  rootId: string,
  props: any,
  pendingPostId?: string,
) => {
  const payload = { message, rootId, props, pendingPostId };
  try {
    const { data } = await chatApi.post(`/api/mattermost/channels/${channelId}/posts`, payload);
    return data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.data?.prop === 'ecency_chat_banned_until') {
      const banError: any = new Error(
        err.response?.data?.error || err.response?.data?.message || 'User is banned from chat',
      );
      banError.isBanError = true;
      throw banError;
    }
    throw err;
  }
};

export type MattermostDmPrivacy = 'all' | 'followers' | 'none';

export const getMattermostDmPrivacy = async (): Promise<MattermostDmPrivacy> => {
  const { data } = await chatApi.get('/api/mattermost/me/dm-privacy');
  return (data?.privacy || data) as MattermostDmPrivacy;
};

export const updateMattermostDmPrivacy = async (
  privacy: MattermostDmPrivacy,
): Promise<MattermostDmPrivacy> => {
  const { data } = await chatApi.put('/api/mattermost/me/dm-privacy', { privacy });
  return (data?.privacy || privacy) as MattermostDmPrivacy;
};

export const fetchMattermostUsersByIds = async (userIds: string[]) => {
  if (!userIds?.length) {
    return [];
  }

  const { data } = await chatApi.post('/api/mattermost/users/ids', { ids: userIds });
  return data.users || data;
};

/**
 * Starts a direct message channel with a user irrespective of whether it is a hive username or mattermost user object
 * @param user - can be hive username or mattermost user object
 * @returns mattermost direct message channel object
 */
export const startMattermostDirectMessage = async (
  user:
    | string
    | {
        id: string;
        first_name: string;
        last_name: string;
        nickname: string;
        username: string;
      },
) => {
  const payload: { userId?: string; username?: string } = {};

  if (!user) {
    throw new Error('Mattermost user object or username is required');
  }

  if (typeof user === 'string') {
    payload.username = user;
  } else {
    const userId = user.id;
    const username = user.username || user.nickname || user.first_name || user.last_name || user.id;

    if (!userId && !username) {
      throw new Error('User id or username required');
    }

    payload.userId = userId;
    payload.username = username;
  }

  const { data } = await chatApi.post('/api/mattermost/direct', payload);
  return data.channel || data;
};

export const getHiveUsernameFromMattermostUser = (user: any): string | undefined =>
  user?.props?.hive_username || user?.nickname || user?.username || user?.name;

export const ensureMattermostUsersHaveHiveNames = (users: any[]): Record<string, any> => {
  const lookup: Record<string, any> = {};

  users?.forEach((user) => {
    if (user?.id) {
      lookup[user.id] = {
        ...user,
        hiveUsername: getHiveUsernameFromMattermostUser(user),
      };
    }
  });

  return lookup;
};

export const addMattermostReaction = async (
  channelId: string,
  postId: string,
  emojiName: string,
) => {
  const { data } = await chatApi.post(
    `/api/mattermost/channels/${channelId}/posts/${postId}/reactions`,
    {
      emoji: emojiName,
    },
  );
  return data.post || data;
};

export const removeMattermostReaction = async (
  channelId: string,
  postId: string,
  emojiName: string,
) => {
  const { data } = await chatApi.delete(
    `/api/mattermost/channels/${channelId}/posts/${postId}/reactions`,
    {
      data: {
        emoji: emojiName,
      },
    },
  );
  return data.post || data;
};

export const extractHiveCommunityIdentifier = (channel: any): string | undefined => {
  const haystack = `${channel?.name || ''} ${channel?.display_name || ''} ${channel?.header || ''}`;
  const match = haystack.match(/hive-[0-9]+/i);
  return match ? match[0] : undefined;
};

export const pinMattermostPost = async (channelId: string, postId: string): Promise<any> => {
  const { data } = await chatApi.post(`/api/mattermost/channels/${channelId}/posts/${postId}/pin`);
  return data;
};

export const unpinMattermostPost = async (channelId: string, postId: string): Promise<any> => {
  const { data } = await chatApi.delete(
    `/api/mattermost/channels/${channelId}/posts/${postId}/pin`,
  );
  return data;
};

export const fetchMattermostPinnedPosts = async (channelId: string): Promise<any> => {
  const { data } = await chatApi.get(`/api/mattermost/channels/${channelId}/pinned`);
  return data.order || data.posts || data;
};
