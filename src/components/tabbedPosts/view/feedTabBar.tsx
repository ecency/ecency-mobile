import React, { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { CustomiseFiltersModal, FilterBar, IconButton, Tag } from '../..';
import { setHidePostsThumbnails } from '../../../redux/actions/applicationActions';
import { CustomiseFiltersModalRef } from '../../customiseFiltersModal/customiseFiltersModal';
import { TabBar, TabBarProps } from 'react-native-tab-view';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Text, useWindowDimensions, View } from 'react-native';
import styles from '../styles/feedTabBar.styles';

export interface TabItem {
  filterKey: string;
  label: string;
}

interface FeedTabBarProps extends TabBarProps<any> {
  goToPage: (pageIndex) => void;
  tabs: string[];
  pageType?: 'main' | 'community' | 'profile' | 'ownProfile';
  routes: {
    key: string;
    title: string
  }[],
  initialFirstStackIndex: number;
  onFilterSelect: (filterKey: string) => void;
  toggleHideImagesFlag: boolean;
}

export const FeedTabBar = ({
  goToPage,
  tabs,
  routes,
  initialFirstStackIndex,
  onFilterSelect,
  toggleHideImagesFlag,
  pageType,
  ...props
}: FeedTabBarProps) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const layout = useWindowDimensions();

  const customiseModalRef = useRef<CustomiseFiltersModalRef>();

  // redux properties
  const isHideImages = useSelector((state) => state.application.hidePostsThumbnails);

  const [selectedFilterIndex, setSelectedFilterIndex] = useState(initialFirstStackIndex);
  const [selectedSecondStackIndex, setSelectedSecondStackIndex] = useState(0);

  const enableCustomTabs = pageType !== undefined;

  const _onCustomisePress = () => {
    if (customiseModalRef.current) {
      customiseModalRef.current.show();
    }
  };

  const _onToggleImagesPress = () => {
    dispatch(setHidePostsThumbnails(!isHideImages));
  };

  return (
    <>
      {/* <FilterBar
        options={firstStack.map((item, index) => {
          return tabs[index]
            ? tabs[index]
            : intl.formatMessage({ id: item.label.toLowerCase() }).toUpperCase();
        })}
        selectedOptionIndex={selectedFilterIndex}
        rightIconName={toggleHideImagesFlag && 'view-module'}
        rightIconType={toggleHideImagesFlag && 'MaterialIcons'}
        enableCustomiseButton={enableCustomTabs}
        onCustomisePress={_onCustomisePress}
        onDropdownSelect={(index) => {
          setSelectedFilterIndex(index);

          if (index == 0 && shouldStack) {
            const tabIndex = firstStack.length + selectedSecondStackIndex;
            onFilterSelect(secondStack[selectedSecondStackIndex].filterKey);
            goToPage(tabIndex);
          } else {
            onFilterSelect(firstStack[index].filterKey);
            goToPage(index);
          }
        }}
        onRightIconPress={_onToggleImagesPress}
      />

      {selectedFilterIndex == 0 && shouldStack && (
        <FilterBar
          options={secondStack.map((item) =>
            intl.formatMessage({ id: item.label.toLowerCase() }).toUpperCase(),
          )}
          selectedOptionIndex={selectedSecondStackIndex}
          onDropdownSelect={(index) => {
            setSelectedSecondStackIndex(index);
            onFilterSelect(secondStack[index].filterKey);
            goToPage(firstStack.length + index);
          }}
        />
      )} */}

      <View style={{
        flexDirection: 'row',
        alignItems: 'center', backgroundColor: EStyleSheet.value("$primaryLightBackground")
      }} >

        <TabBar
          renderLabel={({ route, focused }) => (
            <Tag
              key={route.key}
              value={intl.formatMessage({ id: route.title.toLowerCase() }).toUpperCase()}
              isFilter
              isPin={focused}
            />

          )}
          style={styles.tabBarStyle}
          indicatorStyle={styles.indicatorStyle}
          tabStyle={{ ...styles.tabStyle, width: routes.length > 3 ? 'auto' : undefined }}
          scrollEnabled={routes.length > 3}
          onTabPress={({ route }) => {
            onFilterSelect(route.key)
          }}
          {...props}
        />
        {enableCustomTabs &&
          <IconButton
            iconStyle={styles.rightIcon}
            style={styles.rightIconWrapper}
            iconType="MaterialIcon"
            size={28}
            name="add"
            onPress={_onCustomisePress}
          />
        }

      </View>
      {enableCustomTabs && <CustomiseFiltersModal pageType={pageType} ref={customiseModalRef} />}
    </>
  );
};
