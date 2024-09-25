import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import { TabBar, TabBarProps } from 'react-native-tab-view';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useWindowDimensions, View } from 'react-native';
import { useSelector } from 'react-redux';
import { CustomiseFiltersModal, IconButton, Tag } from '../..';
import { CustomiseFiltersModalRef } from '../../customiseFiltersModal/customiseFiltersModal';
import styles from '../styles/feedTabBar.styles';
import showLoginAlert from '../../../utils/showLoginAlert';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../constants/routeNames';
import RootNavigation from '../../../navigation/rootNavigation';

interface FeedTabBarProps extends TabBarProps<any> {
  pageType?: 'main' | 'community' | 'profile' | 'ownProfile';
  routes: {
    key: string;
    title: string;
  }[];
  onFilterSelect: (filterKey: string) => void;
}

export const FeedTabBar = ({ routes, onFilterSelect, pageType, ...props }: FeedTabBarProps) => {
  const intl = useIntl();
  const layout = useWindowDimensions();
  // const navigation = useNavigation();

  const isLoggedIn = useSelector((state) => state.application.isLoggedIn);

  const customiseModalRef = useRef<CustomiseFiltersModalRef>();

  const enableCustomTabs = pageType !== undefined;

  const _onCustomisePress = () => {
    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }

    RootNavigation.navigate({
      name: ROUTES.MODALS.CUSTOMISE_FEED_TABS,
      params:{
        pageType
      }
    });

    // if (customiseModalRef.current) {
    //   customiseModalRef.current.show();
    // }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: EStyleSheet.value('$primaryLightBackground'),
      }}
    >
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
        tabStyle={{ ...styles.tabStyle, minWidth: layout.width / 3 - (enableCustomTabs ? 14 : 0) }}
        scrollEnabled={routes.length > 3}
        onTabPress={({ route }) => {
          onFilterSelect(route.key);
        }}
        {...props}
      />
      {enableCustomTabs && (
        <IconButton
          iconStyle={styles.rightIcon}
          style={styles.rightIconWrapper}
          iconType="MaterialIcon"
          size={28}
          name="add"
          onPress={_onCustomisePress}
        />
      )}
      {enableCustomTabs && <CustomiseFiltersModal pageType={pageType} ref={customiseModalRef} />}
    </View>
  );
};
