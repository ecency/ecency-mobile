import React, { useEffect, useReducer, useState } from 'react';
import { useIntl } from 'react-intl';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { useDispatch, useSelector } from 'react-redux';
import PostsList from '../../postsList';
import { loadPosts, LoadPostsOptions } from '../services/tabbedPostsFetch';
import { cacheReducer, initCacheState, setSelectedFilter, PostsCache } from '../services/tabbedPostsReducer';
import { StackedTabBar, TabItem } from '../view/stackedTabBar';
import { TabbedPostsProps } from './tabbedPostsProps';


export const TabbedPosts = ({
  filterOptions,
  filterOptionsValue,
  initialFilterIndex,
  feedSubfilterOptions,
  feedSubfilterOptionsValue,
  isFeedScreen,
  feedUsername,
  ...props
}:TabbedPostsProps) => {

  const intl = useIntl();
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);

  //redux properties
  const isAnalytics = useSelector((state) => state.application.isAnalytics);
  const nsfw = useSelector((state) => state.application.nsfw);
  const isConnected = useSelector((state) => state.application.isConnected);


  //initialize state
  const [initialTabIndex] = useState(initialFilterIndex == 0 && isFeedScreen ? filterOptions.length : initialFilterIndex)

  const [mainFilters] = useState<TabItem[]>(
    filterOptions.map((label, index)=>({
      filterKey:filterOptionsValue[index], 
      label
    } as TabItem))
  )

  const [subFilters] = useState<TabItem[]>(
    feedSubfilterOptions.map((label, index)=>({
      filterKey:feedSubfilterOptionsValue[index], 
      label
    } as TabItem))
  )

  const [combinedFilters] = useState([...mainFilters, ...subFilters]);


  //declaring cache
  const _initCacheState = () => {
    const selectedFilter = combinedFilters[initialTabIndex].filterKey
    return initCacheState(combinedFilters, selectedFilter, isFeedScreen);
  }
  const [cache, cacheDispatch] = useState<PostsCache>(_initCacheState())

  
  //initialize first set of pages
  const pages = combinedFilters.map((filter)=>(
    <PostsList
      key={filter.filterKey}
      data={cache.cachedData[filter.filterKey].posts}
      tabLabel={filter.label}
      isFeedScreen={isFeedScreen}
      promotedPosts={[]}
    />
  ))

  //side effects
  useEffect(() => {
    _loadPosts()
  }, [])



  //load posts implementation
  const _loadPosts = (filter?:string) => {
    const options = {
      passedFilter:filter,
      cache,
      cacheDispatch,
      isLoggedIn,
      isAnalytics,
      nsfw,
      isConnected,
      feedUsername,
      isFeedScreen,
      ...props
    } as LoadPostsOptions
    loadPosts(options)
  }


  //actions
  
  const _onFilterSelect = (filter:string) => {
    cacheDispatch(setSelectedFilter(cache, filter))
    if(cache.cachedData[filter].posts.length === 0){
      _loadPosts(filter);
    }
  }


  //render tab bar
  const _renderTabBar = (props) => {
    return (
      <StackedTabBar 
        {...props}
        shouldStack={isFeedScreen && feedUsername}
        firstStack={mainFilters}
        secondStack={subFilters}
        initialFirstStackIndex={initialFilterIndex}
        onFilterSelect={_onFilterSelect}
      />
    )
  }


  return (
    <ScrollableTabView
      scrollWithoutAnimation={true}
      initialPage={initialTabIndex}
      renderTabBar={_renderTabBar}>
      {pages}
    </ScrollableTabView>
  );

}
