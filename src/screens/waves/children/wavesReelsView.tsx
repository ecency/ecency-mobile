import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  LayoutChangeEvent,
  ListRenderItem,
  RefreshControl,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { useIntl } from 'react-intl';
import { SheetManager } from 'react-native-actions-sheet';
import { ShortsFeedEntry } from '@ecency/sdk';

import { UpvotePopover } from '../../../components';
import { PostTypes } from '../../../constants/postTypes';
import { SheetNames } from '../../../navigation/sheets';
import { shortsQueries } from '../../../providers/queries';
import WavesReelItem from './wavesReelItem';
import styles from '../styles/wavesReels.styles';

interface Props {
  observer?: string;
  isDarkTheme: boolean;
  // Shared with wavesScreen's active-list ref so re-tapping the Shorts tab
  // scrolls the reels back to the top, like the other feed tabs.
  listRef?: React.RefObject<FlatList<ShortsFeedEntry> | null>;
  // True only while the Shorts tab is the active, on-screen tab. When false
  // (switched to another waves tab or off the Waves screen) no reel is active,
  // so the video player unmounts and stops playing instead of running hidden.
  focused?: boolean;
}

// A reel counts as "the one in view" once it covers most of the viewport, so the
// active video (and its autoplay) tracks the page the user has snapped to.
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 80 };

const keyOf = (item: ShortsFeedEntry) => `${item.author}/${item.permlink}`;

const WavesReelsView = ({ observer, isDarkTheme, listRef, focused = true }: Props) => {
  const intl = useIntl();
  const shortsQuery = shortsQueries.useShortsQuery(observer);
  const upvotePopoverRef = useRef<any>(null);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [viewHeight, setViewHeight] = useState(() => Dimensions.get('window').height);

  const { data } = shortsQuery;

  const _onLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && height !== viewHeight) {
      setViewHeight(height);
    }
  };

  // Kept in a ref because FlatList forbids changing onViewableItemsChanged on
  // the fly; setActiveKey is stable so the callback never needs to change.
  const _onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0]?.item as ShortsFeedEntry | undefined;
    if (first) {
      setActiveKey(keyOf(first));
    }
  }).current;

  const _onUpvotePress = useCallback(
    ({
      content,
      sourceRef,
      onVotingStart,
    }: {
      content: any;
      sourceRef: React.RefObject<any>;
      onVotingStart: (status: number) => void;
    }) => {
      upvotePopoverRef.current?.showPopover({
        sourceRef,
        content,
        postType: PostTypes.WAVE,
        onVotingStart,
      });
    },
    [],
  );

  const _onReplyPress = useCallback((content: any) => {
    SheetManager.show(SheetNames.QUICK_POST, {
      payload: { mode: 'comment', parentPost: content },
    });
  }, []);

  const _onTipPress = useCallback((content: any) => {
    SheetManager.show(SheetNames.TIPPING_DIALOG, {
      payload: { post: content },
    });
  }, []);

  const _renderItem = useCallback<ListRenderItem<ShortsFeedEntry>>(
    ({ item }) => (
      <WavesReelItem
        item={item}
        height={viewHeight}
        active={focused && activeKey === keyOf(item)}
        onUpvotePress={_onUpvotePress}
        onReplyPress={_onReplyPress}
        onTipPress={_onTipPress}
      />
    ),
    [focused, viewHeight, activeKey, _onUpvotePress, _onReplyPress, _onTipPress],
  );

  const _getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: viewHeight,
      offset: viewHeight * index,
      index,
    }),
    [viewHeight],
  );

  const _onEndReached = () => {
    if (shortsQuery.hasNextPage && !shortsQuery.isFetchingNextPage) {
      shortsQuery.fetchNextPage();
    }
  };

  const _renderFooter = () =>
    shortsQuery.isFetchingNextPage && !shortsQuery.isRefreshing ? (
      <View style={styles.footer}>
        <ActivityIndicator color="#fff" />
      </View>
    ) : null;

  const _renderEmpty = () => {
    if (shortsQuery.isLoading || shortsQuery.isRefreshing) {
      return (
        <View style={[styles.emptyWrapper, { height: viewHeight }]}>
          <ActivityIndicator color="#fff" />
        </View>
      );
    }
    return (
      <View style={[styles.emptyWrapper, { height: viewHeight }]}>
        <Text style={styles.emptyText}>
          {intl.formatMessage({
            id: 'waves.shorts_empty',
            defaultMessage: 'No shorts to show yet',
          })}
        </Text>
      </View>
    );
  };

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={shortsQuery.isRefreshing}
        onRefresh={shortsQuery.refresh}
        tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
        colors={['#fff']}
      />
    ),
    [shortsQuery.isRefreshing, shortsQuery.refresh, isDarkTheme],
  );

  return (
    <View style={styles.container} onLayout={_onLayout}>
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={keyOf}
        renderItem={_renderItem}
        // Re-render cells when the active reel or tab-focus changes so the
        // previously-active reel actually tears its player down.
        extraData={`${focused}:${activeKey}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        getItemLayout={_getItemLayout}
        onViewableItemsChanged={_onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onEndReached={_onEndReached}
        onEndReachedThreshold={1.5}
        windowSize={3}
        maxToRenderPerBatch={2}
        initialNumToRender={1}
        refreshControl={refreshControl}
        ListEmptyComponent={_renderEmpty}
        ListFooterComponent={_renderFooter}
      />
      <UpvotePopover ref={upvotePopoverRef} />
    </View>
  );
};

export default WavesReelsView;
