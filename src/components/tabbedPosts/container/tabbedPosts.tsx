import React, { useState } from 'react';
import { TabbedPostsProps } from '../types/tabbedPosts.types';
import { FeedTabBar, TabItem } from '../view/feedTabBar';
import PostsTabContent from '../view/postsTabContent';
import { TabView, TabBarProps } from 'react-native-tab-view';
import { useWindowDimensions, View } from 'react-native';

export const TabbedPosts = ({
  filterOptions,
  filterOptionsValue,
  selectedOptionIndex,
  feedSubfilterOptions,
  feedSubfilterOptionsValue,
  isFeedScreen,
  feedUsername,
  pageType,
  tabContentOverrides,
  stackedTabs,
  onTabChange,
  ...props
}: TabbedPostsProps) => {

  const layout = useWindowDimensions();

  // initialize state
  const [initialTabIndex] = useState(
    selectedOptionIndex == 0 && stackedTabs ? filterOptions.length : selectedOptionIndex,
  );
  const [index, setIndex] = useState(initialTabIndex);

  const mainFilters = filterOptions.map(
    (label, index) =>
    ({
      filterKey: filterOptionsValue[index],
      label,
    } as TabItem),
  );

  const subFilters = feedSubfilterOptions
    ? feedSubfilterOptions.map(
      (label, index) =>
      ({
        filterKey: feedSubfilterOptionsValue[index],
        label,
      } as TabItem),
    )
    : [];

  const combinedFilters = [...mainFilters, ...subFilters];
  const [routes] = useState(
    combinedFilters.map((filter, index) => ({ key: filter.filterKey, title: filter.label }))
  );

  const [selectedFilter, setSelectedFilter] = useState(combinedFilters[initialTabIndex].filterKey);
  const [filterScrollRequest, createFilterScrollRequest] = useState<string | null>(null);

  // components actions
  const _onFilterSelect = (filter: string) => {
    if (filter === selectedFilter) {
      createFilterScrollRequest(selectedFilter);
    } else {
      setSelectedFilter(filter);
    }
  };

  const _onScrollRequestProcessed = () => {
    createFilterScrollRequest(null);
  };

  // initialize first set of pages
  const pages = combinedFilters.map((filter, index) => {
    if (tabContentOverrides && tabContentOverrides.has(index)) {
      return tabContentOverrides.get(index);
    }

    return (
      <PostsTabContent
        key={filter.filterKey}
        filterKey={filter.filterKey}
        isFeedScreen={isFeedScreen}
        isInitialTab={initialTabIndex == index}
        feedUsername={feedUsername}
        pageType={pageType}
        filterScrollRequest={filterScrollRequest}
        onScrollRequestProcessed={_onScrollRequestProcessed}
        {...props}
      />
    );
  });



  // render tab bar
  const _renderTabBar = (props: TabBarProps<any>) => {

    return (
      <FeedTabBar
        {...props}
        routes={routes}
        initialFirstStackIndex={selectedOptionIndex}
        onFilterSelect={_onFilterSelect}
        pageType={pageType}
      />
    );
  };


  // Dynamically create scenes for each tab
  const renderScene = ({ route }) => {

    if (tabContentOverrides && tabContentOverrides.has(index)) {
      return tabContentOverrides.get(index);
    }
    return (
      <PostsTabContent
        key={route.key}
        filterKey={route.key}
        isFeedScreen={isFeedScreen}
        isInitialTab={initialTabIndex == index}
        feedUsername={feedUsername}
        pageType={pageType}
        filterScrollRequest={filterScrollRequest}
        onScrollRequestProcessed={_onScrollRequestProcessed}
        {...props}
      />
    );
  };

  return (
    <View style={{ flex: 1, width: layout.width }} >
      <TabView
        animationEnabled={false}
        lazy={true}
        swipeEnabled={false}
        renderTabBar={_renderTabBar}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>

  );
};
