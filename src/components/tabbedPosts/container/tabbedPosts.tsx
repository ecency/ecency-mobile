import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { useSelector } from 'react-redux';
import { FilterBar } from '../..';
import PostsList from '../../postsList';
import { StackedTabBar } from '../view/stackedTabBar';
import { TabbedPostsProps } from './tabbedPostsProps';


export const TabbedPosts = ({
  filterOptions,
  filterOptionsValue,
  initialFilterIndex,
  feedSubfilterOptions,
  feedSubfilterOptionsValue,
  isFeedScreen
}:TabbedPostsProps) => {

  const intl = useIntl();
  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);

  const [initialPageIndex] = useState(initialFilterIndex == 0 && isFeedScreen && isLoggedIn ? filterOptions.length : initialFilterIndex)


  const pages = [
    ...filterOptions,
    ...feedSubfilterOptions,
  ].map((filter)=>(
    <PostsList 
      tabLabel={filter}
      isFeedScreen={isFeedScreen}
      promotedPosts={[]}
    />
  ))


  const _renderTabBar = (props) => {
    return (
      <StackedTabBar 
        {...props}
        shouldStack={isFeedScreen && isLoggedIn}
        filterOptions={filterOptions}
        subFilterOptions={feedSubfilterOptions}
        initialFilterIndex={initialFilterIndex}
      />
    )
  }


  return (
    <ScrollableTabView
      scrollWithoutAnimation={true}
      initialPage={initialPageIndex}
      renderTabBar={_renderTabBar}>
      {pages}
    </ScrollableTabView>
  );

}
