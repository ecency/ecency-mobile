import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import get from 'lodash/get';
import unionBy from 'lodash/unionBy';
import Matomo from 'react-native-matomo-sdk';

// HIVE
import { getAccountPosts, getPost, getRankedPosts } from '../../../providers/steem/dsteem';
import { getPromotePosts } from '../../../providers/esteem/esteem';

// Component
import PostsView from '../view/postsView';

// Actions
import { setFeedPosts } from '../../../redux/actions/postsAction';
import { hidePostsThumbnails } from '../../../redux/actions/uiAction';

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
}) => {
  const dispatch = useDispatch();

  const nsfw = useSelector((state) => state.application.nsfw);
  const feedPosts = useSelector((state) => state.posts.feedPosts);
  const isConnected = useSelector((state) => state.application.isConnected);
  const isHideImages = useSelector((state) => state.ui.hidePostsThumbnails);
  const username = useSelector((state) => state.account.currentAccount.name);
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const isAnalytics = useSelector((state) => state.application.isAnalytics);

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
  ]);

  useEffect(() => {
    if (forceLoadPost) {
      setPosts([]);
      setStartAuthor('');
      setStartPermlink('');
      setSelectedFilterIndex(selectedOptionIndex || 0);
      setIsNoPost(false);

      _loadPosts();

      if (changeForceLoadPostState) {
        changeForceLoadPostState(false);
      }
    }
  }, [_loadPosts, changeForceLoadPostState, username, forceLoadPost, selectedOptionIndex]);

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
      func = getAccountPosts;
      options = {
        account: feedUsername,
        limit,
        sort: filter,
      };

      if (pageType === 'profiles' && (filter === 'feed' || filter === 'posts')) {
        options.sort = 'posts';
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

  const _handleOnDropdownSelect = (index) => {
    setSelectedFilterIndex(index);
    setPosts([]);
    setStartPermlink('');
    setStartAuthor('');
    setIsNoPost(false);
  };

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
      handleOnDropdownSelect={_handleOnDropdownSelect}
      loadPosts={_loadPosts}
      handleOnRefreshPosts={_handleOnRefreshPosts}
    />
  );
};

export default PostsContainer;
