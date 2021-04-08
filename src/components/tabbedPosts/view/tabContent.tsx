import React, {useState, useEffect} from 'react';
import PostsList from '../../postsList';
import { getPromotedPosts, loadPosts } from '../services/tabbedPostsFetch';
import { LoadPostsOptions, TabContentProps, TabMeta } from '../services/tabbedPostsModels';
import {useSelector } from 'react-redux';
import TabEmptyView from './listEmptyView';


const TabContent = ({
  filterKey, 
  isFeedScreen,
  pageType,
  forceLoadPosts,

  ...props
}: TabContentProps) => {

  //redux properties
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const isAnalytics = useSelector((state) => state.application.isAnalytics);
  const nsfw = useSelector((state) => state.application.nsfw);
  const isConnected = useSelector((state) => state.application.isConnected);
  const username = useSelector((state) => state.account.currentAccount.name);


  //state
  const [posts, setPosts] = useState([]);
  const [promotedPosts, setPromotedPosts] = useState([]);
  const [sessionUser, setSessionUser] = useState(username);
  const [tabMeta, setTabMeta] = useState({} as TabMeta)



  //side effects
  useEffect(() => {
    _initContent();
  }, [])

  useEffect(()=>{
    if(isConnected && (username !== sessionUser || forceLoadPosts)){
      _initContent();
    }
  },[username, forceLoadPosts])


  //actions
  const _initContent = () => {
    setPosts([]);
    setTabMeta({
      startAuthor:'',
      startPermlink:'',
      isLoading:false,
      isRefreshing:false,
    } as TabMeta)
    setSessionUser(username);
    _loadPosts();
    _getPromotedPosts();
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
    if(updatedPosts){
      setPosts(updatedPosts);
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


