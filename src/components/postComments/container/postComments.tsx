import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
  Fragment,
} from 'react';
import { ActivityIndicator, FlatList, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import { RefreshControl } from 'react-native-gesture-handler';

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { SheetManager } from 'react-native-actions-sheet';
import { FlashList } from '@shopify/flash-list';
import COMMENT_FILTER, { VALUE } from '../../../constants/options/comment';
import { FilterBar } from '../../filterBar';
import { postQueries } from '../../../providers/queries';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import ROUTES from '../../../constants/routeNames';
import { deleteComment } from '../../../providers/hive/dhive';
import { updateCommentCache } from '../../../redux/actions/cacheActions';
import { CacheStatus } from '../../../redux/reducers/cacheReducer';
import { PostTypes } from '../../../constants/postTypes';
import { CommentsSection } from '../children/commentsSection';
import { sortComments } from '../children/sortComments';
import styles from '../children/postComments.styles';
import { PostHtmlInteractionHandler } from '../../postHtmlRenderer';
import { PostOptionsModal } from '../../index';
import { BotCommentsPreview } from '../children/botCommentsPreview';
import { SheetNames } from '../../../navigation/sheets';
import { checkViewability } from '../../../hooks/useViewabilityTracker';
import { selectCurrentAccount, selectPin, selectIsDarkTheme } from '../../../redux/selectors';

const PostComments = forwardRef(
  (
    {
      author,
      permlink,
      mainAuthor,
      postContentView,
      isPostLoading,
      onRefresh,
      handleOnCommentsLoaded,
      handleOnReplyPress,
      onUpvotePress,
      refreshing,
      setRefreshing,
    },
    ref,
  ) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const navigation = useNavigation();

    const currentAccount = useAppSelector(selectCurrentAccount);
    const pinHash = useAppSelector(selectPin);
    const isDarkTheme = useAppSelector(selectIsDarkTheme);

    const discussionQuery = postQueries.useDiscussionQuery(author, permlink);
    const postsCachePrimer = postQueries.usePostsCachePrimer();

    const writeCommentRef = useRef(null);
    const postInteractionRef = useRef<typeof PostHtmlInteractionHandler | null>(null);

    const commentsListRef = useRef<FlatList<any> | null>(null);
    const postOptionsModalRef = useRef<any>(null);

    const [selectedFilter, setSelectedFilter] = useState('trending');
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
    const [headerHeight, setHeaderHeight] = useState(0);
    const headerHeightRef = useRef(0);

    const sortedSections = useMemo(
      () => sortComments(selectedFilter, discussionQuery.sectionedData),
      [discussionQuery.sectionedData, selectedFilter],
    );
    const listData = useMemo(
      () => (isPostLoading ? [] : sortedSections),
      [isPostLoading, sortedSections],
    );

    useImperativeHandle(ref, () => ({
      bounceCommentButton: () => {
        console.log('bouncing comment button');
        if (writeCommentRef.current) {
          writeCommentRef.current.bounce();
        }
      },
      scrollToComments: () => {
        if (commentsListRef.current && !sortedSections.length) {
          commentsListRef.current.scrollToOffset({ offset: headerHeight + 200 });
        } else if (commentsListRef.current && sortedSections.length) {
          commentsListRef.current.scrollToIndex({ index: 0, viewOffset: 108 });
        }
      },
    }));

    useEffect(() => {
      if (!discussionQuery.isLoading) {
        handleOnCommentsLoaded();
        if (refreshing) {
          setRefreshing(false);
        }
      }
    }, [discussionQuery.isLoading, handleOnCommentsLoaded, refreshing, setRefreshing]);

    const _onRefresh = () => {
      setRefreshing(true);
      discussionQuery.refetch();
      onRefresh();
    };

    const _handleOnDropdownSelect = useCallback((option, index) => {
      setSelectedFilter(option);
      setSelectedOptionIndex(index);
    }, []);

    const _handleOnVotersPress = useCallback(
      (activeVotes, content) => {
        navigation.navigate({
          name: ROUTES.SCREENS.VOTERS,
          params: {
            activeVotes,
            content,
          },
          key: content.permlink,
        } as never);
      },
      [navigation],
    );

    const _handleOnEditPress = useCallback(
      (item) => {
        navigation.navigate({
          name: ROUTES.SCREENS.EDITOR,
          key: `editor_edit_reply_${item.permlink}`,
          params: {
            isEdit: true,
            isReply: true,
            post: item,
          },
        } as never);
      },
      [navigation],
    );

    const _handleDeleteComment = useCallback(
      (_permlink) => {
        const _onConfirmDelete = async () => {
          try {
            await deleteComment(currentAccount, pinHash, _permlink);
            // remove cached entry based on parent
            const _commentPath = `${currentAccount.name}/${_permlink}`;
            console.log('deleted comment', _commentPath);

            const _deletedItem = discussionQuery.data[_commentPath];
            if (_deletedItem) {
              // Don't mutate - create new object
              const updatedItem = {
                ..._deletedItem,
                status: CacheStatus.DELETED,
              };
              delete updatedItem.updated;
              dispatch(updateCommentCache(_commentPath, updatedItem, { isUpdate: true }));
            }
          } catch (err) {
            console.warn('Failed to delete comment');
          }
        };

        SheetManager.show(SheetNames.ACTION_MODAL, {
          payload: {
            title: intl.formatMessage({ id: 'delete.confirm_delete_title' }),
            buttons: [
              {
                text: intl.formatMessage({ id: 'alert.cancel' }),
                onPress: () => {
                  console.log('canceled delete comment');
                },
              },
              {
                text: intl.formatMessage({ id: 'alert.delete' }),
                onPress: _onConfirmDelete,
              },
            ],
          },
        });
      },
      [currentAccount, pinHash, discussionQuery.data, dispatch, intl],
    );

    const _openReplyThread = useCallback(
      (comment) => {
        postsCachePrimer.cachePost(comment);
        navigation.navigate({
          name: ROUTES.SCREENS.POST,
          key: comment.permlink,
          params: {
            author: comment.author,
            permlink: comment.permlink,
          },
        } as never);
      },
      [postsCachePrimer, navigation],
    );

    const _handleOnUserPress = useCallback((username) => {
      SheetManager.show(SheetNames.QUICK_PROFILE, {
        payload: {
          username,
        },
      });
    }, []);

    const _handleShowOptionsMenu = useCallback((comment) => {
      if (postOptionsModalRef.current) {
        postOptionsModalRef.current.show(comment);
      }
    }, []);

    const _onContentSizeChange = useCallback((x: number, y: number) => {
      if (y !== headerHeightRef.current) {
        headerHeightRef.current = y;
        setHeaderHeight(y);
      }
    }, []);

    const _onScroll = useCallback((event) => {
      const windowHeight = event.nativeEvent.layoutMeasurement.height;
      checkViewability(windowHeight);
    }, []);

    const filterOptions = useMemo(
      () => VALUE.map((val) => intl.formatMessage({ id: `comment_filter.${val}` })),
      [intl],
    );

    const filterDefaultText = useMemo(
      () => intl.formatMessage({ id: `comment_filter.${VALUE[0]}` }),
      [intl],
    );

    const handleFilterSelect = useCallback(
      (selectedIndex: number) => {
        _handleOnDropdownSelect(COMMENT_FILTER[selectedIndex], selectedIndex);
      },
      [_handleOnDropdownSelect],
    );

    const _postContentView = useMemo(
      () => (
        <>
          {postContentView && postContentView}

          {!isPostLoading && (
            <FilterBar
              dropdownIconName="arrow-drop-down"
              options={filterOptions}
              defaultText={filterDefaultText}
              onDropdownSelect={handleFilterSelect}
              selectedOptionIndex={selectedOptionIndex}
            />
          )}
          <BotCommentsPreview comments={discussionQuery.botComments} />
        </>
      ),
      [
        postContentView,
        isPostLoading,
        filterOptions,
        filterDefaultText,
        handleFilterSelect,
        selectedOptionIndex,
        discussionQuery.botComments,
      ],
    );

    const emptyTextMessage = useMemo(
      () => intl.formatMessage({ id: 'comments.no_comments' }),
      [intl],
    );

    const _handleEmptyPress = useCallback(() => {
      if (handleOnReplyPress) {
        handleOnReplyPress();
      }
    }, [handleOnReplyPress]);

    const _renderEmptyContent = useCallback(() => {
      if (isPostLoading) {
        return null;
      }

      if (discussionQuery.isLoading || !!sortedSections.length) {
        return (
          <ActivityIndicator
            style={styles.loadingIndicator}
            color={EStyleSheet.value('$primaryBlack')}
          />
        );
      }

      return (
        <Text onPress={_handleEmptyPress} style={styles.emptyText}>
          {emptyTextMessage}
        </Text>
      );
    }, [
      isPostLoading,
      discussionQuery.isLoading,
      sortedSections.length,
      _handleEmptyPress,
      emptyTextMessage,
    ]);

    const _renderItem = useCallback(
      ({ item, index }) => {
        return (
          <CommentsSection
            item={item}
            index={index}
            mainAuthor={mainAuthor}
            handleDeleteComment={_handleDeleteComment}
            handleOnEditPress={_handleOnEditPress}
            handleOnVotersPress={_handleOnVotersPress}
            handleOnMenuPress={_handleShowOptionsMenu}
            handleOnUserPress={_handleOnUserPress}
            handleImagePress={postInteractionRef.current?.handleImagePress}
            handleLinkPress={postInteractionRef.current?.handleLinkPress}
            handleVideoPress={postInteractionRef.current?.handleVideoPress}
            handleYoutubePress={postInteractionRef.current?.handleYoutubePress}
            handleParaSelection={postInteractionRef.current?.handleParaSelection}
            openReplyThread={_openReplyThread}
            onUpvotePress={(args) => onUpvotePress({ ...args, postType: PostTypes.COMMENT })}
          />
        );
      },
      [
        mainAuthor,
        _handleDeleteComment,
        _handleOnEditPress,
        _handleOnVotersPress,
        _handleShowOptionsMenu,
        _handleOnUserPress,
        _openReplyThread,
        onUpvotePress,
      ],
    );

    return (
      <Fragment>
        <FlashList
          ref={commentsListRef}
          keyExtractor={(item) => `${item.author}/${item.permlink}`}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={_postContentView}
          ListEmptyComponent={_renderEmptyContent}
          data={listData}
          onContentSizeChange={_onContentSizeChange}
          renderItem={_renderItem}
          onScroll={_onScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={_onRefresh}
              progressBackgroundColor="#357CE6"
              tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
              titleColor="#fff"
              colors={['#fff']}
            />
          }
          overScrollMode="never"
        />
        <PostHtmlInteractionHandler ref={postInteractionRef} />
        <PostOptionsModal ref={postOptionsModalRef} isVisibleTranslateModal={true} />
      </Fragment>
    );
  },
);

export default PostComments;
