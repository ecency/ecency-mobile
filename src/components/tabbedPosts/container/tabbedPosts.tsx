import React, { useState } from 'react';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { useDispatch, useSelector } from 'react-redux';
import { hidePostsThumbnails } from '../../../redux/actions/uiAction';
import { TabbedPostsProps } from '../services/tabbedPostsModels';
import { StackedTabBar, TabItem } from '../view/stackedTabBar';
import TabContent from '../view/tabContent';


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
  imagesToggleEnabled = true,
  stackedTabs,
  onTabChange,
  ...props
}:TabbedPostsProps) => {

  const dispatch = useDispatch();

  //redux properties
  const isHideImages = useSelector((state) => state.ui.hidePostsThumbnails);

  //initialize state
  const [initialTabIndex] = useState(selectedOptionIndex == 0 && stackedTabs ? filterOptions.length : selectedOptionIndex)

  const [mainFilters] = useState<TabItem[]>(
    filterOptions.map((label, index)=>({
      filterKey:filterOptionsValue[index], 
      label
    } as TabItem))
  )

  const [subFilters] = useState<TabItem[]>(
    feedSubfilterOptions
    ? feedSubfilterOptions.map((label, index)=>({
      filterKey:feedSubfilterOptionsValue[index], 
      label
    } as TabItem))
    : []
  )

  const [combinedFilters] = useState([...mainFilters, ...subFilters]);
  const [selectedFilter, setSelectedFilter] = useState(combinedFilters[initialTabIndex].filterKey)
  const [filterScrollRequest, createFilterScrollRequest] = useState<string|null>(null)



    //components actions
    const _onFilterSelect = (filter:string) => {
      if(filter === selectedFilter){
        createFilterScrollRequest(selectedFilter) 
      }else{
        setSelectedFilter(filter)
      }
    }

    const _toggleHideImagesFlag = () => {
      dispatch(hidePostsThumbnails(!isHideImages));
    }

    const _onScrollRequestProcessed = () => {
      createFilterScrollRequest(null);
    }



  //initialize first set of pages
  const pages = combinedFilters.map((filter, index)=>{
    if(tabContentOverrides && tabContentOverrides.has(index)){
      return tabContentOverrides.get(index);
    }
    return  (
      <TabContent
        key={filter.filterKey}
        filterKey={filter.filterKey}
        isFeedScreen={isFeedScreen}
        feedUsername={feedUsername}
        pageType={pageType}
        filterScrollRequest={filterScrollRequest}
        onScrollRequestProcessed={_onScrollRequestProcessed}
        {...props}
      />
    )
  });


  //render tab bar
  const _renderTabBar = (props) => {
    return (
      <StackedTabBar 
        {...props}
        shouldStack={stackedTabs}
        firstStack={mainFilters}
        secondStack={subFilters}
        initialFirstStackIndex={selectedOptionIndex}
        onFilterSelect={_onFilterSelect}
        toggleHideImagesFlag={imagesToggleEnabled && _toggleHideImagesFlag}
      />
    )
  }


  return (
    <ScrollableTabView
      scrollWithoutAnimation={true}
      locked={true}
      initialPage={initialTabIndex}
      renderTabBar={_renderTabBar}
      onTabChange={onTabChange}
      >
      {pages}
    </ScrollableTabView>
  );

}
