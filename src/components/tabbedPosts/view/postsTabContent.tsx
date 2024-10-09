import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { debounce } from 'lodash';
import BackgroundTimer from 'react-native-background-timer';
import PostsList from '../../postsList';
import { PostsTabContentProps } from '../types/tabbedPosts.types';
import TabEmptyView from './listEmptyView';
import { showReplyModal } from '../../../redux/actions/uiAction';
import { PostsListRef } from '../../postsList/container/postsListContainer';
import {
  useFeedQuery,
  usePromotedPostsQuery,
} from '../../../providers/queries/postQueries/feedQueries';
import { NewPostsPopup, ScrollTopPopup } from '../../atoms';

let scrollOffset = 0;
let blockPopup = false;
const SCROLL_POPUP_THRESHOLD = 5000;

const PostsTabContent = ({
  filterKey,
  isFeedScreen,
  isInitialTab,
  pageType,
  forceLoadPosts,
  filterScrollRequest,
  feedUsername,
  tag,
  pinnedPermlink,
  onScrollRequestProcessed,
  handleOnScroll,
  handleOnScrollBeginDrag,
}: PostsTabContentProps) => {
  // redux properties
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const isConnected = useSelector((state) => state.application.isConnected);
  const currentAccount = useSelector((state) => state.account.currentAccount);

  const { username } = currentAccount;
  const userPinned = currentAccount.about?.profile?.pinned;

  // state
  const [sessionUser, setSessionUser] = useState(username);
  const [enableScrollTop, setEnableScrollTop] = useState(false);
  const [curPinned, setCurPinned] = useState(pinnedPermlink);

  // refs
  const postsListRef = useRef<PostsListRef>();

  const sessionUserRef = useRef(sessionUser);
  const postFetchTimerRef = useRef<any>(null);

  const feedQuery = useFeedQuery({
    feedUsername,
    filterKey,
    tag,
    cachePage: isInitialTab && isFeedScreen,
    enableFetchOnAppState: isFeedScreen,
    pinnedPermlink: curPinned,
  });
  const promotedPostsQuery = usePromotedPostsQuery();

  // init state refs;
  sessionUserRef.current = sessionUser;

  const skipPromotedPosts = useMemo(() => {
    switch (pageType) {
      case 'profile':
      case 'ownProfile':
      case 'community':
        return true;
      default:
        return false;
    }
  }, [pageType]);

  // side effects
  useEffect(() => {
    _initContent(feedUsername);
  }, [tag]);

  useEffect(() => {
    if (isConnected && (username !== sessionUser || forceLoadPosts)) {
      _initContent(username);
    }
  }, [username, forceLoadPosts]);

  useEffect(() => {
    if (filterScrollRequest && filterScrollRequest === filterKey) {
      _scrollToTop();
      if (onScrollRequestProcessed) {
        onScrollRequestProcessed();
      }
    }
  }, [filterScrollRequest]);

  useEffect(() => {
    console.log('curPinned change', userPinned);
    if (pageType === 'ownProfile' && userPinned !== curPinned) {
      setCurPinned(userPinned);
      _scrollToTop();
      feedQuery.refresh();
    }
  }, [userPinned]);

  const _initContent = (_sessionUsername: string) => {
    _scrollToTop();
    setSessionUser(_sessionUsername);

    if (postFetchTimerRef.current) {
      BackgroundTimer.clearTimeout(postFetchTimerRef.current);
      postFetchTimerRef.current = null;
    }
  };

  // view related routines
  const _onPostsPopupPress = () => {
    _scrollToTop();
    feedQuery.mergetLatestPosts();
  };

  const _scrollToTop = () => {
    postsListRef?.current?.scrollToTop();
    setEnableScrollTop(false);
    scrollPopupDebouce.cancel();
    blockPopup = true;
    setTimeout(() => {
      blockPopup = false;
    }, 1000);
  };

  const _handleOnScroll = () => {
    if (handleOnScroll) {
      handleOnScroll();
    }
  };

  // view rendereres
  const _renderEmptyContent = () => {
    const _isNoPost = !feedQuery.isLoading && feedQuery.data.length == 0;
    return <TabEmptyView filterKey={filterKey} isNoPost={_isNoPost} />;
  };

  const scrollPopupDebouce = debounce(
    (value) => {
      setEnableScrollTop(value);
    },
    500,
    { leading: true },
  );

  const _onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const scrollUp = currentOffset < scrollOffset;
    scrollOffset = currentOffset;

    if (scrollUp && !blockPopup && currentOffset > SCROLL_POPUP_THRESHOLD) {
      scrollPopupDebouce(true);
    }
  };

  // show quick reply modal
  const _showQuickReplyModal = (post: any) => {
    if (isLoggedIn) {
      dispatch(showReplyModal({ mode: 'comment', parentPost: post }));
    } else {
      // TODO: show proper alert message
      console.log('Not LoggedIn');
    }
  };

  return (
    <>
      <PostsList
        ref={postsListRef}
        posts={feedQuery.data}
        isFeedScreen={isFeedScreen}
        promotedPosts={!skipPromotedPosts ? promotedPostsQuery.data : []}
        onLoadPosts={(shouldReset) => {
          if (shouldReset) {
            feedQuery.refresh();
            promotedPostsQuery.refetch();
          } else {
            feedQuery.fetchNextPage();
          }
        }}
        onScroll={_onScroll}
        onScrollEndDrag={_handleOnScroll}
        onScrollBeginDrag={handleOnScrollBeginDrag}
        isRefreshing={feedQuery.isRefreshing}
        isLoading={feedQuery.isLoading}
        ListEmptyComponent={_renderEmptyContent}
        pageType={pageType}
        showQuickReplyModal={_showQuickReplyModal}
      />
      <NewPostsPopup
        popupAvatars={feedQuery.latestPosts.map((post) => post.avatar || '')}
        onPress={_onPostsPopupPress}
        onClose={() => {
          feedQuery.resetLatestPosts();
        }}
      />
      <ScrollTopPopup enable={enableScrollTop} onPress={_onPostsPopupPress} />
    </>
  );
};

export default PostsTabContent;
