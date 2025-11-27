import axios from 'axios';
import get from 'lodash/get';
import chatApi from '../../config/chatApi';
import { getDigitPinCode } from '../hive/dhive';
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

export const bootstrapMattermostSession = async (
  currentAccount: any,
  pinCode: string | null,
): Promise<any> => {
  const payload = await resolveMattermostTokens(currentAccount, pinCode);
  const { data } = await chatApi.post('/api/mattermost/bootstrap', payload);
  return data;
};

export const fetchMattermostChannels = async () => {
  const { data } = await chatApi.get('/api/mattermost/channels');
  return data.channels || data;
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

export const fetchMattermostChannelPosts = async (channelId: string) => {
  const { data } = await chatApi.get(`/api/mattermost/channels/${channelId}/posts`);
  return data;
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
  const { data } = await chatApi.put(
    `/api/mattermost/channels/${channelId}/posts/${postId}`,
    payload,
  );
  return data.post || data;
};

export const fetchMattermostChannelModeration = async (channelId: string) => {
  const { data } = await chatApi.get(`/api/mattermost/channels/${channelId}/moderation`);
  return data;
};

export const fetchMattermostChannelMembers = async (channelId: string) => {
  const { data } = await chatApi.get(`/api/mattermost/channels/${channelId}/members`);
  return data.members || data;
};

export const sendMattermostMessage = async (channelId: string, message: string) => {
  const payload = { message };
  const { data } = await chatApi.post(`/api/mattermost/channels/${channelId}/posts`, payload);
  return data;
};

export const fetchMattermostUsersByIds = async (userIds: string[]) => {
  if (!userIds?.length) {
    return [];
  }

  const { data } = await chatApi.post('/api/mattermost/users/ids', { ids: userIds });
  return data.users || data;
};

export const startMattermostDirectMessage = async (
  user:
    | string
    | { id?: string; user_id?: string; username?: string; nickname?: string; name?: string },
) => {
  const userId = typeof user === 'string' ? user : user?.id || user?.user_id;
  const username =
    typeof user === 'string'
      ? undefined
      : user?.username || user?.nickname || user?.name || user?.id || user?.user_id;

  if (!userId && !username) {
    throw new Error('User id or username required');
  }

  const payload: { userId?: string; username?: string } = {};

  if (userId) {
    payload.userId = userId;
  }
  if (username) {
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

export const extractHiveCommunityIdentifier = (channel: any): string | undefined => {
  const haystack = `${channel?.name || ''} ${channel?.display_name || ''} ${channel?.header || ''}`;
  const match = haystack.match(/hive-[0-9]+/i);
  return match ? match[0] : undefined;
};
