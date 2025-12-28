import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../../hooks';
import { getUser, getFollows, getRelationship } from '../hive/dhive';
import { checkFavorite } from '../ecency/ecency';
import QUERIES from './queryKeys';

/**
 * Hook to fetch and cache user profile data
 * @param username - The username to fetch profile for
 * @param enabled - Whether to enable the query (default: true)
 */
export const useUserQuery = (username: string, enabled: boolean = true) => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const isOwnProfile = !username || currentAccount.name === username;
  const targetUsername = isOwnProfile ? currentAccount.name : username;

  return useQuery({
    queryKey: [QUERIES.USER.GET, targetUsername],
    queryFn: async () => {
      if (!targetUsername) {
        throw new Error('Username is required');
      }

      const user = await getUser(targetUsername);
      return user;
    },
    enabled: enabled && !!targetUsername,
  });
};

/**
 * Hook to fetch user follows data (followers/following)
 * @param username - The username to fetch follows for
 */
export const useUserFollowsQuery = (username: string) => {
  return useQuery({
    queryKey: [QUERIES.USER.GET_FOLLOWS, username],
    queryFn: async () => {
      if (!username) {
        throw new Error('Username is required');
      }

      const follows = await getFollows(username);
      return follows;
    },
    enabled: !!username,
  });
};

/**
 * Hook to fetch user relationship data (following/muted status)
 * @param targetUsername - The username to check relationship with
 */
export const useUserRelationshipQuery = (targetUsername: string) => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);

  return useQuery({
    queryKey: [QUERIES.USER.GET_RELATIONSHIP, currentAccount.name, targetUsername],
    queryFn: async () => {
      if (!targetUsername || !currentAccount.name) {
        return { isFollowing: false, isMuted: false };
      }

      const relationship: any = await getRelationship(currentAccount.name, targetUsername);
      return {
        isFollowing: relationship?.follows || false,
        isMuted: relationship?.ignores || false,
      };
    },
    enabled: isLoggedIn && !!targetUsername && !!currentAccount.name,
  });
};

/**
 * Hook to check if a user is favorited
 * @param targetUsername - The username to check favorite status
 */
export const useUserFavoriteQuery = (targetUsername: string) => {
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);

  return useQuery({
    queryKey: [QUERIES.USER.GET_FAVORITE, targetUsername],
    queryFn: async () => {
      if (!targetUsername) {
        return false;
      }

      const isFavorite = await checkFavorite(targetUsername);
      return isFavorite;
    },
    enabled: isLoggedIn && !!targetUsername,
  });
};

/**
 * Hook to get all profile data in one place
 * Combines user, follows, relationship, and favorite data
 */
export const useProfileData = (username: string, isOwnProfile: boolean) => {
  const userQuery = useUserQuery(username);
  const followsQuery = useUserFollowsQuery(username);
  const relationshipQuery = useUserRelationshipQuery(username);
  const favoriteQuery = useUserFavoriteQuery(username);

  return {
    user: userQuery.data,
    follows: followsQuery.data,
    relationship: relationshipQuery.data,
    isFavorite: favoriteQuery.data,
    isLoading:
      userQuery.isLoading ||
      followsQuery.isLoading ||
      (relationshipQuery.isLoading && !isOwnProfile) ||
      (favoriteQuery.isLoading && !isOwnProfile),
    isError: userQuery.isError || followsQuery.isError,
    error: userQuery.error || followsQuery.error,
    refetch: () => {
      userQuery.refetch();
      followsQuery.refetch();
      if (!isOwnProfile) {
        relationshipQuery.refetch();
        favoriteQuery.refetch();
      }
    },
  };
};

/**
 * Hook to invalidate user cache
 */
export const useInvalidateUserCache = () => {
  const queryClient = useQueryClient();

  return (username: string) => {
    queryClient.invalidateQueries({ queryKey: [QUERIES.USER.GET, username] });
    queryClient.invalidateQueries({ queryKey: [QUERIES.USER.GET_FOLLOWS, username] });
    queryClient.invalidateQueries({ queryKey: [QUERIES.USER.GET_RELATIONSHIP] });
    queryClient.invalidateQueries({ queryKey: [QUERIES.USER.GET_FAVORITE, username] });
  };
};
