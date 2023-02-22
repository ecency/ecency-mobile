import React, { forwardRef, useRef, useImperativeHandle, useState, useEffect, Fragment, useMemo } from 'react';
import { FlatListProps, FlatList, RefreshControl, ActivityIndicator, View, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import PostCard from '../../postCard';
import styles from '../view/postsListStyles';
import { useNavigation } from '@react-navigation/native';
import ROUTES from '../../../constants/routeNames';
import { useIntl } from 'react-intl';
import { UpvotePopover } from '../..';
import { PostTypes } from '../../../constants/postTypes';
import { PostOptionsModal } from '../../postOptionsModal';
import { PostCardActionIds } from '../../postCard/container/postCard';
import { useAppDispatch } from '../../../hooks';
import { showProfileModal } from '../../../redux/actions/uiAction';
import { getPostReblogs } from '../../../providers/ecency/ecency';

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

  const mutes = useSelector((state) => state.account.currentAccount.mutes);
  const scrollIndex: number = useSelector(state => state.ui.scrollIndex);

  const scrollPosition = useSelector((state) => {
    return isFeedScreen ? state.posts.feedScrollPosition : state.posts.otherScrollPosition;
  });

  const [imageHeights, setImageHeights] = useState(new Map<string, number>());
  const reblogsCollectionRef = useRef({});

  const data = useMemo(() => {
    let _data = posts || cachedPosts
    if (!_data || !_data.length) {
      return []
    }


    //also skip muted posts
    _data = _data.filter((item) => {
      const isMuted = mutes && mutes.indexOf(item.author) > -1;
      return !isMuted && !!item?.author;
    })

    const _promotedPosts = promotedPosts.filter((item) => {
      const isMuted = mutes && mutes.indexOf(item.author) > -1;
      const notInPosts = _data.filter((x) => x.permlink === item.permlink).length <= 0
      return !isMuted && !!item?.author && notInPosts
    })

    //inject promoted posts in flat list data, 
    _promotedPosts.forEach((pPost, index) => {
      const pIndex = (index * 4) + 3;
      if (_data.length > pIndex) {
        _data.splice(pIndex, 0, pPost)
      }
    })

    return _data;

  }, [posts, promotedPosts, cachedPosts, mutes]);



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



  //TODO: test hook, remove before PR
  useEffect(() => {
    if (scrollIndex && flatListRef.current) {
      const _posts = data
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


  useEffect(() => {
    //fetch reblogs here
    _updateReblogsCollection()
  }, [data])


  const _updateReblogsCollection = async () => {
    //improve routine using list or promises
    for (const i in data) {
      const _item = data[i]
      const _postPath = _item.author + _item.permlink
      if (!reblogsCollectionRef.current[_postPath]) {
        try {
          const reblogs = await getPostReblogs(_item);
          reblogsCollectionRef.current = { ...reblogsCollectionRef.current, [_postPath]: reblogs || [] }
        } catch (err) {
          console.warn("failed to fetch reblogs for post");
          reblogsCollectionRef.current = { ...reblogsCollectionRef.current, [_postPath]: [] }
        }
      }
    }
  }


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
          upvotePopoverRef.current.showPopover({anchorRect:payload, content});
        }
        break;

      case PostCardActionIds.PAYOUT_DETAILS:
        if (upvotePopoverRef.current && payload && content) {
          upvotePopoverRef.current.showPopover({anchorRect:payload, content, showPayoutDetails:true});
        }
        break;

    }
  }

  const _renderItem = ({ item }: { item: any }) => {
    // get image height from cache if available
    const localId = item.author + item.permlink;
    const imgHeight = imageHeights.get(localId);
    const reblogs = reblogsCollectionRef.current[localId]

    //   e.push(
    return <PostCard
      intl={intl}
      key={`${item.author}-${item.permlink}`}
      content={item}
      isHideImage={isHideImages}
      nsfw={nsfw}
      reblogs={reblogs}
      // imageHeight={imgHeight}
      setImageHeight={_setImageHeightInMap}
      handleCardInteraction={(id: PostCardActionIds, payload: any) => _handleCardInteraction(id, payload, item)}
    />
  };

  return (
    <Fragment>
      <FlatList
        ref={flatListRef}
        data={data}
        showsVerticalScrollIndicator={false}
        renderItem={_renderItem}
        keyExtractor={(content, index) => `${content.author}/${content.permlink}-${index}`}
        removeClippedSubviews
        onEndReachedThreshold={1}
        maxToRenderPerBatch={3}
        initialNumToRender={3}
        windowSize={5}
        extraData={[imageHeights, scrollIndex, reblogsCollectionRef.current]}
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
                reblogsCollectionRef.current = {}
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
