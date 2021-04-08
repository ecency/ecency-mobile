import React, {useState, useEffect} from 'react';
import PostsList from '../../postsList';
import { getPromotedPosts, loadPosts } from '../services/tabbedPostsFetch';
import { LoadPostsOptions, TabContentProps, TabMeta } from '../services/tabbedPostsModels';
import {useSelector, useDispatch } from 'react-redux';
import TabEmptyView from './listEmptyView';
import { filter } from 'core-js/core/array';
import { setInitPosts } from '../../../redux/actions/postsAction';


const TabContent = ({
  filterKey, 
  isFeedScreen,
  pageType,
  forceLoadPosts,

  ...props
}: TabContentProps) => {

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
  const [tabMeta, setTabMeta] = useState({} as TabMeta)



  //side effects
  useEffect(() => {
    _initContent(initPosts);
  }, [])

  useEffect(()=>{
    if(isConnected && (username !== sessionUser || forceLoadPosts)){
      if(filterKey !== 'friends'){
        _initContent();
      }else{
        setPosts([])
      }
    }
  },[username, forceLoadPosts])


  //actions
  const _initContent = (_initPosts:any[] = []) => {
    setPosts(_initPosts);
    setTabMeta({
      startAuthor:'',
      startPermlink:'',
      isLoading:false,
      isRefreshing:false,
    } as TabMeta)
    setSessionUser(username);

    if(username || (filterKey !== 'friends' && filterKey !== 'communities')){
      _loadPosts(true);
      _getPromotedPosts();
    }
  }


  const _loadPosts = async (shouldReset:boolean = false) => {
    const options = {
      filterKey,
      prevPosts:posts,
      tabMeta,
      setTabMeta,
      isLoggedIn,
      isAnalytics,
      nsfw,
      isConnected,
      isFeedScreen,
      refreshing:shouldReset,
      pageType,
      ...props
    } as LoadPostsOptions

    const updatedPosts = await loadPosts(options)
    if(updatedPosts && Array.isArray(updatedPosts)){
      if (isFeedScreen && shouldReset) {
        //   //schedule refetch of new posts by checking time of current post
        //   _scheduleLatestPostsCheck(nextPosts[0]);

          if (filterKey == username ? 'friends' : 'hot') {
            dispatch(setInitPosts(updatedPosts));
          }
      }
      setPosts(updatedPosts);
    }else{
      console.warn("Wrong data returned", updatedPosts)
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


  const _renderEmptyContent = () => {
    return <TabEmptyView filterKey={filterKey} isNoPost={tabMeta.isNoPost}/>
  }


  return (

    <PostsList 
      data={posts}
      isFeedScreen={isFeedScreen}
      promotedPosts={promotedPosts}
      onLoadPosts={(shouldReset)=>{
        _loadPosts(shouldReset)
        if(shouldReset){
          _getPromotedPosts()
        }
      }}
      isRefreshing={tabMeta.isRefreshing}
      isLoading={tabMeta.isLoading}
      ListEmptyComponent={_renderEmptyContent}
    />

  );
};

export default TabContent;


