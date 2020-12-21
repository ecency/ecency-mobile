import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get, isEmpty } from 'lodash';
import unionBy from 'lodash/unionBy';
import Matomo from 'react-native-matomo-sdk';
import { useIntl } from 'react-intl';

// HIVE
import {
  getAccountPosts,
  getPost,
  getRankedPosts,
  getCommunity,
} from '../../../providers/hive/dhive';
import { getPromotePosts } from '../../../providers/ecency/ecency';

// Component
import PostsView from '../view/postsView';

// Actions
import { setFeedPosts } from '../../../redux/actions/postsAction';
import { hidePostsThumbnails } from '../../../redux/actions/uiAction';
import { fetchLeaderboard, followUser, unfollowUser } from '../../../redux/actions/userAction';
import {
  subscribeCommunity,
  leaveCommunity,
  fetchCommunities,
} from '../../../redux/actions/communitiesAction';

import useIsMountedRef from '../../../customHooks/useIsMountedRef';

const PostsContainer = ({
  changeForceLoadPostState,
  filterOptions,
  forceLoadPost,
  getFor,
  handleOnScroll,
  pageType,
  selectedOptionIndex,
  tag,
  filterOptionsValue,
  feedUsername,
  feedSubfilterOptions,
  feedSubfilterOptionsValue,
}) => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const nsfw = useSelector((state) => state.application.nsfw);
  const feedPosts = useSelector((state) => state.posts.feedPosts);
  const isConnected = useSelector((state) => state.application.isConnected);
  const isHideImages = useSelector((state) => state.ui.hidePostsThumbnails);
  const username = useSelector((state) => state.account.currentAccount.name);
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const isAnalytics = useSelector((state) => state.application.isAnalytics);
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const pinCode = useSelector((state) => state.application.pin);
  const leaderboard = useSelector((state) => state.user.leaderboard);
  const communities = useSelector((state) => state.communities.communities);
  const followingUsers = useSelector((state) => state.user.followingUsersInFeedScreen);
  const subscribingCommunities = useSelector(
    (state) => state.communities.subscribingCommunitiesInFeedScreen,
  );

  const [isNoPost, setIsNoPost] = useState(false);
  const [startPermlink, setStartPermlink] = useState('');
  const [startAuthor, setStartAuthor] = useState('');
  const [promotedPosts, setPromotedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState(isConnected ? [] : feedPosts);
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(selectedOptionIndex || 0);
  const [selectedFilterValue, setSelectedFilterValue] = useState(
    filterOptionsValue && filterOptionsValue[selectedFilterIndex],
  );
  const [selectedFeedSubfilterIndex, setSelectedFeedSubfilterIndex] = useState(0);
  const [selectedFeedSubfilterValue, setSelectedFeedSubfilterValue] = useState(
    feedSubfilterOptionsValue && feedSubfilterOptions[selectedFeedSubfilterIndex],
  );
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState([]);

  const elem = useRef(null);
  const isMountedRef = useIsMountedRef();

  useEffect(() => {
    if (isConnected) {
      _getPromotePosts();
      _loadPosts();
    }
  }, [
    _getPromotePosts,
    _loadPosts,
    changeForceLoadPostState,
    username,
    forceLoadPost,
    isConnected,
    pageType,
    selectedOptionIndex,
    selectedFeedSubfilterIndex,
  ]);

  useEffect(() => {
    if (forceLoadPost) {
      setPosts([]);
      setStartAuthor('');
      setStartPermlink('');
      setSelectedFilterIndex(selectedOptionIndex || 0);
      isLoggedIn && setSelectedFeedSubfilterIndex(selectedFeedSubfilterIndex || 0);
      setIsNoPost(false);

      _loadPosts();

      if (changeForceLoadPostState) {
        changeForceLoadPostState(false);
      }
    }
  }, [
    _loadPosts,
    changeForceLoadPostState,
    username,
    forceLoadPost,
    selectedOptionIndex,
    selectedFeedSubfilterIndex,
  ]);

  useEffect(() => {
    if (!startAuthor && !startPermlink) {
      _loadPosts(selectedFilterValue);
    }
  }, [_loadPosts, selectedFilterValue]);

  useEffect(() => {
    if (refreshing) {
      _loadPosts();
    }
  }, [refreshing]);

  useEffect(() => {
    if (!leaderboard.loading) {
      if (!leaderboard.error && leaderboard.data.length > 0) {
        _formatRecommendedUsers(leaderboard.data);
      }
    }
  }, [leaderboard]);

  useEffect(() => {
    if (!communities.loading) {
      if (!communities.error && communities.data.length > 0) {
        _formatRecommendedCommunities(communities.data);
      }
    }
  }, [communities]);

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

  useEffect(() => {
    const recommendeds = [...recommendedCommunities];

    Object.keys(subscribingCommunities).map((communityId) => {
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

  const _setFeedPosts = (_posts) => {
    dispatch(setFeedPosts(_posts));
  };

  const _handleImagesHide = () => {
    dispatch(hidePostsThumbnails(!isHideImages));
  };

  const _getPromotePosts = async () => {
    if (pageType === 'profiles') {
      return;
    }
    await getPromotePosts()
      .then(async (res) => {
        if (res && res.length) {
          const _promotedPosts = await Promise.all(
            res.map((item) =>
              getPost(get(item, 'author'), get(item, 'permlink'), username, true).then(
                (post) => post,
              ),
            ),
          );

          if (isMountedRef.current) {
            setPromotedPosts(_promotedPosts);
          }
        }
      })
      .catch(() => {});
  };

  const _loadPosts = (type) => {
    if (
      isLoading ||
      !isConnected ||
      (!isLoggedIn && type === 'feed') ||
      (!isLoggedIn && type === 'blog')
    ) {
      return;
    }
    setIsLoading(true);

    if (!isConnected && (refreshing || isLoading)) {
      setRefreshing(false);
      setIsLoading(false);
      return;
    }

    const filter = type || selectedFilterValue;
    const subfilter = selectedFeedSubfilterValue;
    let options = {};
    const limit = 7;
    let func = null;

    if (
      filter === 'feed' ||
      filter === 'posts' ||
      filter === 'blog' ||
      getFor === 'blog' ||
      filter === 'reblogs'
    ) {
      if (filter === 'feed' && subfilter === 'communities') {
        func = getRankedPosts;
        options = {
          observer: feedUsername,
          sort: 'created',
          tag: 'my',
        };
      } else {
        func = getAccountPosts;
        options = {
          observer: feedUsername || '',
          account: feedUsername,
          limit,
          sort: filter,
        };

        if (pageType === 'profiles' && (filter === 'feed' || filter === 'posts')) {
          options.sort = 'posts';
        }
      }
    } else {
      func = getRankedPosts;
      options = {
        tag,
        limit,
        sort: filter,
      };
    }

    if (startAuthor && startPermlink && !refreshing) {
      options.start_author = startAuthor;
      options.start_permlink = startPermlink;
    }
    func(options, username, nsfw)
      .then((result) => {
        if (isMountedRef.current) {
          if (result.length > 0) {
            let _posts = result;

            if (filter === 'reblogs') {
              for (let i = _posts.length - 1; i >= 0; i--) {
                if (_posts[i].author === username) {
                  _posts.splice(i, 1);
                }
              }
            }
            if (_posts.length > 0) {
              if (posts.length > 0) {
                if (refreshing) {
                  _posts = unionBy(_posts, posts, 'permlink');
                } else {
                  _posts = unionBy(posts, _posts, 'permlink');
                }
              }
              if (posts.length <= 7 && pageType !== 'profiles') {
                _setFeedPosts(_posts);
              }

              //if (!refreshing) {
              setStartAuthor(result[result.length - 1] && result[result.length - 1].author);
              setStartPermlink(result[result.length - 1] && result[result.length - 1].permlink);
              //}
              setPosts(_posts);
            }
          } else if (result.length === 0) {
            setIsNoPost(true);
          }
          setRefreshing(false);
          setIsLoading(false);
        }
      })
      .catch(() => {
        setRefreshing(false);
        setIsLoading(false);
      });
    // track filter and tag views
    if (isAnalytics) {
      if (tag) {
        Matomo.trackView([`/${selectedFilterValue}/${tag}`]).catch((error) =>
          console.warn('Failed to track screen', error),
        );
      } else if (selectedFilterValue === 'feed') {
        Matomo.trackView([`/@${feedUsername}/${selectedFilterValue}`]).catch((error) =>
          console.warn('Failed to track screen', error),
        );
      } else {
        Matomo.trackView([`/${selectedFilterValue}`]).catch((error) =>
          console.warn('Failed to track screen', error),
        );
      }
    }
  };

  const _handleOnRefreshPosts = () => {
    setRefreshing(true);
    _getPromotePosts();
  };

  const _handleFilterOnDropdownSelect = (index) => {
    setSelectedFilterIndex(index);
    setPosts([]);
    setStartPermlink('');
    setStartAuthor('');
    setIsNoPost(false);
  };

  const _handleFeedSubfilterOnDropdownSelect = (index) => {
    setSelectedFeedSubfilterIndex(index);
    setPosts([]);
    setStartPermlink('');
    setStartAuthor('');
    setIsNoPost(false);
  };

  const _getRecommendedUsers = () => dispatch(fetchLeaderboard());

  const _formatRecommendedUsers = (usersArray) => {
    const recommendeds = usersArray.slice(0, 10);

    recommendeds.unshift({ _id: 'good-karma' });
    recommendeds.unshift({ _id: 'ecency' });

    recommendeds.forEach((item) => Object.assign(item, { isFollowing: false }));

    setRecommendedUsers(recommendeds);
  };

  const _getRecommendedCommunities = () => dispatch(fetchCommunities('', 10));

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

    dispatch(subscribeAction(currentAccount, pinCode, data, successToastText, failToastText));
  };
  console.log(followingUsers, 'followingUsers Container');

  return (
    <PostsView
      ref={elem}
      filterOptions={filterOptions}
      handleImagesHide={_handleImagesHide}
      handleOnScroll={handleOnScroll}
      isHideImage={isHideImages}
      isLoggedIn={isLoggedIn}
      isAnalytics={isAnalytics}
      selectedOptionIndex={selectedOptionIndex}
      tag={tag}
      filterOptionsValue={filterOptionsValue}
      posts={posts}
      isLoading={isLoading}
      refreshing={refreshing}
      selectedFilterIndex={selectedFilterIndex}
      isNoPost={isNoPost}
      promotedPosts={promotedPosts}
      selectedFilterValue={selectedFilterValue}
      setSelectedFilterValue={setSelectedFilterValue}
      handleFilterOnDropdownSelect={_handleFilterOnDropdownSelect}
      loadPosts={_loadPosts}
      handleOnRefreshPosts={_handleOnRefreshPosts}
      feedSubfilterOptions={feedSubfilterOptions}
      selectedFeedSubfilterIndex={selectedFeedSubfilterIndex}
      feedSubfilterOptionsValue={feedSubfilterOptionsValue}
      handleFeedSubfilterOnDropdownSelect={_handleFeedSubfilterOnDropdownSelect}
      setSelectedFeedSubfilterValue={setSelectedFeedSubfilterValue}
      selectedFeedSubfilterValue={selectedFeedSubfilterValue}
      getRecommendedUsers={_getRecommendedUsers}
      getRecommendedCommunities={_getRecommendedCommunities}
      recommendedUsers={recommendedUsers}
      recommendedCommunities={recommendedCommunities}
      handleFollowUserButtonPress={_handleFollowUserButtonPress}
      handleSubscribeCommunityButtonPress={_handleSubscribeCommunityButtonPress}
      followingUsers={followingUsers}
      subscribingCommunities={subscribingCommunities}
    />
  );
};

export default PostsContainer;
