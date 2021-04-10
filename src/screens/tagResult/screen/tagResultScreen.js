import React from 'react';
import { View, SafeAreaView } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { useIntl } from 'react-intl';

// Components
import { SearchInput, Posts, TabBar, TabbedPosts } from '../../../components';

// Styles
import styles from './tagResultStyles';
import globalStyles from '../../../globalStyles';

import { GLOBAL_POST_FILTERS, GLOBAL_POST_FILTERS_VALUE } from '../../../constants/options/filters';

const TagResultScreen = ({ navigation }) => {
  const tag = navigation.getParam('tag', '');
  const filter = navigation.getParam('filter', '');

  const intl = useIntl();

  const _navigationGoBack = () => {
    navigation.goBack();
  };

  const _renderTabbar = () => (
    <TabBar
      style={styles.tabbar}
      tabUnderlineDefaultWidth={80}
      tabUnderlineScaleX={2}
      tabBarPosition="overlayTop"
    />
  );

  const _getSelectedIndex = () => {
    if (filter) {
      const selectedIndex = GLOBAL_POST_FILTERS_VALUE.indexOf(filter);
      if (selectedIndex > 0) {
        return selectedIndex;
      }
    }
    return 0;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <SearchInput
          handleOnModalClose={_navigationGoBack}
          placeholder={`#${tag}`}
          editable={false}
        />
      </SafeAreaView>
      {/* <ScrollableTabView style={globalStyles.tabView} renderTabBar={_renderTabbar}> */}
      <View style={styles.tabbarItem}>
        <TabbedPosts
          key={tag}
          filterOptions={GLOBAL_POST_FILTERS}
          filterOptionsValue={GLOBAL_POST_FILTERS_VALUE}
          selectedOptionIndex={_getSelectedIndex()}
          tag={tag}
        />
      </View>
      {/* </View></ScrollableTabView> */}
    </View>
  );
};

export default TagResultScreen;
