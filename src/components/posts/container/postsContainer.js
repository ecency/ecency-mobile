import React, { useState, useEffect, useRef, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get, isEmpty } from 'lodash';
import unionBy from 'lodash/unionBy';
import Matomo from 'react-native-matomo-sdk';
import { useIntl } from 'react-intl';
import { Alert } from 'react-native';

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
import {
  setFeedPosts,
  filterSelected,
  setOtherPosts,
  setInitPosts,
  resetLocalVoteMap,
} from '../../../redux/actions/postsAction';
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
  isFeedScreen = false,
}) => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const nsfw = useSelector((state) => state.application.nsfw);
  const initPosts = useSelector((state) => state.posts.initPosts);
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
  // const [posts, setPosts] = useState(isConnected ? [] : feedPosts);
  const [isNoPost, setIsNoPost] = useState(false);
  const [sessionUser, setSessionUser] = useState(username);
  const [promotedPosts, setPromotedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const _resetLocalVoteMap = () => {
    dispatch(resetLocalVoteMap());
  };

  const _setFeedPosts = (_posts, scrollPos = 0) => {
    if (isFeedScreen) {
      dispatch(setFeedPosts(_posts, scrollPos));
    } else {
      dispatch(setOtherPosts(_posts, scrollPos));
    }
  };

  const _setInitPosts = (_posts) => {
    if (isFeedScreen) {
      dispatch(setInitPosts(_posts));
    }
  };

  const initCacheState = () => {
    const cachedData = {};

    filterOptionsValue.forEach((option) => {
      if (option !== 'feed') {
        cachedData[option] = {
          posts: [],
          startAuthor: '',
          startPermlink: '',
          isLoading: false,
          scrollPosition: 0,
        };
      }
    });

    if (feedSubfilterOptions) {
      feedSubfilterOptions.forEach((option) => {
        cachedData[option] = {
          posts: [],
          startAuthor: '',
          startPermlink: '',
          isLoading: false,
        };
      });
    }

    return {
      isFeedScreen,
      currentFilter: selectedFilterValue,
      currentSubFilter: selectedFeedSubfilterValue,
      cachedData,
    };
  };

  const cacheReducer = (state, action) => {
    console.log('reducer action:', state, action);

    switch (action.type) {
      case 'is-filter-loading': {
        const filter = action.payload.filter;
        const loading = action.payload.isLoading;
        state.cachedData[filter].isLoading = loading;
        console.log('New state:', state);
        return state;
      }

      case 'update-filter-cache': {
        const filter = action.payload.filter;
        const nextPosts = action.payload.posts;
        let _posts = nextPosts;

        const cachedEntry = state.cachedData[filter];
        if (!cachedEntry) {
          throw new Error('No cached entry available');
        }

        const prevPosts = cachedEntry.posts;

        if (prevPosts.length > 0) {
          if (refreshing) {
            _posts = unionBy(_posts, prevPosts, 'permlink');
          } else {
            _posts = unionBy(prevPosts, _posts, 'permlink');
          }
        }
        //cache latest posts for main tab for returning user
        else if (
          isFeedScreen &&
          filter == (get(currentAccount, 'name', null) == null ? 'hot' : 'friends')
        ) {
          _setInitPosts(nextPosts);
        }

        //if (!refreshing) {
        cachedEntry.startAuthor = _posts[_posts.length - 1] && _posts[_posts.length - 1].author;
        cachedEntry.startPermlink = _posts[_posts.length - 1] && _posts[_posts.length - 1].permlink;
        cachedEntry.posts = _posts;

        state.cachedData[filter] = cachedEntry;
        console.log('New state:', state);

        //dispatch to redux
        if (
          filter === (state.currentFilter !== 'feed' ? state.currentFilter : state.currentSubFilter)
        ) {
          _setFeedPosts(_posts);
        }
        return state;
      }

      case 'reset-cur-filter-cache': {
        const filter = state.currentFilter == 'feed' ? state.currentSubFilter : state.currentFilter;
        const cachedEntry = state.cachedData[filter];
        if (!cachedEntry) {
          throw new Error('No cached entry available');
        }
        cachedEntry.startAuthor = '';
        cachedEntry.startPermlink = '';
        cachedEntry.posts = [];

        state.cachedData[filter] = cachedEntry;
        console.log('New state:', state);

        //dispatch to redux
        _setFeedPosts([]);

        return state;
      }

      case 'change-filter': {
        const filter = action.payload.currentFilter;
        state.currentFilter = filter;
        console.log('New state:', state);

        const data = state.cachedData[filter !== 'feed' ? filter : state.currentSubFilter];
        _setFeedPosts(data.posts, data.scrollPosition);

        return state;
      }

      case 'change-sub-filter': {
        const filter = action.payload.currentSubFilter;
        state.currentSubFilter = filter;
        console.log('New state:', state);
        //dispatch to redux;
        const data = state.cachedData[filter];
        _setFeedPosts(data.posts, data.scrollPosition);
        return state;
      }

      case 'scroll-position-change': {
        const scrollPosition = action.payload.scrollPosition || 0;
        const filter = state.currentFilter;
        const subFilter = state.currentSubFilter;

        const cacheFilter = filter !== 'feed' ? filter : subFilter;

        state.cachedData[cacheFilter].scrollPosition = scrollPosition;
        return state;
      }

      case 'reset-cache': {
        //dispatch to redux
        _setFeedPosts([]);
        _setInitPosts([]);

        return initCacheState();
      }

      default:
        return state;
    }
  };

  const [cache, cacheDispatch] = useReducer(cacheReducer, {}, initCacheState);

  const elem = useRef(null);
  const isMountedRef = useIsMountedRef();

  useEffect(() => {
    if (isFeedScreen) {
      _setFeedPosts(initPosts);
      _resetLocalVoteMap();
    } else {
      _setFeedPosts([]);
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      if (username !== sessionUser) {
        cacheDispatch({
          type: 'reset-cache',
        });
        setSessionUser(username);
      }

      _loadPosts();
      _getPromotePosts();
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
      cacheDispatch({
        type: 'reset-cur-filter-cache',
      });

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
    feedUsername,
    forceLoadPost,
    selectedOptionIndex,
    selectedFeedSubfilterIndex,
  ]);

  useEffect(() => {
    let filter = selectedFilterValue == 'feed' ? selectedFeedSubfilterValue : selectedFilterValue;
    const sAuthor = cache.cachedData[filter].startAuthor;
    const sPermlink = cache.cachedData[filter].startPermlink;

    if (!sAuthor && !sPermlink) {
      _loadPosts(selectedFilterValue);
    }
  }, [_loadPosts, selectedFilterValue]);

  useEffect(() => {
    if (refreshing) {
      cacheDispatch({
        type: 'reset-cur-filter-cache',
      });
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
      if (!communities.error && communities.data?.length > 0) {
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

  const _loadPosts = async (type) => {
    const filter = type || selectedFilterValue;
    const reducerFilter = filter !== 'feed' ? filter : selectedFeedSubfilterValue;

    const isFilterLoading = cache.cachedData[reducerFilter].isLoading;
    if (
      isFilterLoading ||
      // isLoading ||
      !isConnected ||
      (!isLoggedIn && type === 'feed') ||
      (!isLoggedIn && type === 'blog')
    ) {
      return;
    }

    setIsLoading(true);

    if (!isConnected && (refreshing || isFilterLoading)) {
      setRefreshing(false);
      setIsLoading(false);
      return;
    }

    cacheDispatch({
      type: 'is-filter-loading',
      payload: {
        filter: reducerFilter,
        isLoading: true,
      },
    });

    const subfilter = selectedFeedSubfilterValue;
    let options = {};
    const limit = 5;
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

    const sAuthor = cache.cachedData[reducerFilter].startAuthor;
    const sPermlink = cache.cachedData[reducerFilter].startPermlink;
    if (sAuthor && sPermlink && !refreshing) {
      options.start_author = sAuthor;
      options.start_permlink = sPermlink;
    }

    try {
      const result = await func(options, username, nsfw);

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
            cacheDispatch({
              type: 'update-filter-cache',
              payload: {
                filter: reducerFilter,
                posts: _posts,
              },
            });
          }
        } else if (result.length === 0) {
          setIsNoPost(true);
        }

        setRefreshing(false);
        setIsLoading(false);
        cacheDispatch({
          type: 'is-filter-loading',
          payload: {
            filter: reducerFilter,
            isLoading: false,
          },
        });
      }
    } catch (err) {
      setRefreshing(false);
      setIsLoading(false);
      cacheDispatch({
        type: 'is-filter-loading',
        payload: {
          filter: reducerFilter,
          isLoading: false,
        },
      });
    }

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
    setIsNoPost(false);
  };

  const _handleFeedSubfilterOnDropdownSelect = (index) => {
    setSelectedFeedSubfilterIndex(index);
    setIsNoPost(false);
  };

  const _setSelectedFilterValue = (val) => {
    setSelectedFilterValue(val);
    cacheDispatch({
      type: 'change-filter',
      payload: {
        currentFilter: val,
      },
    });
  };

  const _setSelectedFeedSubfilterValue = (val) => {
    setSelectedFeedSubfilterValue(val);
    cacheDispatch({
      type: 'change-sub-filter',
      payload: {
        currentSubFilter: val,
      },
    });
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

    dispatch(
      subscribeAction(currentAccount, pinCode, data, successToastText, failToastText, 'feedScreen'),
    );
  };

  const _handleOnScroll = (event) => {
    if (handleOnScroll) {
      handleOnScroll();
    }

    //memorize filter position
    const scrollPosition = event.nativeEvent.contentOffset.y;
    cacheDispatch({
      type: 'scroll-position-change',
      payload: {
        scrollPosition,
      },
    });
  };

  return (
    <PostsView
      ref={elem}
      filterOptions={filterOptions}
      handleImagesHide={_handleImagesHide}
      handleOnScroll={_handleOnScroll}
      isHideImage={isHideImages}
      isLoggedIn={isLoggedIn}
      isAnalytics={isAnalytics}
      selectedOptionIndex={selectedOptionIndex}
      tag={tag}
      filterOptionsValue={filterOptionsValue}
      isLoading={isLoading}
      refreshing={refreshing}
      selectedFilterIndex={selectedFilterIndex}
      isNoPost={isNoPost}
      promotedPosts={promotedPosts}
      selectedFilterValue={selectedFilterValue}
      setSelectedFilterValue={_setSelectedFilterValue}
      handleFilterOnDropdownSelect={_handleFilterOnDropdownSelect}
      loadPosts={_loadPosts}
      handleOnRefreshPosts={_handleOnRefreshPosts}
      feedSubfilterOptions={feedSubfilterOptions}
      selectedFeedSubfilterIndex={selectedFeedSubfilterIndex}
      feedSubfilterOptionsValue={feedSubfilterOptionsValue}
      handleFeedSubfilterOnDropdownSelect={_handleFeedSubfilterOnDropdownSelect}
      setSelectedFeedSubfilterValue={_setSelectedFeedSubfilterValue}
      selectedFeedSubfilterValue={selectedFeedSubfilterValue}
      getRecommendedUsers={_getRecommendedUsers}
      getRecommendedCommunities={_getRecommendedCommunities}
      recommendedUsers={recommendedUsers}
      recommendedCommunities={recommendedCommunities}
      handleFollowUserButtonPress={_handleFollowUserButtonPress}
      handleSubscribeCommunityButtonPress={_handleSubscribeCommunityButtonPress}
      followingUsers={followingUsers}
      subscribingCommunities={subscribingCommunities}
      isFeedScreen={isFeedScreen}
    />
  );
};

export default PostsContainer;
