import React, { useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { useIntl } from 'react-intl';
import { debounce } from 'lodash';

// Components
import { SearchInput, Posts, TabBar, TabbedPosts, IconButton } from '../../../components';

// Styles
import styles from './tagResultStyles';
import globalStyles from '../../../globalStyles';

import { GLOBAL_POST_FILTERS, GLOBAL_POST_FILTERS_VALUE } from '../../../constants/options/filters';

const TagResultScreen = ({ navigation }) => {
  const initTag = navigation.getParam('tag', '');
  const filter = navigation.getParam('filter', '');

  const [tag, setTag] = useState(initTag);

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

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.headerContainer}>
          <View style={{ flex: 1, marginTop: 20 }}>
            <IconButton
              iconType="MaterialIcons"
              name="arrow-back"
              iconStyle={styles.backIcon}
              onPress={_navigationGoBack}
            />
          </View>
          <View style={{ flex: 16 }}>
            <SearchInput
              showClearButton={true}
              onBackPress={_navigationGoBack}
              editable={true}
              onChangeText={_setTag}
              value={tag}
              prefix="#"
            />
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.tabbarItem}>
        <TabbedPosts
          key={tag}
          filterOptions={GLOBAL_POST_FILTERS}
          filterOptionsValue={GLOBAL_POST_FILTERS_VALUE}
          selectedOptionIndex={_getSelectedIndex()}
          tag={tag}
        />
      </View>
    </View>
  );
};

export default TagResultScreen;
