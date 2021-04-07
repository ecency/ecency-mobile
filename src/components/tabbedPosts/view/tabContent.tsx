import React, {useState, useEffect} from 'react';
import PostsList from '../../postsList';
import { loadPosts } from '../services/tabbedPostsFetch';
import { LoadPostsOptions, TabMeta } from '../services/tabbedPostsModels';
import {useSelector } from 'react-redux';
import TabEmptyView from './listEmptyView';

interface TabContentProps {
  filterKey:string,
  tabLabel:string,
  isFeedScreen:boolean,
  promotedPosts:any[],
  getFor:string,
  pageType:string,
  feedUsername:string,
  tag:string,
}

const TabContent = ({
  filterKey, 
  isFeedScreen,
  promotedPosts,
  ...props
}: TabContentProps) => {

  //redux properties
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);
  const isAnalytics = useSelector((state) => state.application.isAnalytics);
  const nsfw = useSelector((state) => state.application.nsfw);
  const isConnected = useSelector((state) => state.application.isConnected);

  //state
  const [posts, setPosts] = useState([]);
  const [tabMeta, setTabMeta] = useState({
    startAuthor:'',
    startPermlink:'',
    isLoading:false,
    isRefreshing:false,
  } as TabMeta)


  useEffect(()=>{
    _loadPosts();
  },[])

    //load posts implementation
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
        ...props
      } as LoadPostsOptions

      const updatedPosts = await loadPosts(options)
      if(updatedPosts){
        setPosts(updatedPosts);
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
      onLoadPosts={_loadPosts}
      isRefreshing={tabMeta.isRefreshing}
      isLoading={tabMeta.isLoading}
      ListEmptyComponent={_renderEmptyContent}
    />

  );
};

export default TabContent;


