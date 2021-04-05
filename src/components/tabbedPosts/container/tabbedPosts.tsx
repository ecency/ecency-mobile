import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { useDispatch, useSelector } from 'react-redux';
import PostsList from '../../postsList';
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
}:TabbedPostsProps) => {

  const intl = useIntl();
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);

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
  const [selectedFilter, setSelectedFilter] = useState<string>(combinedFilters[initialTabIndex].filterKey);

  
  //initialize first set of pages
  const pages = combinedFilters.map((filter)=>(
    <PostsList
      tabLabel={filter.label}
      isFeedScreen={isFeedScreen}
      promotedPosts={[]}
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
        onFilterSelect={setSelectedFilter}
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
