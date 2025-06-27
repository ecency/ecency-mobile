import React, { memo, useState } from 'react';
import { View } from 'react-native';
import { useIntl } from 'react-intl';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { TabView } from 'react-native-tab-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import useDebounce from '../../../utils/useDebounceHook';

// Components
import { SearchInput, TabBar } from '../../../components';
import Communities from './tabs/communities/view/communitiesResults';
import PostsResults from './tabs/best/view/postsResults';
// import TopicsResults from './tabs/topics/view/topicsResults';
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
  const debouncedSearch = debounce(_handleSearchValue, _handleChangeText, 500);

  const _navigationGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <SearchInput
        showClearButton={true}
        placeholder={intl.formatMessage({ id: 'header.search' })}
        onChangeText={debouncedSearch}
        value={searchInputValue}
        backEnabled={true}
        onBackPress={_navigationGoBack}
      />
      <SearchResultsTabView searchValue={searchValue} />
    </SafeAreaView>
  );
};

const SearchResultsTabView = memo(({ searchValue }: { searchValue: string }) => {
  const intl = useIntl();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: 'posts',
      title: intl.formatMessage({
        id: 'search_result.best.title',
      }),
    },
    {
      key: 'people',
      title: intl.formatMessage({
        id: 'search_result.people.title',
      }),
    },
    // TOOD: removed topics tab uptill tags search api is resolved
    // {
    //   key: 'topics',
    //   title: intl.formatMessage({
    //     id: 'search_result.topics.title',
    //   }),
    // },
    {
      key: 'communities',
      title: intl.formatMessage({
        id: 'search_result.communities.title',
      }),
    },
  ]);

  const clippedSearchValue =
    searchValue.startsWith('#') || searchValue.startsWith('@')
      ? searchValue.substring(1).trim().toLowerCase()
      : searchValue.trim().toLowerCase();
  const isUsername = !!(searchValue.startsWith('#') || searchValue.startsWith('@'));

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'posts':
        return (
          <View style={styles.tabbarItem}>
            <PostsResults searchValue={clippedSearchValue} />
          </View>
        );
      case 'people':
        return (
          <View style={styles.tabbarItem}>
            <PeopleResults searchValue={clippedSearchValue} isUsername={isUsername} />
          </View>
        );
      // TOOD: removed topics tab uptill tags search api is resolved
      // case 'topics':
      //   return (
      //     <View style={styles.tabbarItem}>
      //       <TopicsResults searchValue={clippedSearchValue} />
      //     </View>
      //   );
      case 'communities':
        return (
          <View style={styles.tabbarItem}>
            <Communities searchValue={clippedSearchValue} />
          </View>
        );
    }
  };

  return (
    <TabView
      style={globalStyles.tabView}
      renderTabBar={TabBar}
      renderScene={renderScene}
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      commonOptions={{
        labelStyle: styles.tabLabelColor,
      }}
    />
  );
});

export default gestureHandlerRootHOC(SearchResultScreen);
