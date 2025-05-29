import React, { useState } from 'react';
import { View } from 'react-native';
import { debounce } from 'lodash';

// Components
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { TabItem } from 'components/tabbedPosts/types/tabbedPosts.types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchInput, TabbedPosts } from '../../../components';

// Styles
import styles from './tagResultStyles';

import { GLOBAL_POST_FILTERS, GLOBAL_POST_FILTERS_VALUE } from '../../../constants/options/filters';

const TagResultScreen = ({ navigation, route }) => {
  const initTag = route.params?.tag ?? '';
  const filter = route.params?.filter ?? '';

  const [tag, setTag] = useState(initTag.trim());

  const _navigationGoBack = () => {
    navigation.goBack();
  };

  const _setTag = debounce((tag) => {
    setTag(tag);
  }, 1000);

  const _getSelectedIndex = () => {
    if (filter) {
      const selectedIndex = GLOBAL_POST_FILTERS_VALUE.indexOf(filter);
      if (selectedIndex > 0) {
        return selectedIndex;
      }
    }
    return 0;
  };

  const tabFilters = GLOBAL_POST_FILTERS_VALUE.map(
    (key, index) =>
      ({
        filterKey: key,
        label: GLOBAL_POST_FILTERS[index],
      } as TabItem),
  );

  return (
    <SafeAreaView style={styles.container}>
      <SearchInput
        showClearButton={true}
        autoFocus={false}
        onChangeText={_setTag}
        value={tag}
        prefix="#"
        backEnabled={true}
        onBackPress={_navigationGoBack}
      />

      <View style={styles.tabbarItem}>
        <TabbedPosts
          key={tag}
          tabFilters={tabFilters}
          selectedOptionIndex={_getSelectedIndex()}
          tag={tag}
        />
      </View>
    </SafeAreaView>
  );
};

export default gestureHandlerRootHOC(TagResultScreen);
