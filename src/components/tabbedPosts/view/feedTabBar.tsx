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
  pageType?: 'main' | 'community' | 'profile' | 'ownProfile';
  routes: {
    key: string;
    title: string
  }[],
  initialFirstStackIndex: number;
  onFilterSelect: (filterKey: string) => void;
}

export const FeedTabBar = ({
  routes,
  initialFirstStackIndex,
  onFilterSelect,
  pageType,
  ...props
}: FeedTabBarProps) => {

  const intl = useIntl();
  const layout = useWindowDimensions();

  const customiseModalRef = useRef<CustomiseFiltersModalRef>();

  const enableCustomTabs = pageType !== undefined;

  const _onCustomisePress = () => {
    if (customiseModalRef.current) {
      customiseModalRef.current.show();
    }
  };


  return (

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
        tabStyle={{ ...styles.tabStyle, minWidth: (layout.width / 3) - (enableCustomTabs ? 14 : 0) }}
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
      {enableCustomTabs && <CustomiseFiltersModal pageType={pageType} ref={customiseModalRef} />}
    </View>

  );
};
