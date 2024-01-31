import React, { memo, useState } from 'react';
import { View } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { useIntl } from 'react-intl';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import useDebounce from '../../../utils/useDebounceHook';

// Components
import { SearchInput, TabBar } from '../../../components';
import Communities from './tabs/communities/view/communitiesResults';
import PostsResults from './tabs/best/view/postsResults';
import TopicsResults from './tabs/topics/view/topicsResults';
import PeopleResults from './tabs/people/view/peopleResults';

// Styles
import styles from './searchResultStyles';
import globalStyles from '../../../globalStyles';

const SearchResultScreen = ({ navigation }) => {
  const intl = useIntl();
  const { debounce } = useDebounce();

  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const _handleChangeText = (value) => {
    setSearchInputValue(value);
  };

  const _handleSearchValue = (value) => {
    setSearchValue(value);
  };

  // custom debounce to debounce search value but updates search input value instantly
  // fixes character missing bug due to lodash debounce
  const debouncedSearch = debounce(_handleSearchValue, _handleChangeText, 1000);

  const _navigationGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <SearchInput
        showClearButton={true}
        placeholder={intl.formatMessage({ id: 'header.search' })}
        onChangeText={debouncedSearch}
        value={searchInputValue}
        backEnabled={true}
        onBackPress={_navigationGoBack}
      />
      <SearchResultsTabView searchValue={searchValue} />
    </View>
  );
};

const SearchResultsTabView = memo(({ searchValue }: { searchValue: string }) => {
  const intl = useIntl();

  const clippedSearchValue =
    searchValue.startsWith('#') || searchValue.startsWith('@')
      ? searchValue.substring(1)
      : searchValue;
  const isUsername = !!(searchValue.startsWith('#') || searchValue.startsWith('@'));

  const _renderTabbar = () => (
    <TabBar
      style={styles.tabbar}
      tabUnderlineDefaultWidth={80}
      tabUnderlineScaleX={2}
      tabBarPosition="overlayTop"
      textStyle={styles.tabBarText}
    />
  );

  return (
    <ScrollableTabView
      style={globalStyles.tabView}
      renderTabBar={_renderTabbar}
      prerenderingSiblingsNumber={Infinity}
    >
      <View
        tabLabel={intl.formatMessage({ id: 'search_result.best.title' })}
        style={styles.tabbarItem}
      >
        <PostsResults searchValue={clippedSearchValue} />
      </View>
      <View
        tabLabel={intl.formatMessage({ id: 'search_result.people.title' })}
        style={styles.tabbarItem}
      >
        <PeopleResults searchValue={clippedSearchValue} isUsername={isUsername} />
      </View>
      <View
        tabLabel={intl.formatMessage({ id: 'search_result.topics.title' })}
        style={styles.tabbarItem}
      >
        <TopicsResults searchValue={clippedSearchValue} />
      </View>
      <View
        tabLabel={intl.formatMessage({ id: 'search_result.communities.title' })}
        style={styles.tabbarItem}
      >
        <Communities searchValue={clippedSearchValue} />
      </View>
    </ScrollableTabView>
  );
});

export default gestureHandlerRootHOC(SearchResultScreen);
