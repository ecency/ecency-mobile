import React, { useState } from 'react';
import { TabView, TabBarProps } from 'react-native-tab-view';
import { useWindowDimensions, View } from 'react-native';
import { TabbedPostsProps } from '../types/tabbedPosts.types';
import { FeedTabBar } from '../view/feedTabBar';
import PostsTabContent from '../view/postsTabContent';

export const TabbedPosts = ({
  tabFilters,
  selectedOptionIndex,
  isFeedScreen,
  feedUsername,
  pageType,
  tabContentOverrides,
  ...props
}: TabbedPostsProps) => {
  const layout = useWindowDimensions();

  // initialize state
  const [index, setIndex] = useState(selectedOptionIndex);

  const [routes] = useState(
    tabFilters.map((filter) => ({ key: filter.filterKey, title: filter.label })),
  );

  const [selectedFilter, setSelectedFilter] = useState(tabFilters[selectedOptionIndex].filterKey);
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

  // render tab bar
  const _renderTabBar = (props: TabBarProps<any>) => {
    return (
      <FeedTabBar {...props} routes={routes} onFilterSelect={_onFilterSelect} pageType={pageType} />
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
        isInitialTab={selectedOptionIndex == index}
        feedUsername={feedUsername}
        pageType={pageType}
        filterScrollRequest={filterScrollRequest}
        onScrollRequestProcessed={_onScrollRequestProcessed}
        {...props}
      />
    );
  };

  return (
    <View style={{ flex: 1, width: layout.width }}>
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
