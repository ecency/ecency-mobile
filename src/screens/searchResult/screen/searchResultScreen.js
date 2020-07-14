import React, { useState, useEffect } from 'react';
import { View, SafeAreaView } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { useIntl } from 'react-intl';

// Components
import { SearchInput, TabBar } from '../../../components';
import Communities from './communities';
import PostResult from './postResult';
import OtherResult from './otherResults';

// Styles
import styles from './searchResultStyles';
import globalStyles from '../../../globalStyles';

const SearchResultScreen = ({ navigation }) => {
  const [searchValue, setSearchValue] = useState('');
  const [text, setText] = useState('');
  const intl = useIntl();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchValue(text);
    }, 100);

    return () => clearTimeout(delayDebounceFn);
  }, [text]);

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

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <SearchInput
          handleOnModalClose={_navigationGoBack}
          placeholder="Search"
          onChangeText={setText}
        />
      </SafeAreaView>
      <ScrollableTabView
        style={globalStyles.tabView}
        renderTabBar={_renderTabbar}
        prerenderingSiblingsNumber={Infinity}
      >
        <View tabLabel="Communities" style={styles.tabbarItem}>
          <Communities searchValue={searchValue} />
        </View>
        <View tabLabel={intl.formatMessage({ id: 'search.posts' })} style={styles.tabbarItem}>
          <PostResult searchValue={searchValue} />
        </View>
        <View tabLabel="Others" style={styles.tabbarItem}>
          <OtherResult searchValue={searchValue} />
        </View>
      </ScrollableTabView>
    </View>
  );
};

export default SearchResultScreen;
