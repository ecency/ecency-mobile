import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { View, Alert } from 'react-native';
import { StatsItem } from 'components/statsPanel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import {
  getFollowCountQueryOptions,
  getAccountFullQueryOptions,
  getRelationshipBetweenAccountsQueryOptions,
  getAccountRcQueryOptions,
  checkFavoriteQueryOptions,
} from '@ecency/sdk';
import { useQueryClient } from '@tanstack/react-query';
import { MainButton, StatsPanel } from '../../..';
import {
  useAddFavouriteMutation,
  useDeleteFavouriteMutation,
} from '../../../../providers/queries/bookmarkQueries';
import { getDigitPinCode } from '../../../../providers/hive/hive';
import { useFollowMutation, useUnfollowMutation } from '../../../../providers/sdk/mutations';
import { decryptKey } from '../../../../utils/crypto';
import { getRcPower, getVotingPower } from '../../../../utils/manaBar';
import styles from './quickProfileStyles';
import { ProfileBasic } from './profileBasic';
import { parseReputation } from '../../../../utils/user';
import { default as ROUTES } from '../../../../constants/routeNames';
import { ActionPanel } from './actionPanel';
import { getTimeFromNowNative } from '../../../../utils/time';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { selectCurrentAccount, selectPin, selectIsLoggedIn } from '../../../../redux/selectors';
import { toastNotification } from '../../../../redux/actions/uiAction';
import RootNavigation from '../../../../navigation/rootNavigation';
import { startMattermostDirectMessage } from '../../../../providers/chat/mattermost';

interface QuickProfileContentProps {
  username: string;
  onClose: () => void;
}

export const QuickProfileContent = ({ username, onClose }: QuickProfileContentProps) => {
  const intl = useIntl();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinCode = useAppSelector(selectPin);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const addFavouriteMutation = useAddFavouriteMutation();
  const deleteFavouriteMutation = useDeleteFavouriteMutation();
  const followMutation = useFollowMutation();
  const unfollowMutation = useUnfollowMutation();

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [follows, setFollows] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [rcAccount, setRcAccount] = useState(null);

  const isOwnProfile = currentAccount && currentAccount.name === username;
  const currentAccountName = currentAccount ? currentAccount.name : null;
  const isProfileLoaded = !!(user && follows);

  useEffect(() => {
    if (username) {
      // Clear stale data first to prevent showing previous profile during fetch
      setUser(null);
      setRcAccount(null);
      setFollows(null);
      setIsFollowing(false);
      setIsMuted(false);
      setIsFavourite(false);

      // Then fetch new data
      setIsLoading(true);
      (async () => {
        try {
          await Promise.all([_fetchUser(), _fetchExtraUserData()]);
        } catch (error) {
          // Errors are handled within individual functions
          console.warn('Error fetching profile data:', error);
        } finally {
          setIsLoading(false);
        }
      })();
    } else {
      setUser(null);
      setRcAccount(null);
    }
  }, [username]);

  // NETWORK CALLS
  const _fetchUser = async () => {
    try {
      const _user = await queryClient.fetchQuery(getAccountFullQueryOptions(username));
      setUser(_user);
      try {
        const rcResult = await queryClient.fetchQuery(getAccountRcQueryOptions(username));
        // SDK may return array or single object
        setRcAccount(Array.isArray(rcResult) ? rcResult[0] ?? null : rcResult ?? null);
      } catch (error) {
        setRcAccount(null);
      }
    } catch (error) {
      setUser(null);
    }
  };

  const _fetchExtraUserData = async () => {
    try {
      if (username) {
        let _isFollowing = false;
        let _isMuted = false;
        let _isFavourite = false;
        let follows;

        if (!isOwnProfile) {
          if (currentAccountName) {
            const res = await queryClient.fetchQuery(
              getRelationshipBetweenAccountsQueryOptions(currentAccountName, username),
            );
            _isFollowing = res && res.follows;
            _isMuted = res && res.ignores;

            // Check if user is favorited using SDK query
            const accessToken =
              currentAccount?.local?.accessToken && pinCode
                ? decryptKey(currentAccount.local.accessToken, getDigitPinCode(pinCode))
                : undefined;

            if (accessToken) {
              _isFavourite = Boolean(
                await queryClient.fetchQuery(
                  checkFavoriteQueryOptions(currentAccountName, accessToken, username),
                ),
              );
            }
          } else {
            _isFollowing = false;
            _isMuted = false;
            _isFavourite = false;
          }
        }

        try {
          // Fetch follow counts using SDK query
          follows = await queryClient.fetchQuery(getFollowCountQueryOptions(username));
        } catch (err) {
          follows = null;
        }

        setFollows(follows);
        setIsFollowing(_isFollowing);
        setIsMuted(_isMuted);
        setIsFavourite(_isFavourite);
      }
    } catch (error) {
      console.warn('Failed to fetch complete profile data', error);
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        error.message || error.toString(),
      );
    }
  };

  const _onFollowPress = async () => {
    const shouldUnfollow = isFollowing;
    try {
      setIsLoading(true);
      if (shouldUnfollow) {
        await unfollowMutation.mutateAsync({ following: username });
      } else {
        await followMutation.mutateAsync({ following: username });
      }

      setIsFollowing((prev) => !prev);
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: shouldUnfollow ? 'alert.success_unfollow' : 'alert.success_follow',
          }),
        ),
      );
    } catch (err) {
      console.warn('Failed to follow user', err);
      Sentry.captureException(err);
      Alert.alert(intl.formatMessage({ id: 'alert.fail' }), err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const _onFavouritePress = () => {
    setIsLoading(true);

    const mutation = isFavourite ? deleteFavouriteMutation : addFavouriteMutation;

    mutation.mutate(username, {
      onSuccess: () => {
        // Toast is already dispatched by the mutation hook
        setIsFavourite(!isFavourite);
        setIsLoading(false);
      },
      onError: (error: any) => {
        // Error toast is already dispatched by the mutation hook
        console.warn('Failed to perform favorite action', error);
        setIsLoading(false);
        Alert.alert(
          intl.formatMessage({
            id: 'alert.fail',
          }),
          error.message || error.toString(),
        );
      },
    });
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

  const _handleMessage = async () => {
    try {
      if (!currentAccount?.name) {
        return;
      }

      const dmChannel = await startMattermostDirectMessage(username);

      if (!dmChannel.channelId) {
        throw new Error('User has not joined chats');
      }

      if (onClose) {
        onClose();
      }

      RootNavigation.navigate({
        name: ROUTES.SCREENS.CHAT_THREAD,
        params: {
          channelId: dmChannel.channelId,
          channelName: username,
          bootstrapResult: null,
        },
      });
    } catch (error) {
      if (onClose) {
        onClose();
      }
      dispatch(
        toastNotification(
          intl.formatMessage({ id: 'chats.dm_error', defaultMessage: 'User has not joined chats' }),
        ),
      );
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
    _resourceCredits = getRcPower(rcAccount || user).toFixed(0);
    _postCount = user.post_count || 0;
    _about = user.profile?.about || '';
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
          onMessagePress={_handleMessage}
        />
      )}
    </View>
  );
};
