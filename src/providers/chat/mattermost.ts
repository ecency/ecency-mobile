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

export const fetchMattermostChannelPosts = async (channelId: string) => {
  const { data } = await chatApi.get(`/api/mattermost/channels/${channelId}/posts`);
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
