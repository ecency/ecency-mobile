import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { get } from 'lodash';
import { Text, View, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NoPost, PostCardPlaceHolder, UserListItem } from '../..';
import globalStyles from '../../../globalStyles';
import { CommunityListItem, EmptyScreen } from '../../basicUIElements';
import styles from './tabbedPostsStyles';
import { default as ROUTES } from '../../../constants/routeNames';
import {
  fetchCommunities,
  leaveCommunity,
  subscribeCommunity,
} from '../../../redux/actions/communitiesAction';
import { fetchLeaderboard, followUser, unfollowUser } from '../../../redux/actions/userAction';
import { getCommunity } from '../../../providers/hive/dhive';
import { toggleAccountsBottomSheet } from '../../../redux/actions/uiAction';

interface TabEmptyViewProps {
  filterKey: string;
  isNoPost: boolean;
}

const TabEmptyView = ({ filterKey, isNoPost }: TabEmptyViewProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // redux properties
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const subscribingCommunities = useSelector(
    (state) => state.communities.subscribingCommunitiesInFeedScreen,
  );
  const isVisibleAccountsBottomSheet = useSelector(
    (state) => state.ui.isVisibleAccountsBottomSheet,
  );
  const prevLoggedInUsers = useSelector((state) => state.account.prevLoggedInUsers);
  const [recommendedCommunities, setRecommendedCommunities] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const followingUsers = useSelector((state) => state.user.followingUsersInFeedScreen);
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const pinCode = useSelector((state) => state.application.pin);

  const leaderboard = useSelector((state) => state.user.leaderboard);
  const communities = useSelector((state) => state.communities.communities);

  // hooks

  useEffect(() => {
    if (isNoPost) {
      if (filterKey === 'friends') {
        if (recommendedUsers.length === 0) {
          _getRecommendedUsers();
        }
      } else if (filterKey === 'communities') {
        if (recommendedCommunities.length === 0) {
          _getRecommendedCommunities();
        }
      }
    }
  }, [isNoPost]);

  useEffect(() => {
    const { loading, error, data } = leaderboard;
    if (!loading) {
      if (!error && data && data.length > 0) {
        _formatRecommendedUsers(data);
      }
    }
  }, [leaderboard]);

  useEffect(() => {
    const { loading, error, data } = communities;
    if (!loading) {
      if (!error && data && data?.length > 0) {
        _formatRecommendedCommunities(data);
      }
    }
  }, [communities]);

  useEffect(() => {
    const recommendeds = [...recommendedCommunities];

    Object.keys(subscribingCommunities).forEach((communityId) => {
      if (!subscribingCommunities[communityId].loading) {
        if (!subscribingCommunities[communityId].error) {
          if (subscribingCommunities[communityId].isSubscribed) {
            recommendeds.forEach((item) => {
              if (item.name === communityId) {
                item.isSubscribed = true;
              }
            });
          } else {
            recommendeds.forEach((item) => {
              if (item.name === communityId) {
                item.isSubscribed = false;
              }
            });
          }
        }
      }
    });

    setRecommendedCommunities(recommendeds);
  }, [subscribingCommunities]);

  useEffect(() => {
    const recommendeds = [...recommendedUsers];

    Object.keys(followingUsers).forEach((following) => {
      if (!followingUsers[following].loading) {
        if (!followingUsers[following].error) {
          if (followingUsers[following].isFollowing) {
            recommendeds.forEach((item) => {
              if (item._id === following) {
                item.isFollowing = true;
              }
            });
          } else {
            recommendeds.forEach((item) => {
              if (item._id === following) {
                item.isFollowing = false;
              }
            });
          }
        }
      }
    });

    setRecommendedUsers(recommendeds);
  }, [followingUsers]);

  // fetching
  const _getRecommendedUsers = () => dispatch(fetchLeaderboard());
  const _getRecommendedCommunities = () => dispatch(fetchCommunities('', 10));

  // formating
  const _formatRecommendedCommunities = async (communitiesArray) => {
    try {
      const ecency = await getCommunity('hive-125125');

      const recommendeds = [ecency, ...communitiesArray];
      recommendeds.forEach((item) => Object.assign(item, { isSubscribed: false }));

      setRecommendedCommunities(recommendeds);
    } catch (err) {
      console.log(err, '_getRecommendedUsers Error');
    }
  };

  const _formatRecommendedUsers = (usersArray) => {
    const recommendeds = usersArray.slice(0, 10);

    recommendeds.unshift({ _id: 'good-karma' });
    recommendeds.unshift({ _id: 'ecency' });

    recommendeds.forEach((item) => Object.assign(item, { isFollowing: false }));

    setRecommendedUsers(recommendeds);
  };

  // actions related routines
  const _handleSubscribeCommunityButtonPress = (data) => {
    let subscribeAction;
    let successToastText = '';
    let failToastText = '';

    if (!data.isSubscribed) {
      subscribeAction = subscribeCommunity;

      successToastText = intl.formatMessage({
        id: 'alert.success_subscribe',
      });
      failToastText = intl.formatMessage({
        id: 'alert.fail_subscribe',
      });
    } else {
      subscribeAction = leaveCommunity;

      successToastText = intl.formatMessage({
        id: 'alert.success_leave',
      });
      failToastText = intl.formatMessage({
        id: 'alert.fail_leave',
      });
    }

    dispatch(
      subscribeAction(currentAccount, pinCode, data, successToastText, failToastText, 'feedScreen'),
    );
  };

  const _handleFollowUserButtonPress = (data, isFollowing) => {
    let followAction;
    let successToastText = '';
    let failToastText = '';

    if (!isFollowing) {
      followAction = followUser;

      successToastText = intl.formatMessage({
        id: 'alert.success_follow',
      });
      failToastText = intl.formatMessage({
        id: 'alert.fail_follow',
      });
    } else {
      followAction = unfollowUser;

      successToastText = intl.formatMessage({
        id: 'alert.success_unfollow',
      });
      failToastText = intl.formatMessage({
        id: 'alert.fail_unfollow',
      });
    }

    data.follower = get(currentAccount, 'name', '');

    dispatch(followAction(currentAccount, pinCode, data, successToastText, failToastText));
  };

  const _handleOnPressLogin = () => {
    // if there is any prevLoggedInUser, show account switch modal
    if (prevLoggedInUsers && prevLoggedInUsers?.length > 0) {
      dispatch(toggleAccountsBottomSheet(!isVisibleAccountsBottomSheet));
    } else {
      navigation.navigate(ROUTES.SCREENS.LOGIN);
    }
  };

  // render related operations
  if (
    (filterKey === 'feed' || filterKey === 'friends' || filterKey === 'communities') &&
    !isLoggedIn
  ) {
    return (
      <NoPost
        imageStyle={styles.noImage}
        isButtonText
        defaultText={intl.formatMessage({
          id: 'profile.login_to_see',
        })}
        handleOnButtonPress={_handleOnPressLogin}
      />
    );
  }

  if (isNoPost) {
    if (filterKey === 'friends') {
      return (
        <>
          <Text style={[globalStyles.subTitle, styles.noPostTitle]}>
            {intl.formatMessage({ id: 'profile.follow_people' })}
          </Text>
          <FlatList
            data={recommendedUsers}
            extraData={recommendedUsers}
            keyExtractor={(item, index) => `${item._id || item.id}${index}`}
            renderItem={({ item, index }) => (
              <UserListItem
                index={index}
                username={item._id}
                isHasRightItem
                rightText={
                  item.isFollowing
                    ? intl.formatMessage({ id: 'user.unfollow' })
                    : intl.formatMessage({ id: 'user.follow' })
                }
                rightTextStyle={[styles.followText, item.isFollowing && styles.unfollowText]}
                isLoggedIn={isLoggedIn}
                isFollowing={item.isFollowing}
                isLoadingRightAction={followingUsers[item._id]?.loading}
                onPressRightText={_handleFollowUserButtonPress}
                handleOnPress={(username) =>
                  navigation.navigate({
                    name: ROUTES.SCREENS.PROFILE,
                    params: {
                      username,
                    },
                    key: username,
                  })
                }
              />
            )}
          />
        </>
      );
    } else if (filterKey === 'communities') {
      return (
        <>
          <Text style={[globalStyles.subTitle, styles.noPostTitle]}>
            {intl.formatMessage({ id: 'profile.follow_communities' })}
          </Text>
          <FlatList
            data={recommendedCommunities}
            keyExtractor={(item, index) => `${item.id || item.title}${index}`}
            renderItem={({ item, index }) => (
              <CommunityListItem
                index={index}
                title={item.title}
                about={item.about}
                admins={item.admins}
                id={item.id}
                authors={item.num_authors}
                posts={item.num_pending}
                subscribers={item.subscribers}
                isNsfw={item.is_nsfw}
                name={item.name}
                handleOnPress={(name) =>
                  navigation.navigate({
                    name: ROUTES.SCREENS.COMMUNITY,
                    params: {
                      tag: name,
                    },
                  })
                }
                handleSubscribeButtonPress={_handleSubscribeCommunityButtonPress}
                isSubscribed={item.isSubscribed}
                isLoadingRightAction={subscribingCommunities[item.name]?.loading}
                isLoggedIn={isLoggedIn}
              />
            )}
          />
        </>
      );
    } else {
      return <EmptyScreen style={styles.emptyAnimationContainer} />;
    }
  }

  return (
    <View style={styles.placeholderWrapper}>
      <PostCardPlaceHolder />
    </View>
  );
};

export default TabEmptyView;
