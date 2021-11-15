import React, {useState, useEffect, useRef} from 'react';
import PostsList from '../../postsList';
import { fetchPromotedEntries, loadPosts } from '../services/tabbedPostsFetch';
import { LoadPostsOptions, TabContentProps, TabMeta } from '../services/tabbedPostsModels';
import {useSelector, useDispatch } from 'react-redux';
import TabEmptyView from './listEmptyView';
import { setInitPosts } from '../../../redux/actions/postsAction';
import { calculateTimeLeftForPostCheck } from '../services/tabbedPostsHelpers';
import { AppState, NativeScrollEvent, ScrollResponderEvent } from 'react-native';
import { PostsListRef } from '../../postsList/container/postsListContainer';
import ScrollTopPopup from './scrollTopPopup';


const DEFAULT_TAB_META = {
    startAuthor:'',
    startPermlink:'',
    isLoading:false,
    isRefreshing:false,
  } as TabMeta;

var scrollOffset = 0;

const TabContent = ({
  filterKey, 
  isFeedScreen,
  isInitialTab,
  pageType,
  forceLoadPosts,
  filterScrollRequest,
  feedUsername,
  tag,
  onScrollRequestProcessed,
  handleOnScroll,
  ...props
}: TabContentProps) => {
  let _isMounted = true;


  //redux properties
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const isAnalytics = useSelector((state) => state.application.isAnalytics);
  const nsfw = useSelector((state) => state.application.nsfw);
  const isConnected = useSelector((state) => state.application.isConnected);
  const username = useSelector((state) => state.account.currentAccount.name);
  const initPosts = useSelector((state) => state.posts.initPosts)


  //state
  const [posts, setPosts] = useState([]);
  const [promotedPosts, setPromotedPosts] = useState([]);
  const [sessionUser, setSessionUser] = useState(username);
  const [tabMeta, setTabMeta] = useState(DEFAULT_TAB_META);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [postFetchTimer, setPostFetchTimer] = useState(0)
  const [enableScrollTop, setEnableScrollTop] = useState(false);

  //refs
  let postsListRef = useRef<PostsListRef>()
  const appState = useRef(AppState.currentState);
  const postsRef = useRef(posts);
  const sessionUserRef = useRef(sessionUser);

  //init state refs;
  postsRef.current = posts;
  sessionUserRef.current = sessionUser;


  //side effects
  useEffect(() => {
    
    if (isFeedScreen) {
      AppState.addEventListener('change', _handleAppStateChange);
    }

    _initContent(true, feedUsername);

    return _cleanup;
  }, [tag])


  useEffect(()=>{
    if(isConnected && (username !== sessionUser || forceLoadPosts)){
      _initContent(false, username);
    }
  }, [username, forceLoadPosts])

  useEffect(() => {
    if(filterScrollRequest && filterScrollRequest === filterKey){
      _scrollToTop();
      if(onScrollRequestProcessed){
        onScrollRequestProcessed();
      }
    }
  }, [filterScrollRequest])


  const _cleanup = () => {
    _isMounted = false;
    if(postFetchTimer){
      clearTimeout(postFetchTimer);
    }
    if (isFeedScreen) {
      AppState.removeEventListener('change', _handleAppStateChange);
    }
  }



  //actions
  const _handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active' && posts.length > 0) {
      const isLatestPostsCheck = true;
      _loadPosts(false, isLatestPostsCheck);
    }

    appState.current = nextAppState;
  };


  const _initContent = (isFirstCall = false, _feedUsername:string) => {
    _scrollToTop();

    const initialPosts = isFirstCall && isFeedScreen && isInitialTab ? initPosts : [];

    setPosts(initialPosts);
    setTabMeta(DEFAULT_TAB_META)
    setSessionUser(_feedUsername);
    setLatestPosts([]);

    if(postFetchTimer){
      clearTimeout(postFetchTimer);
    }

    if(username || (filterKey !== 'friends' && filterKey !== 'communities')){
      _loadPosts(!isFirstCall, false, _feedUsername, initialPosts, DEFAULT_TAB_META );
      _getPromotedPosts();
    }
  }

  //fetch posts from server
  const _loadPosts = async (
      shouldReset:boolean = false, 
      isLatestPostsCheck:boolean = false, 
      _feedUsername:string = isFeedScreen? sessionUserRef.current:feedUsername,
      _posts:any[] = postsRef.current,
      _tabMeta:TabMeta = tabMeta
    ) => {
    const options = {
      setTabMeta:(meta:TabMeta) => {
        if(_isMounted){
          setTabMeta(meta)
        }
      },
      filterKey,
      prevPosts:_posts,
      tabMeta:_tabMeta,
      isLoggedIn,
      isAnalytics,
      nsfw,
      isConnected,
      isFeedScreen,
      refreshing:shouldReset,
      pageType,
      isLatestPostsCheck,
      feedUsername:_feedUsername,
      tag,
      ...props
    } as LoadPostsOptions

    const result = await loadPosts(options)
    if(_isMounted && result){
      _postProcessLoadResult(result)
    }
  }


  const _getPromotedPosts = async () => {
    if(pageType === 'profile' || pageType === 'ownProfile'){
      return;
    }
    const pPosts = await fetchPromotedEntries(username)
    if(pPosts){
      setPromotedPosts(pPosts)
    }
  }



  //schedules post fetch
  const _scheduleLatestPostsCheck = (firstPost:any) => {
    if (firstPost) {
      if (postFetchTimer) {
        clearTimeout(postFetchTimer);
      }

      const timeLeft = calculateTimeLeftForPostCheck(firstPost)
      const _postFetchTimer = setTimeout(() => {
          const isLatestPostsCheck = true;
          _loadPosts(false, isLatestPostsCheck);
        }, 
        timeLeft
      );
      setPostFetchTimer(_postFetchTimer)
    }
  };


  //processes response from loadPost
  const _postProcessLoadResult = ({updatedPosts, latestPosts}:any) => {
    //process new posts avatart
    if(latestPosts && Array.isArray(latestPosts)){
      if(latestPosts.length > 0){
        setLatestPosts(latestPosts)
      }else{
        _scheduleLatestPostsCheck(posts[0])
      }
    }

    //process returned data
    if(Array.isArray(updatedPosts)){
      if(updatedPosts.length){
        //match new and old first post
        const firstPostChanged = posts.length == 0 || (posts[0].permlink !== updatedPosts[0].permlink);
        if (isFeedScreen && firstPostChanged) {
            //schedule refetch of new posts by checking time of current post
            
            _scheduleLatestPostsCheck(updatedPosts[0]);
            

            if (isInitialTab) {
              dispatch(setInitPosts(updatedPosts));
            }
        }
      } else if (isFeedScreen && isInitialTab){
        //clear posts cache if no first tab posts available, precautionary measure for accoutn change
        dispatch(setInitPosts([]))
      }
      setPosts(updatedPosts);
    }
  }


  
  //view related routines
  const _onPostsPopupPress = () => {
      _scrollToTop();
      _getPromotedPosts()
      setPosts([...latestPosts, ...posts])
      _scheduleLatestPostsCheck(latestPosts[0]);
      setLatestPosts([]);
  }

  const _scrollToTop = () => {
    postsListRef.current.scrollToTop();
    setEnableScrollTop(false);
  };
  
  const _handleOnScroll = () => {
    if(handleOnScroll){
      handleOnScroll()
    }
  }

  //view rendereres
  const _renderEmptyContent = () => {
    return <TabEmptyView filterKey={filterKey} isNoPost={tabMeta.isNoPost}/>
  }

  const _onScroll = (event:ScrollResponderEvent) => {
    var currentOffset = event.nativeEvent.contentOffset.y;
    var scrollUp = currentOffset < scrollOffset - 20;
    scrollOffset = currentOffset;
    setEnableScrollTop(scrollUp)
  }

  return (

    <>
    <PostsList 
      ref={postsListRef}
      data={posts}
      isFeedScreen={isFeedScreen}
      promotedPosts={promotedPosts}
      onLoadPosts={(shouldReset)=>{
        _loadPosts(shouldReset)
        if(shouldReset){
          _getPromotedPosts()
        }
      }}
      onScroll={_onScroll}
      onScrollEndDrag={_handleOnScroll}
      isRefreshing={tabMeta.isRefreshing}
      isLoading={tabMeta.isLoading}
      ListEmptyComponent={_renderEmptyContent}
      pageType={pageType}
    />
    <ScrollTopPopup 
      popupAvatars={latestPosts.map(post=>post.avatar || '')}
      enableScrollTop={enableScrollTop}
      onPress={_onPostsPopupPress}
      onClose={()=>{
        setLatestPosts([])
        setEnableScrollTop(false);
      }}
    />
  </>
  );
};

export default TabContent;


