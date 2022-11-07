import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { debounce } from 'lodash';

// Components
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { SearchInput, TabbedPosts } from '../../../components';

// Styles
import styles from './tagResultStyles';

import { GLOBAL_POST_FILTERS, GLOBAL_POST_FILTERS_VALUE } from '../../../constants/options/filters';

const TagResultScreen = ({ navigation, route }) => {
  const initTag = route.params?.tag ?? '';
  const filter = route.params?.filter ?? '';

  const [tag, setTag] = useState(initTag);

  const _navigationGoBack = () => {
    navigation.goBack();
  };

  // change state of tag when component initially mounts and value of initTag changes
  useEffect(() => {
    setTag(initTag);
  }, [initTag]);

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

  return (
    <View style={styles.container}>
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
          filterOptions={GLOBAL_POST_FILTERS}
          filterOptionsValue={GLOBAL_POST_FILTERS_VALUE}
          selectedOptionIndex={_getSelectedIndex()}
          tag={tag}
          imagesToggleEnabled={true}
        />
      </View>
    </View>
  );
};

export default gestureHandlerRootHOC(TagResultScreen);
