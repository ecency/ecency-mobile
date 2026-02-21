import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect,
  Fragment,
  useMemo,
  useCallback,
} from 'react';
import { FlatListProps, RefreshControl, ActivityIndicator, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useIntl } from 'react-intl';
import { SheetManager } from 'react-native-actions-sheet';

import { FlashList } from '@shopify/flash-list';
import PostCard from '../../postCard';
import styles from '../view/postsListStyles';
import { Separator, UpvotePopover } from '../..';
import { PostTypes } from '../../../constants/postTypes';
import { PostOptionsModal } from '../../postOptionsModal';
import { PostCardActionIds } from '../../postCard/container/postCard';
import {
  selectHidePostsThumbnails,
  selectIsDarkTheme,
  selectCurrentAccount,
  selectNsfw,
} from '../../../redux/selectors';
import { useAppSelector } from '../../../hooks';

export interface PostsListRef {
  scrollToTop: () => void;
}

interface postsListContainerProps extends FlatListProps<any> {
  posts: any[];
  promotedPosts: Array<any>;
  isFeedScreen: boolean;
  onLoadPosts?: (shouldReset: boolean) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  pageType: 'main' | 'profile' | 'ownProfile' | 'community';
  showQuickReplyModal: (post: any) => void;
}

let _onEndReachedCalledDuringMomentum = true;

