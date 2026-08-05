import React, { useDeferredValue, useState } from 'react';
import { TabView, TabBarProps } from 'react-native-tab-view';
import { useWindowDimensions, View } from 'react-native';
import { useIntl } from 'react-intl';
import { Image } from 'expo-image';
import EStyleSheet from 'react-native-extended-stylesheet';
import { TabbedPostsProps } from '../types/tabbedPosts.types';
import { FeedTabBar } from '../view/feedTabBar';
import PostsTabContent from '../view/postsTabContent';
import { renderPillTabLabel } from '../view/renderPillTabLabel';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
});

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
  const layoutWidth = Math.round(layout.width);
  const deferredLayoutWidth = useDeferredValue(layoutWidth);
  const intl = useIntl();

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

  const _renderTabLabel = ({ labelText, focused }: { focused: boolean; labelText: string }) =>
    renderPillTabLabel({ labelText: intl.formatMessage({ id: labelText.toLowerCase() }), focused });

  const _setIndex = (i: number) => {
    Image.clearMemoryCache();
    setIndex(i);
  };

  // Dynamically create scenes for each tab
  const renderScene = ({ route }: any) => {
    if (tabContentOverrides && tabContentOverrides.has(index)) {
      return tabContentOverrides.get(index);
    }
    return (
      <PostsTabContent
        {...({} as any)}
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
    <View style={[styles.container, { width: layoutWidth }]}>
      <TabView
        key={`tab-view-${deferredLayoutWidth}`}
        animationEnabled={false}
        lazy={true}
        swipeEnabled={false}
        renderTabBar={_renderTabBar}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={_setIndex}
        commonOptions={{
          label: _renderTabLabel as any,
        }}
        initialLayout={{ width: deferredLayoutWidth }}
      />
    </View>
  );
};
