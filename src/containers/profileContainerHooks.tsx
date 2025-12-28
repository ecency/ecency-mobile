import { useMemo } from 'react';
import { get } from 'lodash';
import { useAppSelector } from '../hooks';
import { useProfileData, useInvalidateUserCache } from '../providers/queries/userQueries';

/**
 * Wrapper component that provides React Query cached data to ProfileContainer
 */
export const useProfileQueries = (route: any) => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const username = route.params?.username ?? '';
  const isOwnProfile = !username || currentAccount.name === username;
  const targetUsername = isOwnProfile ? currentAccount.name : username;

  // Use the combined profile data hook
  const profileData = useProfileData(targetUsername, isOwnProfile);
  const invalidateUserCache = useInvalidateUserCache();

  // Prepare quick profile data
  const quickProfile = useMemo(() => {
    if (profileData.user) {
      return {
        reputation: get(profileData.user, 'reputation', ''),
        display_name: get(profileData.user, 'display_name', ''),
        name: targetUsername,
      };
    }
    return {
      reputation: get(route, 'params.reputation', ''),
      name: targetUsername,
    };
  }, [profileData.user, targetUsername, route]);

  // Compute selected user data
  const selectedUser = useMemo(() => {
    return profileData.user || null;
  }, [profileData.user]);

  // Get relationship data
  const isFollowing = profileData.relationship?.isFollowing || false;
  const isMuted = profileData.relationship?.isMuted || false;
  const isFavorite = profileData.isFavorite || false;

  // Get follows data
  const follows = profileData.follows || {};

  return {
    // User data
    selectedUser,
    quickProfile,

    // Relationship data
    isFollowing,
    isMuted,
    isFavorite,
    follows,

    // Loading states
    isReady: !profileData.isLoading && !!profileData.user,
    isProfileLoading: profileData.isLoading,

    // Other data
    username: targetUsername,
    isOwnProfile,

    // Refetch function
    refetchProfile: profileData.refetch,
    invalidateUserCache,
  };
};
