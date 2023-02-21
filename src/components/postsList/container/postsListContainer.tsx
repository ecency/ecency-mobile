import React, { forwardRef, useRef, useImperativeHandle, useState, useEffect, Fragment } from 'react';
import { FlatListProps, FlatList, RefreshControl, ActivityIndicator, View, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import PostCard from '../../postCard';
import styles from '../view/postsListStyles';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../constants/routeNames';
import { useIntl } from 'react-intl';
import Popover from 'react-native-modal-popover';
import { UpvotePopover } from '../..';
import { PostTypes } from '../../../constants/postTypes';
import { PostOptionsModal } from '../../postOptionsModal';
import { PostCardActionIds } from '../../postCard/container/postCard';
import { useAppDispatch } from '../../../hooks';
import { showProfileModal } from '../../../redux/actions/uiAction';

export interface PostsListRef {
  scrollToTop: () => void;
}

interface postsListContainerProps extends FlatListProps<any> {
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

  const popoverRef = useRef<Popover>(null);
  const upvotePopoverRef = useRef(null);
  const postDropdownRef = useRef(null);

  // const {
  //   openPopover,
  //   closePopover,
  //   popoverVisible,
  //   touchableRef,
  //   popoverAnchorRect,
  // } = usePopover();


  // const [popoverVisible, setPopoverVisible] = useState(false); 


  const [imageHeights, setImageHeights] = useState(new Map<string, number>());

  const isHideImages = useSelector((state) => state.application.hidePostsThumbnails);
  const nsfw = useSelector((state) => state.application.hidePostsThumbnails);
  const isDarkTheme = useSelector((state) => state.application.isDarkThem);
  const posts = useSelector((state) => {
    return isFeedScreen ? state.posts.feedPosts : state.posts.otherPosts;
  });
  const mutes = useSelector((state) => state.account.currentAccount.mutes);
  const scrollIndex: number = useSelector(state => state.ui.scrollIndex);

  const scrollPosition = useSelector((state) => {
    return isFeedScreen ? state.posts.feedScrollPosition : state.posts.otherScrollPosition;
  });

  useImperativeHandle(ref, () => ({
    scrollToTop() {
      flatListRef.current?.scrollToOffset({ x: 0, y: 0, animated: true });
    },
  }));

  useEffect(() => {
    console.log('Scroll Position: ', scrollPosition);

    if (posts && posts.length == 0) {
      flatListRef.current?.scrollToOffset({
        offset: 0,
        animated: false,
      });
    }
  }, [posts]);

  useEffect(() => {
    console.log('Scroll Position: ', scrollPosition);
    flatListRef.current?.scrollToOffset({
      offset: posts && posts.length == 0 ? 0 : scrollPosition,
      animated: false,
    });
  }, [scrollPosition]);

  //TODO: test hook, remove before PR
  useEffect(() => {
    if (scrollIndex && flatListRef.current) {
      const _posts = props.data || posts
      console.log("scrollIndex", scrollIndex, "posts length", _posts.length);

      if (scrollIndex >= _posts.length) {
        Alert.alert("Reached an end, scroll score, " + scrollIndex);
        return;
      }

      if (scrollIndex === _posts.length - 15) {
        console.log("fetching posts");
        onLoadPosts(false);
      }

      flatListRef.current.scrollToIndex({ index: scrollIndex });
      setTimeout(() => {
        _handleOnContentPress(_posts[scrollIndex])
      }, 500)
    }
  }, [scrollIndex])

  const _setImageHeightInMap = (mapKey: string, height: number) => {
    if (mapKey && height) {
      setImageHeights(imageHeights.set(mapKey, height));
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



  const _handleOnContentPress = (value) => {
    if (value) {
      // postsCacherPrimer.cachePost(value);
      navigation.navigate({
        name: ROUTES.SCREENS.POST,
        params: {
          content: value,
          author: value.author,
          permlink: value.permlink,
        }
      });
    }
  };


  const _handleCardInteraction = (id: PostCardActionIds, payload: any, content: any) => {
    switch (id) {
      case PostCardActionIds.USER:
        dispatch(showProfileModal(payload))
        break;

      case PostCardActionIds.OPTIONS:
        if (postDropdownRef.current && content) {
          postDropdownRef.current.show(content);
        }
        break;

      case PostCardActionIds.NAVIGATE:
        navigation.navigate(payload)
        break;

      case PostCardActionIds.REPLY:
        showQuickReplyModal(content)
        break;

      case PostCardActionIds.UPVOTE:
        if (upvotePopoverRef.current && payload && content) {
          upvotePopoverRef.current.showPopover(payload, content);
        }
        break;

      case PostCardActionIds.PAYOUT_DETAILS:
        if (upvotePopoverRef.current && payload && content) {
          upvotePopoverRef.current.showPopover(payload, content, true);
        }
        break;

    }
  }

  const _renderItem = ({ item, index }: { item: any; index: number }) => {
    // const e = [];

    // if (index % 3 === 0) {
    //   const ix = index / 3 - 1;
    //   if (promotedPosts[ix] !== undefined) {
    //     const p = promotedPosts[ix];
    //     const isMuted = mutes && mutes.indexOf(p.author) > -1;

    //     if (
    //       !isMuted &&
    //       get(p, 'author', null) &&
    //       posts &&
    //       posts.filter((x) => x.permlink === p.permlink).length <= 0
    //     ) {
    //       // get image height from cache if available
    //       const localId = p.author + p.permlink;
    //       const imgHeight = imageHeights.get(localId);

    //       e.push(
    //         <PostCard
    //         intl={intl}
    //           key={`${p.author}-${p.permlink}-prom`}
    //           content={p}
    //           isHideImage={isHideImages}
    //           imageHeight={imgHeight}
    //           pageType={pageType}
    //           setImageHeight={_setImageHeightInMap}
    //         />,
    //       );
    //     }
    //   }
    // }

    const isMuted = mutes && mutes.indexOf(item.author) > -1;
    if (!isMuted && item?.author) {
      // get image height from cache if available
      const localId = item.author + item.permlink;
      const imgHeight = imageHeights.get(localId);

      //   e.push(
      return <PostCard
        intl={intl}
        key={`${item.author}-${item.permlink}`}
        content={item}
        isHideImage={isHideImages}
        nsfw={nsfw}
        pageType={pageType}
        // imageHeight={imgHeight}
        setImageHeight={_setImageHeightInMap}
        handleCardInteraction={(id: PostCardActionIds, payload: any) => _handleCardInteraction(id, payload, item)}
      />

      //   );
    }

    return null;

    // return e;
  };

  return (
    <Fragment>
      <FlatList
        ref={flatListRef}
        data={posts}
        showsVerticalScrollIndicator={false}
        renderItem={_renderItem}
        keyExtractor={(content, index) => `${content.author}/${content.permlink}-${index}`}
        removeClippedSubviews
        onEndReachedThreshold={1}
        maxToRenderPerBatch={3}
        initialNumToRender={3}
        windowSize={5}
        extraData={[imageHeights, scrollIndex]}
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
      <UpvotePopover
        ref={upvotePopoverRef}
        parentType={PostTypes.POST}
      />
      <PostOptionsModal
        ref={postDropdownRef}
        pageType={pageType}
      />
    </Fragment>

  );
};

export default forwardRef(postsListContainer);
