import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  View,
  FlatList,
  Platform,
} from 'react-native';
import { debounce } from 'lodash';
import { TabView } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheetManager } from 'react-native-actions-sheet';
import { useIntl } from 'react-intl';
import {
  getWavesByHostQueryOptions,
  getWavesFollowingQueryOptions,
  getWavesByTagQueryOptions,
  getWavesByAccountQueryOptions,
} from '@ecency/sdk';
import {
  Comments,
  EmptyScreen,
  Header,
  PostOptionsModal,
  FabButton,
  TabBar,
} from '../../../components/index';
import styles from '../styles/wavesScreen.styles';
import { wavesQueries } from '../../../providers/queries';
import { useAppSelector } from '../../../hooks';
import { WavesHeader, WavesFeedType } from '../children/wavesHeader';
import { PostTypes } from '../../../constants/postTypes';
import { ScrollTopPopup } from '../../../components/atoms';
import { SheetNames } from '../../../navigation/sheets';
import {
  selectCurrentAccount,
  selectIsDarkTheme,
  selectIsLoggedIn,
} from '../../../redux/selectors';
import ROUTES from '../../../constants/routeNames';
import RootNavigation from '../../../navigation/rootNavigation';

const WAVES_HOST = 'ecency.waves';
const SCROLL_POPUP_THRESHOLD = 5000;

const WavesFeed = ({
  queryOptions,
  queryKey,
  listRef,
  onTagPress,
  onAuthorPress,
  onOptionsPress,
  onScrollStateChange,
  onVisibilityChange,
  isDarkTheme,
}: {
  queryOptions: ReturnType<typeof getWavesByHostQueryOptions>;
  queryKey: string;
  listRef: React.RefObject<FlatList | null>;
  onTagPress: (tag: string) => void;
  onAuthorPress: (username: string) => void;
  onOptionsPress: (content: any) => void;
  onScrollStateChange: (state: { enabled: boolean; offset: number }) => void;
  onVisibilityChange?: (api: {
    deleteWave: ({
      _permlink,
      _parent_permlink,
    }: {
      _permlink: string;
      _parent_permlink: string;
    }) => void;
  }) => void;
  isDarkTheme: boolean;
}) => {
  const wavesQuery = wavesQueries.useWavesQuery(queryOptions, WAVES_HOST);
  const blockPopupRef = useRef(false);
  const scrollOffsetRef = useRef(0);

  const scrollPopupDebounce = useMemo(
    () =>
      debounce(
        (value: boolean, offset: number) => {
          onScrollStateChange({ enabled: value, offset });
        },
        500,
        { leading: true },
      ),
    [onScrollStateChange],
  );

  useEffect(() => () => scrollPopupDebounce.cancel(), [scrollPopupDebounce]);

  const _fetchData = (fetchProps: any) => {
    if (fetchProps?.refresh) {
      wavesQuery.refresh();
    } else if (wavesQuery.hasNextPage && !wavesQuery.isFetchingNextPage) {
      wavesQuery.fetchNextPage();
    }
  };

  const _onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const scrollUp = currentOffset < scrollOffsetRef.current;
    scrollOffsetRef.current = currentOffset;

    if (currentOffset <= SCROLL_POPUP_THRESHOLD) {
      scrollPopupDebounce(false, currentOffset);
      return;
    }

    if (scrollUp && !blockPopupRef.current) {
      scrollPopupDebounce(true, currentOffset);
    } else {
      scrollPopupDebounce(false, currentOffset);
    }
  };

  const _renderListFooter = () =>
    wavesQuery.isFetchingNextPage && !wavesQuery.isRefreshing ? (
      <ActivityIndicator style={styles.listSpacing} />
    ) : (
      <View style={styles.listSpacing} />
    );

  const _renderListEmpty = () =>
    wavesQuery.isRefreshing || wavesQuery.isLoading ? <View /> : <EmptyScreen />;

  useEffect(() => {
    onVisibilityChange?.({ deleteWave: wavesQuery.deleteWave });
  }, [onVisibilityChange, wavesQuery.deleteWave]);

  return (
    <Comments
      key={queryKey}
      postType={PostTypes.WAVE}
      comments={wavesQuery.data}
      handleOnOptionsPress={onOptionsPress}
      handleCommentDelete={wavesQuery.deleteWave}
      onTagPress={onTagPress}
      onAuthorPress={onAuthorPress}
      flatListProps={{
        ref: listRef,
        onEndReached: _fetchData,
        onScroll: _onScroll,
        ListEmptyComponent: _renderListEmpty,
        ListFooterComponent: _renderListFooter,
        refreshControl: (
          <RefreshControl
            refreshing={wavesQuery.isRefreshing}
            onRefresh={() => _fetchData({ refresh: true })}
            progressBackgroundColor="#357CE6"
            tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
            titleColor="#fff"
            colors={['#fff']}
          />
        ),
      }}
    />
  );
};

