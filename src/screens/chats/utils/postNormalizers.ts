import { getHiveUsernameFromMattermostUser } from '../../../providers/chat/mattermost';
import { ChatPost } from './messageFormatters';

/**
 * Normalize posts from various API response formats to a consistent array
 */
export const normalizePosts = (payload: any): ChatPost[] => {
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

/**
 * Normalize a single post from API response
 */
export const normalizePost = (payload: any): ChatPost | null => {
  if (!payload) {
    return null;
  }

  if (payload.post) {
    return payload.post;
  }

  return payload;
};

/**
 * Normalize user lookup by ensuring all users have hive usernames
 */
export const normalizeUserLookup = (lookup: Record<string, any> = {}): Record<string, any> => {
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

/**
 * Convert users map to array
 */
export const normalizeUsersFromMap = (usersMap?: Record<string, any>): any[] =>
  usersMap ? Object.values(usersMap) : [];

/**
 * Sort posts by timestamp (newest first - descending order)
 */
export const sortPosts = (list: ChatPost[]): ChatPost[] =>
  [...list].sort((a, b) => {
    const first = a?.create_at || 0;
    const second = b?.create_at || 0;
    return second - first;
  });
