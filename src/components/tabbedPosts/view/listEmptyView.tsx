import React, {useEffect, useState} from 'react';
import { useIntl } from 'react-intl';
import { get } from 'lodash';
import { Text, View, FlatList } from 'react-native';
import { NoPost, PostCardPlaceHolder, UserListItem } from '../..';
import globalStyles from '../../../globalStyles';
import { CommunityListItem, EmptyScreen } from '../../basicUIElements';
import styles from './tabbedPostsStyles';
import { default as ROUTES } from '../../../constants/routeNames';
import { withNavigation } from 'react-navigation';
import {useSelector, useDispatch } from 'react-redux';
import { fetchCommunities, fetchSubscribedCommunities, leaveCommunity, subscribeCommunity } from '../../../redux/actions/communitiesAction';
import { fetchLeaderboard, followUser, unfollowUser } from '../../../redux/actions/userAction';
import { getCommunity } from '../../../providers/hive/dhive';
import { Community, CommunityCacheObject } from '../../../redux/reducers/cacheReducer';
import { RootState } from '../../../redux/store/store';
import { updateCommunitiesSubscription } from '../../../redux/actions/cacheActions';

interface TabEmptyViewProps {
  filterKey:string,
  isNoPost:boolean,
  navigation:any,
}

const TabEmptyView = ({
  filterKey,
  isNoPost,
  navigation,
}: TabEmptyViewProps) => {

  const intl = useIntl();
  const dispatch = useDispatch();

  const [recommendedCommunities, setRecommendedCommunities] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [isLoadingSubscribeButton, setIsLoadingSubscribeButton] = useState(false);
  const [subscribingItem, setSubscribingItem] = useState<Community | null>(null);

  //redux properties
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);  
  const followingUsers = useSelector((state) => state.user.followingUsersInFeedScreen);
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const pinCode = useSelector((state) => state.application.pin);
  const leaderboard = useSelector((state) => state.user.leaderboard);
  const communitiesCache: CommunityCacheObject = useSelector((state: RootState) => state.cache.communities);

  //hooks

  useEffect(()=>{
    if (isNoPost) {
      if (filterKey === 'friends') {
        if (recommendedUsers.length === 0) {
          _getRecommendedUsers();
        }
      } else if(filterKey === 'communities') {
        if (communitiesCache.discoverCommunities.length === 0) {
          _getRecommendedCommunities();
        }
      }
    }
  }, [isNoPost])


  useEffect(() => {
    const {loading, error, data} = leaderboard;
    if (!loading) {
      if (!error && data && data.length > 0) {
        _formatRecommendedUsers(data);
      }
    }
  }, [leaderboard]);

  useEffect(() => {
    if (communitiesCache.discoverCommunities && communitiesCache.discoverCommunities.length > 0) {
      _formatRecommendedCommunities(communitiesCache.discoverCommunities);
    }
  }, [communitiesCache.discoverCommunities]);

  useEffect(() => {
    if(communitiesCache.subscribingCommunity){
      setIsLoadingSubscribeButton(true);
    }
  },[communitiesCache.subscribingCommunity]);

  // used this hack to solve the glitch in join/leave button caused due to delay in state change
  useEffect(() => {
    if(recommendedCommunities && recommendedCommunities.length > 0){
      setIsLoadingSubscribeButton(false);
    }
  },[recommendedCommunities])

  useEffect(() => {
    const recommendeds = [...recommendedUsers];

    Object.keys(followingUsers).map((following) => {
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
  

  //fetching
  const _getRecommendedUsers = () => dispatch(fetchLeaderboard());
  const _getRecommendedCommunities = () => dispatch(fetchSubscribedCommunities(currentAccount.username));

  //formating 
  const _formatRecommendedCommunities = async (communitiesArray) => {
    try {
      const ecency = await getCommunity('hive-125125');
      Object.assign(ecency, { isSubscribed: ecency ? communitiesCache.subscribedCommunities.some((subscribedCommunity) => subscribedCommunity.communityId === ecency.name && subscribedCommunity.isSubscribed) : false  })
      const recommendeds = [ecency, ...communitiesArray];

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

  //actions related routines
  const _handleSubscribeCommunityButtonPress = (item: Community) => {
    console.log('item : ', item);
    let successToastText = '';
    let failToastText = '';
    if (!item.isSubscribed) {
      successToastText = intl.formatMessage({
        id: 'alert.success_subscribe',
      });
      failToastText = intl.formatMessage({
        id: 'alert.fail_subscribe',
      });
    } else {
      successToastText = intl.formatMessage({
        id: 'alert.success_leave',
      });
      failToastText = intl.formatMessage({
        id: 'alert.fail_leave',
      });
    }

    const updatedItem = { ...item, isSubscribed: !item.isSubscribed };
    setSubscribingItem(updatedItem);
    dispatch(
      updateCommunitiesSubscription(
        currentAccount,
        pinCode,
        updatedItem,
        successToastText,
        failToastText,
      ),
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
    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  console.log('isLoadingSubscribeButton : ', isLoadingSubscribeButton);
  console.log('recommendedCommunities : ', recommendedCommunities);
  
  
//render related operations
  if ((filterKey === 'feed' || filterKey === 'friends' || filterKey === 'communities') && !isLoggedIn) {
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
                  isLoadingRightAction={
                    followingUsers.hasOwnProperty(item._id) && followingUsers[item._id].loading
                  }
                  onPressRightText={_handleFollowUserButtonPress}
                  handleOnPress={(username) =>
                    navigation.navigate({
                      routeName: ROUTES.SCREENS.PROFILE,
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
                      routeName: ROUTES.SCREENS.COMMUNITY,
                      params: {
                        tag: name,
                      },
                    })
                  }
                  handleSubscribeButtonPress={_handleSubscribeCommunityButtonPress}
                  isSubscribed={item.isSubscribed}
                  isLoadingRightAction={isLoadingSubscribeButton && subscribingItem && subscribingItem.communityId === item.name}
                  subscribingItem={subscribingItem}
                  isLoggedIn={isLoggedIn}
                />
              )}
            />
          </>
        );
    } else {
      return (
        <EmptyScreen style={styles.emptyAnimationContainer} />
      )
    }
  }

  return (
    <View style={styles.placeholderWrapper}>
      <PostCardPlaceHolder />
    </View>
  );
};

export default withNavigation(TabEmptyView);

