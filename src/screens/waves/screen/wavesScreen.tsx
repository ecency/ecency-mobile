import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

const SCROLL_POPUP_THRESHOLD = 5000;

type DeleteWaveFn = (args: {
  _permlink: string;
  _parent_permlink: string;
  _parent_author?: string;
}) => Promise<void>;

const WavesFeed = ({
  buildQueryOptions,
  queryKey,
  listRef,
  onTagPress,
  onOptionsPress,
  onScrollStateChange,
  feedKey,
  registerDeleter,
  isDarkTheme,
}: {
  /**
   * Builds the SDK query options for a given waves container host. Invoked
   * once per host (primary + fallback) inside `useWavesQuery`.
   */
  buildQueryOptions: Parameters<typeof wavesQueries.useWavesQuery>[0];
  queryKey: string;
  listRef: React.RefObject<FlatList | null>;
  onTagPress: (tag: string) => void;
  onOptionsPress: (content: any) => void;
  onScrollStateChange: (state: { enabled: boolean; offset: number }) => void;
  /**
   * Stable identifier (e.g., "for-you" / "following" / "tag") under which
   * this feed publishes its `deleteWave` into the parent's deleter map. Each
   * feed owns its own slot, so simultaneously mounted feeds (TabView keeps
   * both tabs alive once visited) don't overwrite each other's deleter.
   */
  feedKey: string;
  /**
   * Stable register/unregister callback. Must be `useCallback`-stable in the
   * parent — otherwise this feed's registration effect would re-fire on
   * every parent render and clobber whichever feed happens to render last.
   */
  registerDeleter: (key: string, deleter: DeleteWaveFn | null) => void;
  isDarkTheme: boolean;
}) => {
  const wavesQuery = wavesQueries.useWavesQuery(buildQueryOptions);
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
    // Each feed writes to its own slot in the parent's deleter map; on
    // unmount (or feedKey change) it removes its slot. The previous design
    // pushed into a single shared ref, which both feeds clobbered on every
    // parent render once both tabs were mounted.
    registerDeleter(feedKey, wavesQuery.deleteWave);
    return () => registerDeleter(feedKey, null);
  }, [feedKey, registerDeleter, wavesQuery.deleteWave]);

  return (
    <Comments
      key={queryKey}
      postType={PostTypes.WAVE}
      comments={wavesQuery.data}
      handleOnOptionsPress={onOptionsPress}
      handleCommentDelete={wavesQuery.deleteWave}
      onTagPress={onTagPress}
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

  const [feedType, setFeedType] = useState<WavesFeedType>('for-you');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [enableScrollTop, setEnableScrollTop] = useState(false);
  const [lazyLoad, setLazyLoad] = useState(false);
  // Map of feedKey → that feed's `deleteWave`. A Map instead of a single
  // ref because both TabView tabs stay mounted once visited; each feed
  // owns its own slot so simultaneously mounted feeds don't clobber each
  // other. At delete time we look up by the *currently active* feedKey
  // (derived below) rather than by render order.
  const feedDeletersRef = useRef<Map<string, DeleteWaveFn>>(new Map());

  const _registerFeedDeleter = useCallback((key: string, deleter: DeleteWaveFn | null) => {
    if (deleter) {
      feedDeletersRef.current.set(key, deleter);
    } else {
      feedDeletersRef.current.delete(key);
    }
  }, []);

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const isDarkTheme = useAppSelector(selectIsDarkTheme);
  const insets = useSafeAreaInsets();

  // Per-host query-option builders. `useWavesQuery` invokes each one for both
  // the primary (hive.flow) and fallback (ecency.waves) container hosts, so
  // each feed flavour is requested from both accounts and chained.
  const buildForYouQueryOptions = useCallback(
    (host: string) => getWavesByHostQueryOptions(host),
    [],
  );
  const buildFollowingQueryOptions = useCallback(
    (host: string) => getWavesFollowingQueryOptions(host, currentAccount?.name ?? ''),
    [currentAccount?.name],
  );
  const buildTagQueryOptions = useCallback(
    (host: string) => getWavesByTagQueryOptions(host, activeTag ?? ''),
    [activeTag],
  );

  const activeListRef = activeTag
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

  const _handleOnOptionsPress = (content: any) => {
    if (postOptionsModalRef.current) {
      postOptionsModalRef.current.show(content);
    }
  };

  // Each WavesFeed registers/unregisters its slot in `feedDeletersRef`
  // via its mount/unmount effect, so no parent-level tab-change cleanup
  // is needed — the previous code zeroed a single shared ref defensively,
  // which is now obsolete with the per-feed Map.

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

  const _renderFilterChip = activeTag ? (
    <WavesHeader activeTag={activeTag} onClearTag={_handleClearTag} />
  ) : null;

  const _renderWavesScene = ({ route }: { route: { key: string } }) => {
    if (route.key === 'following') {
      if (!currentAccount?.name) {
        return <View style={styles.tabScene} />;
      }

      return (
        <View style={styles.tabScene}>
          <WavesFeed
            buildQueryOptions={buildFollowingQueryOptions}
            queryKey={`following:${currentAccount?.name}`}
            listRef={followingListRef}
            onTagPress={_handleTagFilter}
            onOptionsPress={_handleOnOptionsPress}
            onScrollStateChange={_handleScrollStateChange}
            feedKey="following"
            registerDeleter={_registerFeedDeleter}
            isDarkTheme={isDarkTheme}
          />
        </View>
      );
    }

    if (activeTag) {
      return (
        <View style={styles.tabScene}>
          {_renderFilterChip}
          <WavesFeed
            buildQueryOptions={buildTagQueryOptions}
            queryKey={`tag:${activeTag}`}
            listRef={tagListRef}
            onTagPress={_handleTagFilter}
            onOptionsPress={_handleOnOptionsPress}
            onScrollStateChange={_handleScrollStateChange}
            feedKey="tag"
            registerDeleter={_registerFeedDeleter}
            isDarkTheme={isDarkTheme}
          />
        </View>
      );
    }

    return (
      <View style={styles.tabScene}>
        <WavesFeed
          buildQueryOptions={buildForYouQueryOptions}
          queryKey="for-you"
          listRef={forYouListRef}
          onTagPress={_handleTagFilter}
          onOptionsPress={_handleOnOptionsPress}
          onScrollStateChange={_handleScrollStateChange}
          feedKey="for-you"
          registerDeleter={_registerFeedDeleter}
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
      <PostOptionsModal
        ref={postOptionsModalRef}
        isVisibleTranslateModal={true}
        isWave={true}
        onDelete={async (content) => {
          // Route the options-menu delete through the *currently active*
          // feed's `wavesQuery.deleteWave`, which both broadcasts the
          // delete and removes the wave from the waves infinite-query
          // cache for THAT feed. The modal's default path uses
          // `navigation.goBack()` and never updates the cache.
          //
          // Awaited so any future rejection propagates back to
          // PostOptionsModal's onDelete try/catch (today the SDK delete
          // hook swallows its own errors and shows its own toast, but the
          // contract should stay forward-compatible).
          const activeFeedKey = activeTag ? 'tag' : feedType;
          const deleteWave = feedDeletersRef.current.get(activeFeedKey);
          if (deleteWave) {
            await deleteWave({
              _permlink: content.permlink,
              _parent_permlink: content.parent_permlink,
              _parent_author: content.parent_author,
            });
            return;
          }

          // No deleter registered for the active feed (scene not yet
          // lazy-loaded or torn down between tap and confirm). Don't
          // silently swallow the confirmed delete — tell the user and log
          // so we can spot it.
          console.warn(
            'wavesScreen: no deleter registered for active feed; cannot delete',
            activeFeedKey,
            content.permlink,
          );
          Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
        }}
      />
      <FabButton bottomOffset={fabBottomOffset} onPress={_onCreatePress} />
    </View>
  );
};

export default WavesScreen;
