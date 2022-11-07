import React, { useState, useEffect, useRef, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get, isEmpty } from 'lodash';
import unionBy from 'lodash/unionBy';
import { useIntl } from 'react-intl';
import { Alert, AppState } from 'react-native';

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
} from '../../../redux/actions/postsAction';
import { fetchLeaderboard, followUser, unfollowUser } from '../../../redux/actions/userAction';
import {
  subscribeCommunity,
  leaveCommunity,
  fetchCommunities,
} from '../../../redux/actions/communitiesAction';

import useIsMountedRef from '../../../customHooks/useIsMountedRef';
import { setHidePostsThumbnails } from '../../../redux/actions/applicationActions';

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
  let _postFetchTimer = null;

  const appState = useRef(AppState.currentState);
  const appStateSubRef = useRef(null);

  const nsfw = useSelector((state) => state.application.nsfw);
  const initPosts = useSelector((state) => state.posts.initPosts);
  const isConnected = useSelector((state) => state.application.isConnected);
  const isHideImages = useSelector((state) => state.application.hidePostsThumbnails);
  const username = useSelector((state) => state.account.currentAccount.name);
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const pinCode = useSelector((state) => state.application.pin);
  const leaderboard = useSelector((state) => state.user.leaderboard);
  const communities = useSelector((state) => state.communities.communities);
  const followingUsers = useSelector((state) => state.user.followingUsersInFeedScreen);
  const subscribingCommunities = useSelector(
    (state) => state.communities.subscribingCommunitiesInFeedScreen,
  );

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
  const [newPostsPopupPictures, setNewPostsPopupPictures] = useState(null);

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

  const _scheduleLatestPostsCheck = (firstPost) => {
    const refetchTime = __DEV__ ? 50000 : 600000;
    if (_postFetchTimer) {
      clearTimeout(_postFetchTimer);
    }
    if (!firstPost) {
      return;
    }

    // schedules refresh 30 minutes after last post creation time
    const currentTime = new Date().getTime();
    const createdAt = new Date(get(firstPost, 'created')).getTime();

    const timeSpent = currentTime - createdAt;
    let timeLeft = refetchTime - timeSpent;
    if (timeLeft < 0) {
      timeLeft = refetchTime;
    }

    _postFetchTimer = setTimeout(() => {
      const isLatestPostsCheck = true;
      _loadPosts(null, isLatestPostsCheck);
    }, timeLeft);
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
    console.log('reducer action:', action);

    switch (action.type) {
      case 'is-filter-loading': {
        const { filter } = action.payload;
        const loading = action.payload.isLoading;
        state.cachedData[filter].isLoading = loading;

        return state;
      }

      case 'update-filter-cache': {
        const { filter } = action.payload;
        const nextPosts = action.payload.posts;
        const { shouldReset } = action.payload;
        let _posts = nextPosts;

        const cachedEntry = state.cachedData[filter];
        if (!cachedEntry) {
          throw new Error('No cached entry available');
        }

        const prevPosts = cachedEntry.posts;

        if (prevPosts.length > 0 && !shouldReset) {
          if (refreshing) {
            _posts = unionBy(_posts, prevPosts, 'permlink');
          } else {
            _posts = unionBy(prevPosts, _posts, 'permlink');
          }
        }
        // cache latest posts for main tab for returning user
        else if (isFeedScreen) {
          // schedule refetch of new posts by checking time of current post
          _scheduleLatestPostsCheck(nextPosts[0]);

          if (filter == (get(currentAccount, 'name', null) == null ? 'hot' : 'friends')) {
            _setInitPosts(nextPosts);
          }
        }

        // update stat
        cachedEntry.startAuthor = _posts[_posts.length - 1] && _posts[_posts.length - 1].author;
        cachedEntry.startPermlink = _posts[_posts.length - 1] && _posts[_posts.length - 1].permlink;
        cachedEntry.posts = _posts;

        state.cachedData[filter] = cachedEntry;

        // dispatch to redux
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

        // dispatch to redux
        _setFeedPosts([]);

        return state;
      }

      case 'change-filter': {
        const filter = action.payload.currentFilter;
        state.currentFilter = filter;

        const data = state.cachedData[filter !== 'feed' ? filter : state.currentSubFilter];
        _setFeedPosts(data.posts, data.scrollPosition);

        if (filter !== 'feed' && isFeedScreen) {
          _scheduleLatestPostsCheck(data.posts[0]);
          setNewPostsPopupPictures(null);
        }

        return state;
      }

      case 'change-sub-filter': {
        const filter = action.payload.currentSubFilter;
        state.currentSubFilter = filter;

        // dispatch to redux;
        const data = state.cachedData[filter];
        _setFeedPosts(data.posts, data.scrollPosition);
        if (isFeedScreen) {
          _scheduleLatestPostsCheck(data.posts[0]);
          setNewPostsPopupPictures(null);
        }
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
        // dispatch to redux
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
    let appStateSub;
    if (isFeedScreen) {
      appStateSub = AppState.addEventListener('change', _handleAppStateChange);
      _setFeedPosts(initPosts || []);
    } else {
      _setFeedPosts([]);
    }

    return () => {
      if (_postFetchTimer) {
        clearTimeout(_postFetchTimer);
      }
      if (isFeedScreen && appStateSub) {
        appStateSub.remove();
      }
    };
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

      setNewPostsPopupPictures(null);
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
    const filter = selectedFilterValue == 'feed' ? selectedFeedSubfilterValue : selectedFilterValue;
    const sAuthor = cache.cachedData[filter].startAuthor;
    const sPermlink = cache.cachedData[filter].startPermlink;

    if (!sAuthor && !sPermlink) {
      _loadPosts(selectedFilterValue);
    }
  }, [_loadPosts, selectedFilterValue]);

  useEffect(() => {
    if (refreshing) {
      cacheDispatch({
        type: 'scroll-position-change',
        payload: {
          scrollPosition: 0,
        },
      });
      setNewPostsPopupPictures(null);
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

  const _handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      const isLatestPostsCheck = true;
      _loadPosts(null, isLatestPostsCheck);
    }

    appState.current = nextAppState;
    console.log('AppState', appState.current);
  };

  const _handleImagesHide = () => {
    dispatch(setHidePostsThumbnails(!isHideImages));
  };

  const _getPromotePosts = async () => {
    if (pageType === 'profile' || pageType === 'ownProfile') {
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

  const _matchFreshPosts = async (posts, reducerFilter) => {
    const cachedPosts = cache.cachedData[reducerFilter].posts.slice(0, 5);

    let newPosts = [];
    posts.forEach((post, index) => {
      const newPostId = get(post, 'post_id');
      const postExist = cachedPosts.find((cPost) => get(cPost, 'post_id', 0) === newPostId);

      if (!postExist) {
        newPosts.push(post);
      }
    });

    const isRightFilter =
      cache.currentFilter === 'feed'
        ? cache.currentSubFilter === reducerFilter
        : cache.currentFilter === reducerFilter;

    if (newPosts.length > 0 && isRightFilter) {
      newPosts = newPosts.slice(0, 5);

      setNewPostsPopupPictures(newPosts.map((post) => get(post, 'avatar', '')));
    } else {
      _scheduleLatestPostsCheck(posts[0]);
    }
  };

  const _loadPosts = async (type, isLatestPostCheck = false) => {
    const filter = type || cache.currentFilter;
    const reducerFilter = filter !== 'feed' ? filter : cache.currentSubFilter;

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
    const limit = isLatestPostCheck ? 5 : 20;
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

        if (
          (pageType === 'profile' || pageType === 'ownProfile') &&
          (filter === 'feed' || filter === 'posts')
        ) {
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
    if (sAuthor && sPermlink && !refreshing && !isLatestPostCheck) {
      options.start_author = sAuthor;
      options.start_permlink = sPermlink;
    }

    try {
      const result = await func(options, username, nsfw);

      if (isMountedRef.current) {
        if (result.length > 0) {
          const _posts = result;

          if (filter === 'reblogs') {
            for (let i = _posts.length - 1; i >= 0; i--) {
              if (_posts[i].author === username) {
                _posts.splice(i, 1);
              }
            }
          }

          if (_posts.length > 0) {
            if (isLatestPostCheck) {
              _matchFreshPosts(_posts, reducerFilter);
            } else {
              cacheDispatch({
                type: 'update-filter-cache',
                payload: {
                  filter: reducerFilter,
                  posts: _posts,
                  shouldReset: refreshing,
                },
              });
            }
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
    cacheDispatch({
      type: 'change-filter',
      payload: {
        currentFilter: val,
      },
    });
    setSelectedFilterValue(val);
  };

  const _setSelectedFeedSubfilterValue = (val) => {
    cacheDispatch({
      type: 'change-sub-filter',
      payload: {
        currentSubFilter: val,
      },
    });
    setSelectedFeedSubfilterValue(val);
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

    // memorize filter position
    const scrollPosition = event.nativeEvent.contentOffset.y;
    cacheDispatch({
      type: 'scroll-position-change',
      payload: {
        scrollPosition,
      },
    });
  };

  const _handleSetNewPostsPopupPictures = (data) => {
    setNewPostsPopupPictures(data);
    const cacheFilter =
      cache.currentFilter !== 'feed' ? cache.currentFilter : cache.currentSubFilter;
    const { posts } = cache.cachedData[cacheFilter];
    if (posts.length > 0) {
      _scheduleLatestPostsCheck(posts[0]);
    }
  };

  return (
    <PostsView
      ref={elem}
      filterOptions={filterOptions}
      handleImagesHide={_handleImagesHide}
      handleOnScroll={_handleOnScroll}
      isHideImage={isHideImages}
      isLoggedIn={isLoggedIn}
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
      newPostsPopupPictures={newPostsPopupPictures}
      setNewPostsPopupPictures={_handleSetNewPostsPopupPictures}
    />
  );
};

export default PostsContainer;