const postsListContainer = (
  {
    posts,
    promotedPosts,
    isFeedScreen,
    onLoadPosts,
    isRefreshing,
    isLoading,
    pageType,
    showQuickReplyModal,
    ...props
  }: postsListContainerProps,
  ref,
) => {
  const flatListRef = useRef(null);
  const intl = useIntl();

  const navigation = useNavigation();

  const upvotePopoverRef = useRef(null);
  const postDropdownRef = useRef(null);

  // Use memoized selectors to prevent unnecessary re-renders
  const isHideImages = useAppSelector(selectHidePostsThumbnails);
  const nsfw = useAppSelector(selectNsfw);
  const isDarkTheme = useAppSelector(selectIsDarkTheme);

  const cachedPostsSelector = useMemo(
    () => (state) => isFeedScreen ? state.posts.feedPosts : state.posts.otherPosts,
    [isFeedScreen],
  );
  const cachedPosts = useAppSelector(cachedPostsSelector);
  const currentAccount = useAppSelector(selectCurrentAccount);
  const mutes = useMemo(() => currentAccount?.mutes || [], [currentAccount?.mutes]);
  const scrollPositionSelector = useMemo(
    () => (state) =>
      isFeedScreen ? state.posts.feedScrollPosition : state.posts.otherScrollPosition,
    [isFeedScreen],
  );
  const scrollPosition = useAppSelector(scrollPositionSelector);

  // const [imageRatios, setImageRatios] = useState(new Map<string, number>());

  const data = useMemo(() => {
    let _data = posts || cachedPosts;
    if (!_data || !_data.length) {
      return [];
    }

    // also skip muted posts
    _data = _data.filter((item) => {
      const isMuted = mutes && mutes.indexOf(item.author) > -1;
      return !isMuted && !!item?.author;
    });

    // Create Set for O(1) lookup instead of O(n) filter
    const existingPermlinks = new Set(_data.map((post) => `${post.author}/${post.permlink}`));

    const _promotedPosts =
      promotedPosts && Array.isArray(promotedPosts)
        ? promotedPosts.filter((item) => {
            const isMuted = mutes && mutes.indexOf(item.author) > -1;
            const notInPosts = !existingPermlinks.has(`${item.author}/${item.permlink}`);
            return !isMuted && !!item?.author && notInPosts;
          })
        : [];

    // inject promoted posts in flat list data (create a copy to avoid mutation)
    const result = [..._data];
    _promotedPosts.forEach((pPost, index) => {
      const pIndex = index * 4 + 3;
      if (result.length > pIndex) {
        result.splice(pIndex, 0, pPost);
      }
    });

    return result;
  }, [posts, promotedPosts, cachedPosts, mutes]);

  useImperativeHandle(ref, () => ({
    scrollToTop() {
      flatListRef.current?.scrollToOffset({ x: 0, y: 0, animated: true });
    },
  }));

  const hasInitiallyScrolled = useRef(false);

  useEffect(() => {
    console.log('Scroll Position: ', scrollPosition);

    // Only restore scroll position once on initial mount, not during pagination
    // Only set the flag after we actually restore a position with data present
    if (!hasInitiallyScrolled.current && scrollPosition !== undefined && scrollPosition > 0) {
      if (data.length > 0) {
        flatListRef.current?.scrollToOffset({
          offset: scrollPosition,
          animated: false,
        });
        hasInitiallyScrolled.current = true;
      }
    }
  }, [scrollPosition, data.length]);

  // const _setImageRatioInMap = (mapKey: string, height: number) => {
  //   if (mapKey && height) {
  //     setImageRatios(imageRatios.set(mapKey, height));
  //   }
  // };

  const _renderFooter = () => {
    if (isLoading && !isRefreshing) {
      return (
        <View style={styles.flatlistFooter}>
          <ActivityIndicator animating size="large" color="#2e3d51" />
        </View>
      );
    }

    return null;
  };

  const _onEndReached = () => {
    if (onLoadPosts && !_onEndReachedCalledDuringMomentum) {
      onLoadPosts(false);
      _onEndReachedCalledDuringMomentum = true;
    }
  };

  const _handleCardInteraction = useCallback(
    (id: PostCardActionIds, payload: any, content: any, onCallback) => {
      switch (id) {
        case PostCardActionIds.USER:
          SheetManager.show('quick_profile', {
            payload: {
              username: payload,
            },
          });
          break;

        case PostCardActionIds.OPTIONS:
          if (postDropdownRef.current && content) {
            postDropdownRef.current.show(content);
          }
          break;

        case PostCardActionIds.NAVIGATE:
          navigation.navigate(payload);
          break;

        case PostCardActionIds.REPLY:
          showQuickReplyModal(content);
          break;

        case PostCardActionIds.UPVOTE:
          if (upvotePopoverRef.current && payload && content) {
            upvotePopoverRef.current.showPopover({
              sourceRef: payload,
              content,
              postType: PostTypes.POST,
              onVotingStart: onCallback,
            });
          }
          break;

        case PostCardActionIds.PAYOUT_DETAILS:
          if (upvotePopoverRef.current && payload && content) {
            upvotePopoverRef.current.showPopover({
              sourceRef: payload,
              content,
              showPayoutDetails: true,
            });
          }
          break;

        case PostCardActionIds.TIP:
          SheetManager.show('tipping_dialog', {
            payload: {
              post: content,
            },
          });
          break;
      }
    },
    [navigation, showQuickReplyModal],
  );

  const _renderSeparator = useCallback(() => <Separator style={styles.separator} />, []);

  const _renderItem = useCallback(
    ({ item }: { item: any }) => {
      return (
        <PostCard
          intl={intl}
          key={`${item.author}-${item.permlink}`}
          content={item}
          pageType={pageType}
          isHideImage={isHideImages}
          nsfw={nsfw}
          handleCardInteraction={(id: PostCardActionIds, payload: any, onCallback) =>
            _handleCardInteraction(id, payload, item, onCallback)
          }
        />
      );
    },
    [intl, pageType, isHideImages, nsfw, _handleCardInteraction],
  );

  return (
    <Fragment>
      <FlashList
        ref={flatListRef}
        data={data}
        showsVerticalScrollIndicator={false}
        renderItem={_renderItem}
        keyExtractor={(content) => `${content.author}/${content.permlink}`}
        onEndReachedThreshold={1}
        maxToRenderPerBatch={5}
        initialNumToRender={3}
        ItemSeparatorComponent={_renderSeparator}
        estimatedItemSize={609}
        windowSize={8}
        onEndReached={_onEndReached}
        onMomentumScrollBegin={() => {
          _onEndReachedCalledDuringMomentum = false;
        }}
        ListFooterComponent={_renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              if (onLoadPosts) {
                onLoadPosts(true);
              }
            }}
            progressBackgroundColor="#357CE6"
            tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
            titleColor="#fff"
            colors={['#fff']}
          />
        }
        {...props}
      />
      <UpvotePopover ref={upvotePopoverRef} />
      <PostOptionsModal ref={postDropdownRef} pageType={pageType} />
    </Fragment>
  );
};

export default forwardRef(postsListContainer);
