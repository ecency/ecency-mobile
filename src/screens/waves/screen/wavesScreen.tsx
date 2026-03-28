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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SheetManager } from 'react-native-actions-sheet';
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
} from '../../../components/index';
import styles from '../styles/wavesScreen.styles';
import { wavesQueries } from '../../../providers/queries';
import { useAppSelector } from '../../../hooks';
import WavesHeader from '../children/wavesHeader';
import { WavesFeedType } from '../children/wavesHeader';
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

const WavesScreen = () => {
  // refs
  const postOptionsModalRef = useRef<any>(null);
  const postsListRef = useRef<FlatList>();
  const blockPopupRef = useRef(false);
  const scrollOffsetRef = useRef(0);

  // state
  const [feedType, setFeedType] = useState<WavesFeedType>('for-you');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [enableScrollTop, setEnableScrollTop] = useState(false);

  // selectors
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const isDarkTheme = useAppSelector(selectIsDarkTheme);
  const insets = useSafeAreaInsets();

  // Build SDK query options based on active feed type and tag
  const sdkQueryOptions = useMemo(() => {
    if (activeTag) {
      return getWavesByTagQueryOptions(WAVES_HOST, activeTag);
    }
    if (feedType === 'following' && currentAccount?.name) {
      return getWavesFollowingQueryOptions(WAVES_HOST, currentAccount.name);
    }
    return getWavesByHostQueryOptions(WAVES_HOST);
  }, [feedType, activeTag, currentAccount?.name]);

  const wavesQuery = wavesQueries.useWavesQuery(sdkQueryOptions, WAVES_HOST);

  // Scroll to top when feed type or tag changes
  useEffect(() => {
    postsListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [feedType, activeTag]);

  // Calculate FAB offset to account for bottom tab bar
  const fabBottomOffset = Platform.OS === 'android' ? 66 + (insets.bottom || 0) : 16;

  const _fetchData = (fetchProps: any) => {
    if (fetchProps?.refresh) {
      wavesQuery.refresh();
    } else {
      wavesQuery.fetchNextPage();
    }
  };

  const _handleCommentDelete = ({ _permlink, _parent_permlink }: any) => {
    wavesQuery.deleteWave({
      _permlink,
      _parent_permlink,
    });
  };

  const _handleTabChange = (tab: WavesFeedType) => {
    if (tab === 'following' && !isLoggedIn) {
      RootNavigation.navigate({ name: ROUTES.SCREENS.LOGIN });
      return;
    }
    if (tab === 'following') {
      setActiveTag(null);
    }
    setFeedType(tab);
  };

  const _handleTagFilter = useCallback((tag: string) => {
    setFeedType((prev) => (prev === 'following' ? 'for-you' : prev));
    setActiveTag(tag);
  }, []);

  const _handleClearTag = useCallback(() => {
    setActiveTag(null);
  }, []);

  // scrolls to top, blocks scroll popup for 2 seconds to reappear after scroll
  const _scrollTop = () => {
    if (postsListRef.current) {
      postsListRef.current.scrollToOffset({ offset: 0 });
      setEnableScrollTop(false);
      scrollPopupDebouce.cancel();
      blockPopupRef.current = true;
      setTimeout(() => {
        blockPopupRef.current = false;
      }, 2000);
    }
  };

  // makes sure pop do not reappear while scrolling up
  const scrollPopupDebouce = debounce(
    (value) => {
      setEnableScrollTop(value);
    },
    500,
    { leading: true },
  );

  // calback to calculate with to display scroll to popup
  const _onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const scrollUp = currentOffset < scrollOffsetRef.current;
    scrollOffsetRef.current = currentOffset;

    if (scrollUp && !blockPopupRef.current && currentOffset > SCROLL_POPUP_THRESHOLD) {
      scrollPopupDebouce(true);
    }
  };

  const _handleOnOptionsPress = (content: any) => {
    if (postOptionsModalRef.current) {
      postOptionsModalRef.current.show(content);
    }
  };

  const _onCreatePress = () => {
    SheetManager.show(SheetNames.QUICK_POST, {
      payload: { mode: 'wave' },
    });
  };

  const _data = wavesQuery.data;

  const _renderListHeader = (
    <WavesHeader
      feedType={feedType}
      activeTag={activeTag}
      onTabChange={_handleTabChange}
      onClearTag={_handleClearTag}
    />
  );
  const _renderListFooter = () =>
    wavesQuery.isLoading && !wavesQuery.isRefreshing ? (
      <ActivityIndicator style={{ padding: 32 }} />
    ) : (
      <View style={{ padding: 32 }} />
    );
  const _renderListEmpty = () =>
    wavesQuery.isRefreshing || wavesQuery.isLoading ? <View /> : <EmptyScreen />;

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.contentContainer}>
        <Comments
          postType={PostTypes.WAVE}
          comments={_data}
          handleOnOptionsPress={_handleOnOptionsPress}
          handleCommentDelete={_handleCommentDelete}
          onTagPress={_handleTagFilter}
          flatListProps={{
            ref: postsListRef,
            onEndReached: _fetchData,
            onScroll: _onScroll,
            ListEmptyComponent: _renderListEmpty,
            ListFooterComponent: _renderListFooter,
            ListHeaderComponent: _renderListHeader,
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

        <ScrollTopPopup enable={enableScrollTop} onPress={_scrollTop} />
      </View>
      <PostOptionsModal ref={postOptionsModalRef} isVisibleTranslateModal={true} isWave={true} />
      <FabButton bottomOffset={fabBottomOffset} onPress={_onCreatePress} />
    </View>
  );
};

export default WavesScreen;
