import {
  getHiveUsernameFromMattermostUser,
  extractHiveCommunityIdentifier,
} from '../../../providers/chat/mattermost';
import { ChatPost } from './messageFormatters';

/**
 * Get username for mentions from user object
 */
export const getMentionUsername = (user: any): string =>
  (typeof user?.hiveUsername === 'string' && user.hiveUsername) ||
  getHiveUsernameFromMattermostUser(user) ||
  (typeof user?.username === 'string' && user.username) ||
  (typeof user?.nickname === 'string' && user.nickname) ||
  (typeof user?.name === 'string' && user.name) ||
  '';

/**
 * Collect user IDs that are missing from the user lookup
 */
export const collectMissingUserIds = (
  list: ChatPost[],
  userLookupRef: Record<string, any>,
): string[] => {
  const ids = new Set<string>();

  list.forEach((post) => {
    const idFromPost = post?.user_id || post?.user?.id;
    if (idFromPost && !userLookupRef[idFromPost]) {
      ids.add(idFromPost);
    }
  });

  return Array.from(ids);
};

/**
 * Safely extract Hive community identifier from channel
 */
export const safeExtractCommunityIdentifier = (channel: any): string | undefined => {
  try {
    return extractHiveCommunityIdentifier(channel);
  } catch (err) {
    return undefined;
  }
};
