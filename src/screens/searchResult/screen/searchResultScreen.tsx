import React, { memo, useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useIntl } from 'react-intl';
import { SheetManager } from 'react-native-actions-sheet';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { TabView } from 'react-native-tab-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import useDebounce from '../../../utils/useDebounceHook';

// Components
import { IconButton, SearchInput, TabBar } from '../../../components';
import {
  activeSearchFilterCount,
  EMPTY_SEARCH_FILTERS,
  type SearchFilters,
} from '../../../components/searchFiltersSheet';
import { SheetNames } from '../../../navigation/sheets';
import Communities from './tabs/communities/view/communitiesResults';
import PostsResults from './tabs/best/view/postsResults';
// import TopicsResults from './tabs/topics/view/topicsResults';
import PeopleResults from './tabs/people/view/peopleResults';

// Styles
import styles from './searchResultStyles';
import globalStyles from '../../../globalStyles';

// A leading @ or # is a prefix for the people and topics tabs, not part of the
// term. Shared so the filters sheet can measure exactly what will be sent.
const clipSearchValue = (value: string) =>
  value.startsWith('#') || value.startsWith('@')
    ? value.substring(1).trim().toLowerCase()
    : value.trim().toLowerCase();

const SearchResultScreen = ({ navigation }) => {
  const intl = useIntl();
  const { debounce } = useDebounce();

  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_SEARCH_FILTERS);

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

  // Only the posts tab is filtered, so the button lives with the search bar and
  // reports how many filters are set rather than which.
  // Compare against the defaults rather than truthiness: type defaults to
  // Posts, so counting its value directly lights the icon before any change.
  const activeFilterCount = activeSearchFilterCount(filters);

  const _openFilters = useCallback(async () => {
    const result = await SheetManager.show(SheetNames.SEARCH_FILTERS, {
      // The live input, not the debounced value: opening the sheet inside the
      // 500ms window would otherwise validate the previous text, and the API's
      // length cap covers the whole q string, filters included.
      payload: { filters, searchValue: clipSearchValue(searchInputValue) },
    });

    // Gate on `filters` being an object, never on truthiness: a backdrop,
    // swipe or back dismissal resolves the original payload object, which is
    // truthy, so `if (result)` would read a cancel as an apply.
    if (result && typeof result === 'object' && result.filters) {
      setFilters(result.filters);
    }
  }, [filters, searchInputValue]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <SearchInput
            showClearButton={true}
            placeholder={intl.formatMessage({ id: 'header.search' })}
            onChangeText={debouncedSearch}
            value={searchInputValue}
            backEnabled={true}
            onBackPress={_navigationGoBack}
          />
        </View>
        <IconButton
          style={styles.filterButton}
          iconStyle={styles.filterIcon}
          iconType="MaterialCommunityIcons"
          name={activeFilterCount > 0 ? 'filter' : 'filter-outline'}
          size={22}
          onPress={_openFilters}
          accessibilityLabel={intl.formatMessage({ id: 'search_result.filters.open' })}
        />
      </View>
      <SearchResultsTabView searchValue={searchValue} filters={filters} />
    </SafeAreaView>
  );
};

const SearchResultsTabView = memo(
  ({ searchValue, filters }: { searchValue: string; filters: SearchFilters }) => {
    const intl = useIntl();
    const [index, setIndex] = React.useState(0);
    const postsListRef = React.useRef<FlatList>(null);
    const peopleListRef = React.useRef<FlatList>(null);
    const communitiesListRef = React.useRef<FlatList>(null);
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

    const clippedSearchValue = clipSearchValue(searchValue);
    const isUsername = !!(searchValue.startsWith('#') || searchValue.startsWith('@'));

    const renderScene = ({ route }) => {
      switch (route.key) {
        case 'posts':
          return (
            <View style={styles.tabbarItem}>
              <PostsResults
                searchValue={clippedSearchValue}
                filters={filters}
                listRef={postsListRef}
              />
            </View>
          );
        case 'people':
          return (
            <View style={styles.tabbarItem}>
              <PeopleResults
                searchValue={clippedSearchValue}
                isUsername={isUsername}
                listRef={peopleListRef}
              />
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
              <Communities searchValue={clippedSearchValue} listRef={communitiesListRef} />
            </View>
          );
      }
    };

    return (
      <TabView
        style={globalStyles.tabView}
        renderTabBar={(tabProps) => (
          <TabBar
            {...tabProps}
            onTabPress={({ route }) => {
              const listRef =
                route.key === 'people'
                  ? peopleListRef
                  : route.key === 'communities'
                  ? communitiesListRef
                  : postsListRef;
              listRef.current?.scrollToOffset({ offset: 0, animated: true });
            }}
          />
        )}
        renderScene={renderScene}
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        commonOptions={{
          labelStyle: styles.tabLabelColor,
        }}
      />
    );
  },
);

export default gestureHandlerRootHOC(SearchResultScreen);
