import React, {useState, useEffect, useRef} from 'react';
import PostsList from '../../postsList';
import { getPromotedPosts, loadPosts } from '../services/tabbedPostsFetch';
import { LoadPostsOptions, TabContentProps, TabMeta } from '../services/tabbedPostsModels';
import {useSelector, useDispatch } from 'react-redux';
import TabEmptyView from './listEmptyView';
import { setInitPosts } from '../../../redux/actions/postsAction';
import NewPostsPopup from './newPostsPopup';
import { calculateTimeLeftForPostCheck } from '../services/tabbedPostsReducer';
import { AppState } from 'react-native';
import { PostsListRef } from '../../postsList/container/postsListContainer';


const TabContent = ({
  filterKey, 
  isFeedScreen,
  pageType,
  forceLoadPosts,
  filterScrollRequest,
  feedUsername,
  onScrollRequestProcessed,
  handleOnScroll,
  ...props
}: TabContentProps) => {
  let _postFetchTimer = null;
  let _isMounted = true;


  //redux properties
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const isAnalytics = useSelector((state) => state.application.isAnalytics);
  const nsfw = useSelector((state) => state.application.nsfw);
  const isConnected = useSelector((state) => state.application.isConnected);
  const username = useSelector((state) => state.account.currentAccount.name);
  const initPosts = useSelector((state) => {
    if(isFeedScreen){
      if(username && filterKey === 'friends'){
        return state.posts.initPosts
      }else if (!username && filterKey === 'hot'){
        return state.posts.initPosts
      }
    }
    return []
  });

  //state
  const [posts, setPosts] = useState([]);
  const [promotedPosts, setPromotedPosts] = useState([]);
  const [sessionUser, setSessionUser] = useState(username);
  const [tabMeta, setTabMeta] = useState({} as TabMeta);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);


  //refs
  let postsListRef = useRef<PostsListRef>()
  const appState = useRef(AppState.currentState);
  const postsRef = useRef(posts);
  postsRef.current = posts;

  //side effects
  useEffect(() => {
    
    if (isFeedScreen) {
      AppState.addEventListener('change', _handleAppStateChange);
    }

    _initContent(true, feedUsername);

    return _cleanup;
  }, [])


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
    if(_postFetchTimer){
      clearTimeout(_postFetchTimer);
    }
    if (isFeedScreen) {
      AppState.removeEventListener('change', _handleAppStateChange);
    }
  }



  //actions
  const _handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      const isLatestPostsCheck = true;
      _loadPosts(false, isLatestPostsCheck);
    }

    appState.current = nextAppState;
  };


  const _initContent = (isFirstCall = false, feedUsername:string) => {
    _scrollToTop();
    setPosts(isFirstCall ? initPosts : []);
    setTabMeta({
      startAuthor:'',
      startPermlink:'',
      isLoading:false,
      isRefreshing:false,
    } as TabMeta)
    setSessionUser(username);

    if(username || (filterKey !== 'friends' && filterKey !== 'communities')){
      _loadPosts(!isFirstCall, false, feedUsername);
      _getPromotedPosts();
    }
  }

  //fetch posts from server
  const _loadPosts = async (shouldReset:boolean = false, isLatestPostsCheck:boolean = false, _feedUsername:string = feedUsername) => {
    const options = {
      setTabMeta:(meta:TabMeta) => {
        if(_isMounted){
          setTabMeta(meta)
        }
      },
      filterKey,
      prevPosts:postsRef.current,
      tabMeta,
      isLoggedIn,
      isAnalytics,
      nsfw,
      isConnected,
      isFeedScreen,
      refreshing:shouldReset,
      pageType,
      isLatestPostsCheck,
      feedUsername:_feedUsername,
      ...props
    } as LoadPostsOptions

    const result = await loadPosts(options)
    if(_isMounted && result){
      _postProcessLoadResult(result, shouldReset)
    }
  }


  const _getPromotedPosts = async () => {
    if(pageType === 'profiles'){
      return;
    }
    const pPosts = await getPromotedPosts(username)
    if(pPosts){
      setPromotedPosts(pPosts)
    }
  }



  //schedules post fetch
  const _scheduleLatestPostsCheck = (firstPost:any) => {
    if (firstPost) {
      if (_postFetchTimer) {
        clearTimeout(_postFetchTimer);
      }

      const timeLeft = calculateTimeLeftForPostCheck(firstPost)
      _postFetchTimer = setTimeout(() => {
          const isLatestPostsCheck = true;
          _loadPosts(false, isLatestPostsCheck);
        }, 
        timeLeft
      );
    }
  };


  //processes response from loadPost
  const _postProcessLoadResult = ({updatedPosts, latestPosts}:any, shouldReset:boolean) => {
    //process new posts avatart
    if(latestPosts && Array.isArray(latestPosts)){
      if(latestPosts.length > 0){
        setLatestPosts(latestPosts)
      }else{
        _scheduleLatestPostsCheck(posts[0])
      }
    }

    //process returned data
    if(updatedPosts && Array.isArray(updatedPosts)){
      if (isFeedScreen && shouldReset) {
        //   //schedule refetch of new posts by checking time of current post
          _scheduleLatestPostsCheck(updatedPosts[0]);

          if (filterKey == username ? 'friends' : 'hot') {
            dispatch(setInitPosts(updatedPosts));
          }
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
      onScrollEndDrag={_handleOnScroll}
      isRefreshing={tabMeta.isRefreshing}
      isLoading={tabMeta.isLoading}
      ListEmptyComponent={_renderEmptyContent}
    />
    <NewPostsPopup 
      popupAvatars={latestPosts.map(post=>post.avatar || '')}
      onPress={_onPostsPopupPress}
      onClose={()=>{
        setLatestPosts([])
      }}
    />
  </>
  );
};

export default TabContent;


