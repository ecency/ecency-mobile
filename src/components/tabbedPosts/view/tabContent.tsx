import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { debounce } from 'lodash';
import BackgroundTimer from 'react-native-background-timer';
import PostsList from '../../postsList';
import { fetchPromotedEntries, loadPosts } from '../services/tabbedPostsFetch';
import { LoadPostsOptions, TabContentProps, TabMeta } from '../services/tabbedPostsModels';
import TabEmptyView from './listEmptyView';
import { showReplyModal } from '../../../redux/actions/uiAction';
import { PostsListRef } from '../../postsList/container/postsListContainer';
import ScrollTopPopup from './scrollTopPopup';
import { useFeedQuery } from '../../../providers/queries/postQueries/feedQueries';

const DEFAULT_TAB_META = {
  startAuthor: '',
  startPermlink: '',
  isLoading: false,
  isRefreshing: false,
} as TabMeta;

let scrollOffset = 0;
let blockPopup = false;
const SCROLL_POPUP_THRESHOLD = 5000;

const TabContent = ({
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
  ...props
}: TabContentProps) => {
  let _isMounted = true;

  // redux properties
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const nsfw = useSelector((state) => state.application.nsfw);
  const isConnected = useSelector((state) => state.application.isConnected);
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const initPosts = useSelector((state) => state.posts.initPosts);

  const { username } = currentAccount;
  const userPinned = currentAccount.about?.profile?.pinned;

  const feedQuery = useFeedQuery({
    feedUsername,
    filterKey,
    tag,
    cachePage: isInitialTab && isFeedScreen,
    enableFetchOnAppState: isFeedScreen,
  });

  // state
  const [posts, setPosts] = useState([]);
  const [promotedPosts, setPromotedPosts] = useState([]);
  const [sessionUser, setSessionUser] = useState(username);
  const [tabMeta, setTabMeta] = useState(DEFAULT_TAB_META);
  const [enableScrollTop, setEnableScrollTop] = useState(false);
  const [curPinned, setCurPinned] = useState(pinnedPermlink);

  // refs
  const postsListRef = useRef<PostsListRef>();

  const postsRef = useRef(posts);
  const sessionUserRef = useRef(sessionUser);
  const postFetchTimerRef = useRef<any>(null);

  // init state refs;
  postsRef.current = posts;
  sessionUserRef.current = sessionUser;

  // side effects
  useEffect(() => {

    _initContent(true, feedUsername);

  }, [tag]);

  useEffect(() => {
    if (isConnected && (username !== sessionUser || forceLoadPosts)) {
      _initContent(false, username);
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
      _scrollToTop();
      feedQuery.refresh();
      // _loadPosts({ shouldReset: true, _pinnedPermlink: userPinned });
      setCurPinned(userPinned);
    }
  }, [userPinned]);



  const _initContent = (isFirstCall = false, _feedUsername: string) => {
    _scrollToTop();

    const initialPosts = isFirstCall && isFeedScreen && isInitialTab ? initPosts : [];

    setPosts(initialPosts);
    setTabMeta(DEFAULT_TAB_META);
    setSessionUser(_feedUsername);

    if (postFetchTimerRef.current) {
      BackgroundTimer.clearTimeout(postFetchTimerRef.current);
      postFetchTimerRef.current = null;
    }

    if (username || (filterKey !== 'friends' && filterKey !== 'communities')) {
      // _loadPosts({
      //   shouldReset: !isFirstCall,
      //   isFirstCall,
      //   isLatestPostsCheck: false,
      //   _feedUsername,
      //   _posts: initialPosts,
      //   _tabMeta: DEFAULT_TAB_META,
      // });
      _getPromotedPosts();
    }
  };

  // fetch posts from server
  const _loadPosts = async ({
    shouldReset = false,
    isLatestPostsCheck = false,
    isFirstCall = false,
    _feedUsername = isFeedScreen ? sessionUserRef.current : feedUsername,
    _posts = postsRef.current,
    _tabMeta = tabMeta,
    _pinnedPermlink = curPinned,
  }: {
    shouldReset?: boolean;
    isLatestPostsCheck?: boolean;
    isFirstCall?: boolean;
    _feedUsername?: string;
    _posts?: any[];
    _tabMeta?: TabMeta;
    _pinnedPermlink?: string;
  }) => {
    const options = {
      setTabMeta: (meta: TabMeta) => {
        if (_isMounted) {
          setTabMeta(meta);
        }
      },
      filterKey,
      prevPosts: _posts,
      tabMeta: _tabMeta,
      isLoggedIn,
      nsfw,
      isConnected,
      isFeedScreen,
      refreshing: shouldReset,
      pageType,
      isLatestPostsCheck,
      feedUsername: _feedUsername,
      pinnedPermlink: _pinnedPermlink,
      tag,
      ...props,
    } as LoadPostsOptions;

    const result = await loadPosts(options);
    if (_isMounted && result) {
      if (shouldReset || isFirstCall) {
        setPosts([]);
      }
      // _postProcessLoadResult(result);
    }
  };

  const _getPromotedPosts = async () => {
    if (pageType === 'profile' || pageType === 'ownProfile' || pageType === 'community') {
      return;
    }
    const pPosts = await fetchPromotedEntries(username, nsfw);
    if (pPosts) {
      setPromotedPosts(pPosts);
    }
  };



  // processes response from loadPost
  // const _postProcessLoadResult = ({ updatedPosts, latestPosts }: any) => {

  //   // process returned data
  //   if (Array.isArray(updatedPosts)) {
  //     if (updatedPosts.length) {
  //       // match new and old first post
  //       const firstPostChanged =
  //         posts.length == 0 || posts[0].permlink !== updatedPosts[0].permlink;
  //       if (isFeedScreen && firstPostChanged) {
  //         // schedule refetch of new posts by checking time of current post
  //         _scheduleLatestPostsCheck(updatedPosts[0]);

  //         if (isInitialTab) {
  //           dispatch(setInitPosts(updatedPosts));
  //         }
  //       }
  //     } else if (isFeedScreen && isInitialTab) {
  //       // clear posts cache if no first tab posts available, precautionary measure for accoutn change
  //       dispatch(setInitPosts([]));
  //     }
  //     setPosts(updatedPosts);
  //   }
  // };


  // const _fetchLatestPosts = async () => {
  //   const _latestPosts = await feedQuery.fetchLatestPosts();

  //   if (_latestPosts.length > 0) {
  //     setLatestPosts(_latestPosts);
  //   } else {
  //     // _scheduleLatestPostsCheck(posts[0]);
  //   }
  // }

  // view related routines
  const _onPostsPopupPress = () => {
    _scrollToTop();
    _getPromotedPosts();
    feedQuery.mergetLatestPosts()
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
    return <TabEmptyView filterKey={filterKey} isNoPost={tabMeta.isNoPost} />;
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
        promotedPosts={promotedPosts}
        onLoadPosts={(shouldReset) => {
          // _loadPosts({ shouldReset });

          if (shouldReset) {
            feedQuery.refresh()
            _getPromotedPosts();
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
      <ScrollTopPopup
        popupAvatars={feedQuery.latestPosts.map((post) => post.avatar || '')}
        enableScrollTop={enableScrollTop}
        onPress={_onPostsPopupPress}
        onClose={() => {
          feedQuery.resetLatestPosts();
          setEnableScrollTop(false);
        }}
      />
    </>
  );
};

export default TabContent;
