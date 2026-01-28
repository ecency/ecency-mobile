import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { debounce } from 'lodash';
import BackgroundTimer from 'react-native-background-timer';
import { SheetManager } from 'react-native-actions-sheet';
import PostsList from '../../postsList';
import { PostsTabContentProps } from '../types/tabbedPosts.types';
import TabEmptyView from './listEmptyView';
import { PostsListRef } from '../../postsList/container/postsListContainer';
import {
  useFeedQuery,
  usePromotedPostsQuery,
} from '../../../providers/queries/postQueries/feedQueries';
import { NewPostsPopup, ScrollTopPopup } from '../../atoms';
import { SheetNames } from '../../../navigation/sheets';
import {
  selectIsLoggedIn,
  selectCurrentAccount,
  selectIsConnected,
} from '../../../redux/selectors';
import { useAppSelector } from '../../../hooks';
import { ProposalVoteRequest } from '../..';

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
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isConnected = useAppSelector(selectIsConnected);
  const currentAccount = useAppSelector(selectCurrentAccount);

  const username = currentAccount?.name;

  // state
  const [sessionUser, setSessionUser] = useState(username);
  const [enableScrollTop, setEnableScrollTop] = useState(false);
  const [curPinned, setCurPinned] = useState(pinnedPermlink);

  // refs
  const postsListRef = useRef<PostsListRef>();

  const sessionUserRef = useRef(sessionUser);
  const postFetchTimerRef = useRef<any>(null);
  const blockPopupRef = useRef(false);
  const blockPopupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollOffsetRef = useRef(0);
  const SCROLL_POPUP_THRESHOLD = 5000;

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

  const feedQuery = useFeedQuery({
    feedUsername,
    filterKey,
    tag,
    cachePage: isInitialTab && isFeedScreen,
    enableFetchOnAppState: isFeedScreen,
    pinnedPermlink: curPinned,
  });
  const promotedPostsQuery = usePromotedPostsQuery(!skipPromotedPosts);

  // init state refs;
  sessionUserRef.current = sessionUser;

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

  // Update pinned post when prop changes (for both own profile and viewing others)
  useEffect(() => {
    if (pinnedPermlink !== curPinned) {
      setCurPinned(pinnedPermlink);
      if (pageType === 'profile' || pageType === 'ownProfile') {
        _scrollToTop();
        feedQuery.refresh();
      }
    }
  }, [pinnedPermlink, pageType, curPinned]);

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

  const _onScrollToTopPress = () => {
    _scrollToTop();
    // Don't merge posts - this is just a scroll convenience button
  };

  const _scrollToTop = () => {
    postsListRef?.current?.scrollToTop();
    setEnableScrollTop(false);
    scrollPopupDebouce.cancel();
    blockPopupRef.current = true;

    // Clear existing timeout
    if (blockPopupTimeoutRef.current) {
      clearTimeout(blockPopupTimeoutRef.current);
    }

    // Set new timeout
    blockPopupTimeoutRef.current = setTimeout(() => {
      blockPopupRef.current = false;
      blockPopupTimeoutRef.current = null;
    }, 1000);
  };

  const _handleOnScroll = () => {
    if (handleOnScroll) {
      handleOnScroll();
    }
  };

  const _renderHeader = useMemo(() => {
    if (isLoggedIn && pageType === 'main' && isInitialTab) {
      return <ProposalVoteRequest />;
    }
  }, [isLoggedIn, pageType, isInitialTab, currentAccount?.name]);

  // view rendereres
  const _renderEmptyContent = () => {
    const _isNoPost = !feedQuery.isLoading && feedQuery.data.length == 0;
    return <TabEmptyView filterKey={filterKey} isNoPost={_isNoPost} />;
  };

  const scrollPopupCallback = useCallback((value: boolean) => {
    setEnableScrollTop(value);
  }, []);

  const scrollPopupDebouce = useMemo(
    () => debounce(scrollPopupCallback, 500, { leading: true }),
    [scrollPopupCallback],
  );

  // Cleanup debounce and timeout on unmount
  useEffect(() => {
    return () => {
      scrollPopupDebouce.cancel();
      if (blockPopupTimeoutRef.current) {
        clearTimeout(blockPopupTimeoutRef.current);
      }
    };
  }, [scrollPopupDebouce]);

  const _onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const scrollUp = currentOffset < scrollOffsetRef.current;
    scrollOffsetRef.current = currentOffset;

    if (scrollUp && !blockPopupRef.current && currentOffset > SCROLL_POPUP_THRESHOLD) {
      scrollPopupDebouce(true);
    }
  };

  // show quick reply modal
  const _showQuickReplyModal = (post: any) => {
    if (isLoggedIn) {
      SheetManager.show(SheetNames.QUICK_POST, {
        payload: {
          mode: 'comment',
          parentPost: post,
        },
      });
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
        promotedPosts={!skipPromotedPosts ? promotedPostsQuery.data || [] : []}
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
        ListHeaderComponent={_renderHeader}
      />
      <NewPostsPopup
        popupAvatars={feedQuery.latestPosts.map((post) => post.avatar || '')}
        onPress={_onPostsPopupPress}
        onClose={() => {
          feedQuery.resetLatestPosts();
        }}
      />
      <ScrollTopPopup enable={enableScrollTop} onPress={_onScrollToTopPress} />
    </>
  );
};

export default PostsTabContent;
