import React, { useState } from "react";
import { useIntl } from "react-intl";
import { FilterBar } from "../..";

export interface TabItem {
  filterKey:string;
  label:string;
}

interface StackedTabBarProps {
    activeTab:boolean;
    goToPage:(pageIndex)=>void;
    tabs:string[];
    shouldStack:boolean;
    firstStack:TabItem[];
    secondStack:TabItem[];
    initialFirstStackIndex:number;
    onFilterSelect:(filterKey:string)=>void;
    toggleHideImagesFlag:()=>void;
}

export const StackedTabBar = ({
    goToPage, 
    tabs,
    shouldStack,
    firstStack,
    secondStack,
    initialFirstStackIndex,
    onFilterSelect,
    toggleHideImagesFlag

}:StackedTabBarProps) => {

    const intl = useIntl();
    const [selectedFilterIndex, setSelectedFilterIndex] = useState(initialFirstStackIndex);
    const [selectedSecondStackIndex, setSelectedSecondStackIndex] = useState(0);

    return (
      <>
      <FilterBar
        options={firstStack.map((item, index) => {
          return tabs[index] 
            ? tabs[index] 
            : intl.formatMessage({ id: item.label.toLowerCase() }).toUpperCase()
          })
        }
         
        selectedOptionIndex={selectedFilterIndex}
        rightIconName="view-module"
        rightIconType="MaterialIcons"
        onDropdownSelect={(index)=>{
          setSelectedFilterIndex(index);

          if(index == 0 && shouldStack){
            const tabIndex = firstStack.length + selectedSecondStackIndex;
            onFilterSelect(secondStack[selectedSecondStackIndex].filterKey);
            goToPage(tabIndex)
          }else{
            onFilterSelect(firstStack[index].filterKey);
            goToPage(index);
          }

        }}
        onRightIconPress={toggleHideImagesFlag}
      />

      {
        selectedFilterIndex == 0 && shouldStack && (
          <FilterBar
            options={secondStack.map((item) =>
              intl.formatMessage({ id: item.label.toLowerCase() }).toUpperCase(),
            )}
            selectedOptionIndex={selectedSecondStackIndex}
            onDropdownSelect={(index)=>{
              setSelectedSecondStackIndex(index)
              onFilterSelect(secondStack[index].filterKey);
              goToPage(firstStack.length + index);
            }}
          />
        )
      }
      
      </>
    )
  }