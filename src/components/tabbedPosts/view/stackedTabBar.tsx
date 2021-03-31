import React, { useState } from "react";
import { useIntl } from "react-intl";
import { FilterBar } from "../..";

interface StackedTabBarProps {
    activeTab:boolean, 
    goToPage:(pageIndex)=>void, 
    tabs:string[],
    shouldStack:boolean,
    filterOptions:string[],
    subFilterOptions:string[],
    initialFilterIndex:number
}

export const StackedTabBar = ({
    activeTab, 
    goToPage, 
    tabs,
    shouldStack,
    filterOptions,
    subFilterOptions,
    initialFilterIndex

}:StackedTabBarProps) => {

    const intl = useIntl();
    const [selectedFilterIndex, setSelectedFilterIndex] = useState(initialFilterIndex);
    const [selectedFeedSubfilterIndex, setSelectedFeedSubfilterIndex] = useState(0);

    return (
      <>
      <FilterBar
        options={filterOptions.map((item) =>
          intl.formatMessage({ id: `home.${item.toLowerCase()}` }).toUpperCase(),
        )}
        selectedOptionIndex={selectedFilterIndex}
        rightIconName="view-module"
        rightIconType="MaterialIcons"
        onDropdownSelect={(index)=>{
          setSelectedFilterIndex(index);
          if(index == 0 && shouldStack){
            goToPage(filterOptions.length + selectedFeedSubfilterIndex)
          }else{
            goToPage(index);
          }
          
        }}
        onRightIconPress={()=>{}}
      />

      {
        selectedFilterIndex == 0 && shouldStack && (
          <FilterBar
            options={subFilterOptions.map((item) =>
              intl.formatMessage({ id: `home.${item.toLowerCase()}` }).toUpperCase(),
            )}
            selectedOptionIndex={selectedFeedSubfilterIndex}
            onDropdownSelect={(index)=>{
              setSelectedFeedSubfilterIndex(index)
              goToPage(filterOptions.length + index);
            }}
          />
        )
      }
      
      </>
    )
  }