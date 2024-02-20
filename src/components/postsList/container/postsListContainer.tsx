import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
  useEffect,
  Fragment,
  useMemo,
} from 'react';
import { FlatListProps, RefreshControl, ActivityIndicator, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useIntl } from 'react-intl';
import PostCard from '../../postCard';
import styles from '../view/postsListStyles';
import { UpvotePopover } from '../..';
import { PostTypes } from '../../../constants/postTypes';
import { PostOptionsModal } from '../../postOptionsModal';
import { PostCardActionIds } from '../../postCard/container/postCard';
import { useAppDispatch } from '../../../hooks';
import { showProfileModal } from '../../../redux/actions/uiAction';
import { useInjectVotesCache } from '../../../providers/queries/postQueries/postQueries';

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
  const dispatch = useAppDispatch();

  const navigation = useNavigation();

  const upvotePopoverRef = useRef(null);
  const postDropdownRef = useRef(null);

  const isHideImages = useSelector((state) => state.application.hidePostsThumbnails);
  const nsfw = useSelector((state) => state.application.hidePostsThumbnails);
  const isDarkTheme = useSelector((state) => state.application.isDarkThem);

  const cachedPosts = useSelector((state) => {
    return isFeedScreen ? state.posts.feedPosts : state.posts.otherPosts;
  });
  const votesCache = useSelector((state) => state.cache.votesCollection);

  const mutes = useSelector((state) => state.account.currentAccount.mutes);

  const scrollPosition = useSelector((state) => {
    return isFeedScreen ? state.posts.feedScrollPosition : state.posts.otherScrollPosition;
  });

  const [imageRatios, setImageRatios] = useState(new Map<string, number>());

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

    const _promotedPosts = promotedPosts.filter((item) => {
      const isMuted = mutes && mutes.indexOf(item.author) > -1;
      const notInPosts = _data.filter((x) => x.permlink === item.permlink).length <= 0;
      return !isMuted && !!item?.author && notInPosts;
    });

    // inject promoted posts in flat list data,
    _promotedPosts.forEach((pPost, index) => {
      const pIndex = index * 4 + 3;
      if (_data.length > pIndex) {
        _data.splice(pIndex, 0, pPost);
      }
    });

    return _data;
  }, [posts, promotedPosts, cachedPosts, mutes]);

  const cacheInjectedData = useInjectVotesCache(data);

  useImperativeHandle(ref, () => ({
    scrollToTop() {
      flatListRef.current?.scrollToOffset({ x: 0, y: 0, animated: true });
    },
  }));

  useEffect(() => {
    console.log('Scroll Position: ', scrollPosition);

    if (cachedPosts && cachedPosts.length == 0) {
      flatListRef.current?.scrollToOffset({
        offset: 0,
        animated: false,
      });
    }
  }, [cachedPosts]);

  useEffect(() => {
    console.log('Scroll Position: ', scrollPosition);
    flatListRef.current?.scrollToOffset({
      offset: cachedPosts && cachedPosts.length == 0 ? 0 : scrollPosition,
      animated: false,
    });
  }, [scrollPosition]);

  const _setImageRatioInMap = (mapKey: string, height: number) => {
    if (mapKey && height) {
      setImageRatios(imageRatios.set(mapKey, height));
    }
  };

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

  const _handleCardInteraction = (
    id: PostCardActionIds,
    payload: any,
    content: any,
    onCallback,
  ) => {
    switch (id) {
      case PostCardActionIds.USER:
        dispatch(showProfileModal(payload));
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
            anchorRect: payload,
            content,
            postType: PostTypes.POST,
            onVotingStart: onCallback,
          });
        }
        break;

      case PostCardActionIds.PAYOUT_DETAILS:
        if (upvotePopoverRef.current && payload && content) {
          upvotePopoverRef.current.showPopover({
            anchorRect: payload,
            content,
            showPayoutDetails: true,
          });
        }
        break;
    }
  };

  const _renderItem = ({ item }: { item: any }) => {
    // get image height from cache if available
    const localId = item.author + item.permlink;
    const imgRatio = item.thumbRatio || imageRatios.get(localId);

    //   e.push(
    return (
      <PostCard
        intl={intl}
        key={`${item.author}-${item.permlink}`}
        content={item}
        isHideImage={isHideImages}
        nsfw={nsfw}
        imageRatio={imgRatio}
        setImageRatio={_setImageRatioInMap}
        handleCardInteraction={(id: PostCardActionIds, payload: any, onCallback) =>
          _handleCardInteraction(id, payload, item, onCallback)
        }
      />
    );
  };

  return (
    <Fragment>
      <FlashList
        ref={flatListRef}
        data={cacheInjectedData}
        showsVerticalScrollIndicator={false}
        renderItem={_renderItem}
        keyExtractor={(content, index) => `${content.author}/${content.permlink}-${index}`}
        onEndReachedThreshold={1}
        maxToRenderPerBatch={5}
        initialNumToRender={3}
        estimatedItemSize={609}
        windowSize={8}
        extraData={[imageRatios, votesCache]}
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
