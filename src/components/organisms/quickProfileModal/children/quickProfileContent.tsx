import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { View, Alert } from 'react-native';
import { StatsItem } from 'components/statsPanel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { MainButton, StatsPanel } from '../../..';
import { addFavorite, deleteFavorite } from '../../../../providers/ecency/ecency';
import { followUser } from '../../../../providers/hive/dhive';
import { getRcPower, getVotingPower } from '../../../../utils/manaBar';
import styles from './quickProfileStyles';
import { ProfileBasic } from './profileBasic';
import { parseReputation } from '../../../../utils/user';
import { default as ROUTES } from '../../../../constants/routeNames';
import { ActionPanel } from './actionPanel';
import { getTimeFromNowNative } from '../../../../utils/time';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { toastNotification } from '../../../../redux/actions/uiAction';
import RootNavigation from '../../../../navigation/rootNavigation';
import { useProfileData, useInvalidateUserCache } from '../../../../providers/queries/userQueries';

interface QuickProfileContentProps {
  username: string;
  onClose: () => void;
}

export const QuickProfileContent = ({ username, onClose }: QuickProfileContentProps) => {
  const intl = useIntl();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);

  const [isActionLoading, setIsActionLoading] = useState(false);

  const isOwnProfile = currentAccount && currentAccount.name === username;

  // Use React Query for cached profile data
  const profileData = useProfileData(username, isOwnProfile);
  const invalidateUserCache = useInvalidateUserCache();

  // Extract data from React Query
  const { user } = profileData;
  const { follows } = profileData;
  const isFollowing = profileData.relationship?.isFollowing || false;
  const isMuted = profileData.relationship?.isMuted || false;
  const isFavourite = profileData.isFavorite || false;
  const isLoading = profileData.isLoading || isActionLoading;
  const isProfileLoaded = !!(user && follows);

  const _onFollowPress = async () => {
    try {
      const follower = currentAccount.name;
      const following = username;

      setIsActionLoading(true);
      await followUser(currentAccount, pinCode, {
        follower,
        following,
      });

      // Invalidate cache to refresh relationship data
      invalidateUserCache(username);

      setIsActionLoading(false);
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: isFollowing ? 'alert.success_unfollow' : 'alert.success_follow',
          }),
        ),
      );
    } catch (err) {
      setIsActionLoading(false);
      console.warn('Failed to follow user', err);
      Sentry.captureException(err);
      Alert.alert(intl.formatMessage({ id: 'alert.fail' }), err.message);
    }
  };

  const _onFavouritePress = async () => {
    try {
      setIsActionLoading(true);
      let favoriteAction;

      if (isFavourite) {
        favoriteAction = deleteFavorite;
      } else {
        favoriteAction = addFavorite;
      }

      await favoriteAction(username);

      // Invalidate cache to refresh favorite status
      invalidateUserCache(username);

      dispatch(
        toastNotification(
          intl.formatMessage({
            id: isFavourite ? 'alert.success_unfavorite' : 'alert.success_favorite',
          }),
        ),
      );
      setIsActionLoading(false);
    } catch (error) {
      console.warn('Failed to perform favorite action');
      setIsActionLoading(false);
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        error.message || error.toString(),
      );
    }
  };

  // UI CALLBACKS

  const _openFullProfile = () => {
    const params = {
      username,
      reputation: user ? user.reputation : null,
    };

    RootNavigation.navigate({
      name: ROUTES.SCREENS.PROFILE,
      params,
      key: username,
    });

    if (onClose) {
      onClose();
    }
  };

  // extract prop values
  let _votingPower = '';
  let _resourceCredits = '';
  let _followerCount = 0;
  let _followingCount = 0;
  let _postCount = 0;
  let _about = '';
  let _reputation = 0;
  let _createdData = null;

  if (isProfileLoaded) {
    _votingPower = getVotingPower(user).toFixed(1);
    _resourceCredits = getRcPower(user).toFixed(0);
    _postCount = user.post_count || 0;
    _about = user.about?.profile?.about || '';
    _reputation = parseReputation(user.reputation);
    _createdData = getTimeFromNowNative(user.created);

    if (follows) {
      _followerCount = follows.follower_count || 0;
      _followingCount = follows.following_count || 0;
    }
  }

  const statsData1 = [
    { label: intl.formatMessage({ id: 'profile.follower' }), value: _followerCount },
    { label: intl.formatMessage({ id: 'profile.following' }), value: _followingCount },
    { label: intl.formatMessage({ id: 'profile.post' }), value: _postCount },
  ] as StatsItem[];

  const statsData2 = [
    {
      label: intl.formatMessage({ id: 'profile.resource_credits' }),
      value: _resourceCredits,
      suffix: '%',
    },
    { label: intl.formatMessage({ id: 'profile.reputation' }), value: _reputation },
  ] as StatsItem[];

  const _modaStyle = {
    ...styles.modalStyle,
    marginBottom: !insets.bottom && 16,
  };

  return (
    <View style={_modaStyle}>
      <ProfileBasic
        username={username}
        about={_about}
        created={_createdData}
        votingPower={_votingPower}
        isLoading={isLoading}
        onPress={_openFullProfile}
      />
      <StatsPanel style={styles.statsPanel} data={statsData1} intermediate={!isProfileLoaded} />
      <StatsPanel style={styles.statsPanel} data={statsData2} intermediate={!isProfileLoaded} />
      <MainButton
        style={styles.button}
        text={intl.formatMessage({ id: 'profile.view_full' })}
        onPress={_openFullProfile}
      />
      {isLoggedIn && (
        <ActionPanel
          isFollowing={isFollowing}
          isFavourite={isFavourite}
          isMuted={isMuted}
          isLoading={isLoading}
          onFavouritePress={_onFavouritePress}
          onFollowPress={_onFollowPress}
        />
      )}
    </View>
  );
};