const WavesScreen = () => {
  const postOptionsModalRef = useRef<any>(null);
  const forYouListRef = useRef<FlatList>(null);
  const followingListRef = useRef<FlatList>(null);
  const tagListRef = useRef<FlatList>(null);
  const authorListRef = useRef<FlatList>(null);

  const [feedType, setFeedType] = useState<WavesFeedType>('for-you');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeAuthor, setActiveAuthor] = useState<string | null>(null);
  const [enableScrollTop, setEnableScrollTop] = useState(false);
  const [lazyLoad, setLazyLoad] = useState(false);
  const activeDeleteWaveRef = useRef<
    ((args: { _permlink: string; _parent_permlink: string }) => void) | null
  >(null);

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const isDarkTheme = useAppSelector(selectIsDarkTheme);
  const insets = useSafeAreaInsets();

  const forYouQueryOptions = useMemo(() => getWavesByHostQueryOptions(WAVES_HOST), []);
  const followingQueryOptions = useMemo(
    () =>
      currentAccount?.name ? getWavesFollowingQueryOptions(WAVES_HOST, currentAccount.name) : null,
    [currentAccount?.name],
  );
  const tagQueryOptions = useMemo(
    () => (activeTag ? getWavesByTagQueryOptions(WAVES_HOST, activeTag) : null),
    [activeTag],
  );
  const authorQueryOptions = useMemo(
    () => (activeAuthor ? getWavesByAccountQueryOptions(WAVES_HOST, activeAuthor) : null),
    [activeAuthor],
  );

  const activeListRef = activeAuthor
    ? authorListRef
    : activeTag
    ? tagListRef
    : feedType === 'following'
    ? followingListRef
    : forYouListRef;

  const intl = useIntl();
  const wavesRoutes = useMemo(
    () => [
      { key: 'for-you', title: intl.formatMessage({ id: 'waves.for_you' }) },
      { key: 'following', title: intl.formatMessage({ id: 'waves.following' }) },
    ],
    [intl],
  );

  const wavesIndex = useMemo(
    () => wavesRoutes.findIndex((route) => route.key === feedType),
    [feedType, wavesRoutes],
  );

  const fabBottomOffset = Platform.OS === 'android' ? 66 + (insets.bottom || 0) : 16;

  const _lazyLoadContent = () => {
    if (!lazyLoad) {
      setTimeout(() => {
        setLazyLoad(true);
      }, 100);
    }
  };

  const _handleTabChange = (tab: WavesFeedType) => {
    if (tab === 'following' && !isLoggedIn) {
      RootNavigation.navigate({ name: ROUTES.SCREENS.LOGIN });
      return;
    }

    if (tab === feedType && !activeTag) {
      activeListRef.current?.scrollToOffset({ offset: 0, animated: false });
      setEnableScrollTop(false);
      return;
    }

    if (tab === 'following') {
      setActiveTag(null);
    }

    setEnableScrollTop(false);
    setFeedType(tab);
  };

  const _handleTagFilter = useCallback((tag: string) => {
    setFeedType((prev) => (prev === 'following' ? 'for-you' : prev));
    setEnableScrollTop(false);
    setActiveTag(tag);
  }, []);

  const _handleClearTag = useCallback(() => {
    setEnableScrollTop(false);
    setActiveTag(null);
  }, []);

  const _handleAuthorFilter = useCallback((username: string) => {
    setFeedType((prev) => (prev === 'following' ? 'for-you' : prev));
    setEnableScrollTop(false);
    setActiveTag(null);
    setActiveAuthor(username);
  }, []);

  const _handleClearAuthor = useCallback(() => {
    setEnableScrollTop(false);
    setActiveAuthor(null);
  }, []);

  const _handleOnOptionsPress = (content: any) => {
    if (postOptionsModalRef.current) {
      postOptionsModalRef.current.show(content);
    }
  };

  useEffect(() => {
    activeDeleteWaveRef.current = null;
  }, [activeTag, feedType]);

  const _onCreatePress = () => {
    SheetManager.show(SheetNames.QUICK_POST, {
      payload: { mode: 'wave' },
    });
  };

  const _scrollTop = () => {
    activeListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setEnableScrollTop(false);
  };

  const _handleScrollStateChange = ({ enabled, offset }: { enabled: boolean; offset: number }) => {
    if (offset <= SCROLL_POPUP_THRESHOLD) {
      setEnableScrollTop(false);
      return;
    }

    setEnableScrollTop(enabled);
  };

  const _renderFilterChip =
    activeTag || activeAuthor ? (
      <WavesHeader
        activeTag={activeTag}
        activeAuthor={activeAuthor}
        onClearTag={_handleClearTag}
        onClearAuthor={_handleClearAuthor}
      />
    ) : null;

  const _renderWavesScene = ({ route }: { route: { key: string } }) => {
    if (route.key === 'following') {
      if (!followingQueryOptions) {
        return <View style={styles.tabScene} />;
      }

      return (
        <View style={styles.tabScene}>
          <WavesFeed
            queryOptions={followingQueryOptions}
            queryKey={`following:${currentAccount?.name}`}
            listRef={followingListRef}
            onTagPress={_handleTagFilter}
            onAuthorPress={_handleAuthorFilter}
            onOptionsPress={_handleOnOptionsPress}
            onScrollStateChange={_handleScrollStateChange}
            onVisibilityChange={({ deleteWave }) => {
              activeDeleteWaveRef.current = deleteWave;
            }}
            isDarkTheme={isDarkTheme}
          />
        </View>
      );
    }

    if (activeAuthor && authorQueryOptions) {
      return (
        <View style={styles.tabScene}>
          {_renderFilterChip}
          <WavesFeed
            queryOptions={authorQueryOptions}
            queryKey={`author:${activeAuthor}`}
            listRef={authorListRef}
            onTagPress={_handleTagFilter}
            onAuthorPress={_handleAuthorFilter}
            onOptionsPress={_handleOnOptionsPress}
            onScrollStateChange={_handleScrollStateChange}
            onVisibilityChange={({ deleteWave }) => {
              activeDeleteWaveRef.current = deleteWave;
            }}
            isDarkTheme={isDarkTheme}
          />
        </View>
      );
    }

    if (activeTag && tagQueryOptions) {
      return (
        <View style={styles.tabScene}>
          {_renderFilterChip}
          <WavesFeed
            queryOptions={tagQueryOptions}
            queryKey={`tag:${activeTag}`}
            listRef={tagListRef}
            onTagPress={_handleTagFilter}
            onAuthorPress={_handleAuthorFilter}
            onOptionsPress={_handleOnOptionsPress}
            onScrollStateChange={_handleScrollStateChange}
            onVisibilityChange={({ deleteWave }) => {
              activeDeleteWaveRef.current = deleteWave;
            }}
            isDarkTheme={isDarkTheme}
          />
        </View>
      );
    }

    return (
      <View style={styles.tabScene}>
        <WavesFeed
          queryOptions={forYouQueryOptions}
          queryKey="for-you"
          listRef={forYouListRef}
          onTagPress={_handleTagFilter}
          onAuthorPress={_handleAuthorFilter}
          onOptionsPress={_handleOnOptionsPress}
          onScrollStateChange={_handleScrollStateChange}
          onVisibilityChange={({ deleteWave }) => {
            activeDeleteWaveRef.current = deleteWave;
          }}
          isDarkTheme={isDarkTheme}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.contentContainer} onLayout={_lazyLoadContent}>
        {lazyLoad ? (
          <TabView
            navigationState={{ index: wavesIndex, routes: wavesRoutes }}
            style={styles.tabView}
            renderTabBar={(tabProps) => (
              <TabBar
                {...tabProps}
                onTabPress={({ route, preventDefault }) => {
                  preventDefault();
                  _handleTabChange(route.key as WavesFeedType);
                }}
              />
            )}
            renderScene={_renderWavesScene}
            onIndexChange={(index) => {
              const nextFeed = wavesRoutes[index]?.key as WavesFeedType;
              if (nextFeed && nextFeed !== feedType) {
                _handleTabChange(nextFeed);
              }
            }}
            animationEnabled={false}
            lazy={true}
            swipeEnabled={isLoggedIn}
            commonOptions={{
              labelStyle: styles.tabLabelColor,
            }}
          />
        ) : null}

        <ScrollTopPopup enable={enableScrollTop} onPress={_scrollTop} />
      </View>
      <PostOptionsModal ref={postOptionsModalRef} isVisibleTranslateModal={true} isWave={true} />
      <FabButton bottomOffset={fabBottomOffset} onPress={_onCreatePress} />
    </View>
  );
};

export default WavesScreen;
