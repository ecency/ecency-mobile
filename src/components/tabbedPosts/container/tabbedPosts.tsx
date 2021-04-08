import React, { useEffect, useReducer, useState } from 'react';
import { useIntl } from 'react-intl';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { useDispatch, useSelector } from 'react-redux';
import PostsList from '../../postsList';
import { getPromotedPosts, loadPosts } from '../services/tabbedPostsFetch';
import { TabbedPostsProps } from '../services/tabbedPostsModels';
import { StackedTabBar, TabItem } from '../view/stackedTabBar';
import TabContent from '../view/tabContent';


export const TabbedPosts = ({
  filterOptions,
  filterOptionsValue,
  initialFilterIndex,
  feedSubfilterOptions,
  feedSubfilterOptionsValue,
  isFeedScreen,
  feedUsername,
  pageType,
  ...props
}:TabbedPostsProps) => {


  //redux properties
  // const isConnected = useSelector((state) => state.application.isConnected);
  // const username = useSelector((state) => state.account.currentAccount.name); 
  // const isConnected = useSelector((state) => state.application.isConnected);

  //initialize state

  const [initialTabIndex] = useState(initialFilterIndex == 0 && isFeedScreen ? filterOptions.length : initialFilterIndex)
  // const [promotedPosts, setPromotedPosts] = useState([]);

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
  // const [sessionUser, setSessionUser] = useState(username);
  const [selectedFilter, setSelectedFilter] = useState(combinedFilters[initialTabIndex].filterKey)


  // //sideEffects
  // useEffect(() => {
  //   _getPromotedPosts();
  // }, [])

  // useEffect(()=>{
  //   if(isConnected && (username !== sessionUser || forceLoadPosts)){
  //     setSessionUser(username);
  //     // _getPromotedPosts();
  //   }
  // },[username, forceLoadPosts])


    //components actions
    const _onFilterSelect = (filter:string) => {
      if(filter !== selectedFilter){
        // _getPromotedPosts()
      } else {
        //scroll tab to top
      }
      setSelectedFilter(filter)
    }


    // const _getPromotedPosts = async () => {
    //   if(pageType === 'profiles'){
    //     return;
    //   }
    //   const pPosts = await getPromotedPosts(username)
    //   if(pPosts){
    //     // setPromotedPosts(pPosts)
    //   }
    // }



  //initialize first set of pages
  const pages = combinedFilters.map((filter)=>(
    <TabContent
      filterKey={filter.filterKey}
      tabLabel={filter.label}
      isFeedScreen={isFeedScreen}
      feedUsername={feedUsername}
      pageType={pageType}
      {...props}
    />
  ))


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
