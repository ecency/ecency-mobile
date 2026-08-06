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
import { ActivityIndicator, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import { RefreshControl } from 'react-native-gesture-handler';

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { SheetManager } from 'react-native-actions-sheet';
import { FlashList } from '@shopify/flash-list';
import { useDeleteComment } from '@ecency/sdk';
import COMMENT_FILTER, { VALUE } from '../../../constants/options/comment';
import { FilterBar } from '../../filterBar';
import { postQueries } from '../../../providers/queries';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import ROUTES from '../../../constants/routeNames';
import { PostTypes } from '../../../constants/postTypes';
import { CommentsSection } from '../children/commentsSection';
import { sortComments } from '../children/sortComments';
import styles from '../children/postComments.styles';
import { PostHtmlInteractionHandler } from '../../postHtmlRenderer';
import { PostOptionsModal } from '../../index';
import { BotCommentsPreview } from '../children/botCommentsPreview';
import { SheetNames } from '../../../navigation/sheets';
import { checkViewability } from '../../../hooks/useViewabilityTracker';
import { selectCurrentAccount, selectIsDarkTheme } from '../../../redux/selectors';
import { useAuthContext } from '../../../providers/sdk';
import { toastNotification } from '../../../redux/actions/uiAction';

const PostComments = forwardRef(
  (
    {
      author,
      permlink,
      mainAuthor,
      pinnedReply,
      postContentView,
      isPostLoading,
      onRefresh,
      handleOnCommentsLoaded,
      handleOnReplyPress,
      onUpvotePress,
      refreshing,
      setRefreshing,
    }: any,
    ref,
  ) => {
    const intl = useIntl();
    const navigation = useNavigation();
    const dispatch = useAppDispatch();

    const currentAccount = useAppSelector(selectCurrentAccount);
    const currentAccountName = currentAccount?.name;
    const isDarkTheme = useAppSelector(selectIsDarkTheme);

    const authContext = useAuthContext();
    const deleteCommentMutation = useDeleteComment(currentAccountName, authContext, 'async');
    const { mutateAsync: deleteComment } = deleteCommentMutation;

    const discussionQuery = postQueries.useDiscussionQuery(author, permlink);
    const postsCachePrimer = postQueries.usePostsCachePrimer();

    const writeCommentRef = useRef<any>(null);
    const postInteractionRef = useRef<any>(null);

    const commentsListRef = useRef<any>(null);
    const postOptionsModalRef = useRef<any>(null);
    const viewabilityFrameRef = useRef<any>(null);

    const [selectedFilter, setSelectedFilter] = useState('trending');
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [hiddenCommentKeys, setHiddenCommentKeys] = useState<Set<string>>(new Set());
    const headerHeightRef = useRef(0);

    const sortedSections = useMemo(
      () => sortComments(selectedFilter, discussionQuery.sectionedData, pinnedReply),
      [discussionQuery.sectionedData, selectedFilter, pinnedReply],
    );
    const listData = useMemo(() => {
      if (isPostLoading) {
        return [];
      }
      if (!hiddenCommentKeys.size) {
        return sortedSections;
      }
      return sortedSections.filter(
        (item: any) => !hiddenCommentKeys.has(`${item.author}/${item.permlink}`),
      );
    }, [isPostLoading, sortedSections, hiddenCommentKeys]);

    useEffect(() => {
      setHiddenCommentKeys(new Set());
    }, [author, permlink]);

    useImperativeHandle(ref, () => ({
      bounceCommentButton: () => {
        console.log('bouncing comment button');
        if (writeCommentRef.current) {
          writeCommentRef.current.bounce();
        }
      },
      scrollToComments: () => {
        if (commentsListRef.current && !listData.length) {
          commentsListRef.current.scrollToOffset({ offset: headerHeight + 200 });
        } else if (commentsListRef.current && listData.length) {
          commentsListRef.current.scrollToIndex({ index: 0, viewOffset: 108 });
        }
      },
    }));

    useEffect(() => {
      // Use isFetching instead of isLoading to properly handle both initial load and refetch
      if (!discussionQuery.isFetching) {
        handleOnCommentsLoaded();
        if (refreshing) {
          setRefreshing(false);
        }
      }
    }, [discussionQuery.isFetching, handleOnCommentsLoaded, refreshing, setRefreshing]);

    const _onRefresh = useCallback(async () => {
      setRefreshing(true);
      try {
        await Promise.all([discussionQuery.refetch(), onRefresh?.()]);
      } finally {
        setRefreshing(false);
      }
    }, [discussionQuery.refetch, onRefresh, setRefreshing]);

    const _handleOnDropdownSelect = useCallback((option: any, index: any) => {
      setSelectedFilter(option);
      setSelectedOptionIndex(index);
    }, []);

    const _handleOnVotersPress = useCallback(
      (activeVotes: any, content: any) => {
        navigation.navigate({
          name: ROUTES.SCREENS.VOTERS,
          params: {
            activeVotes,
            content,
          },
          key: content.permlink,
        });
      },
      [navigation],
    );

    const _handleOnEditPress = useCallback(
      (item: any) => {
        navigation.navigate({
          name: ROUTES.SCREENS.EDITOR,
          key: `editor_edit_reply_${item.permlink}`,
          params: {
            isEdit: true,
            isReply: true,
            post: item,
          },
        });
      },
      [navigation],
    );

    // Mutation only, no confirmation. The options sheet confirms before invoking
    // its onDelete, so a handler that prompts again would ask twice for one
    // action, and let the user cancel the second after confirming the first.
    const _deleteCommentConfirmed = useCallback(
      async (
        _permlink: any,
        _parentPermlink?: any,
        _parentAuthor?: any,
        _rootAuthor?: any,
        _rootPermlink?: any,
      ) => {
        const deletedKey = `${currentAccountName}/${_permlink}`;
        const extractErrorDetail = (error: any) => {
          const detail =
            error?.message ||
            error?.response?.message ||
            error?.response?.data?.message ||
            error?.data?.message ||
            error?.error_description ||
            error?.jse_shortmsg;
          return typeof detail === 'string' ? detail : JSON.stringify(error);
        };

        setHiddenCommentKeys((prev) => {
          const next = new Set(prev);
          next.add(deletedKey);
          return next;
        });

        try {
          await deleteComment({
            author: currentAccountName,
            permlink: _permlink,
            parentAuthor: _parentAuthor,
            parentPermlink: _parentPermlink || permlink,
            rootAuthor: _rootAuthor || author,
            rootPermlink: _rootPermlink || permlink,
          });
          console.log('deleted comment', `${currentAccountName}/${_permlink}`);
        } catch (err) {
          const stillExists = !!(discussionQuery.data as any)?.[deletedKey];
          if (stillExists) {
            setHiddenCommentKeys((prev) => {
              const next = new Set(prev);
              next.delete(deletedKey);
              return next;
            });
          }
          const errorDetail = extractErrorDetail(err);
          if (stillExists) {
            dispatch(toastNotification(`Failed to delete comment: ${errorDetail}`));
          } else {
            console.log('delete returned error but comment is already absent in cache', deletedKey);
          }
          console.warn('Failed to delete comment', err);
        }
      },
      [author, currentAccountName, deleteComment, dispatch, discussionQuery.data, intl, permlink],
    );

    // Confirms, then mutates. Used by the inline delete button, which has no
    // confirmation of its own.
    const _handleDeleteComment = useCallback(
      async (
        _permlink: any,
        _parentPermlink?: any,
        _parentAuthor?: any,
        _rootAuthor?: any,
        _rootPermlink?: any,
      ) => {
        const action = await SheetManager.show(SheetNames.ACTION_MODAL, {
          payload: {
            title: intl.formatMessage({ id: 'delete.confirm_delete_title' }),
            buttons: [
              {
                text: intl.formatMessage({ id: 'alert.cancel' }),
                returnValue: 'cancel',
              },
              {
                text: intl.formatMessage({ id: 'alert.delete' }),
                returnValue: 'confirm',
              },
            ],
          },
        });

        if (action === 'confirm') {
          _deleteCommentConfirmed(
            _permlink,
            _parentPermlink,
            _parentAuthor,
            _rootAuthor,
            _rootPermlink,
          );
        }
      },
      [_deleteCommentConfirmed, intl],
    );

    const _openReplyThread = useCallback(
      (comment: any) => {
        postsCachePrimer.cachePost(comment);
        navigation.navigate({
          name: ROUTES.SCREENS.POST,
          key: comment.permlink,
          params: {
            author: comment.author,
            permlink: comment.permlink,
          },
        });
      },
      [postsCachePrimer, navigation],
    );

    const _handleOnUserPress = useCallback((username: any) => {
      SheetManager.show(SheetNames.QUICK_PROFILE, {
        payload: {
          username,
        },
      });
    }, []);

    // The sheet is opened for comments here, so its own delete path would call
    // navigation.goBack() and leave the post the user is reading, and would skip
    // the error handling and deleted-key cache work this screen already owns.
    // Same arguments the inline delete button passes.
    const _handleDeleteFromMenu = useCallback(
      (comment: any) =>
        _deleteCommentConfirmed(
          comment.permlink,
          comment.parent_permlink,
          comment.parent_author,
          comment.root_author,
          comment.root_permlink,
        ),
      [_deleteCommentConfirmed],
    );

    const _handleShowOptionsMenu = useCallback((comment: any) => {
      if (postOptionsModalRef.current) {
        postOptionsModalRef.current.show(comment);
      }
    }, []);

    const _onContentSizeChange = useCallback((x: number, y: number) => {
      // Add tolerance for floating point differences to prevent infinite loops
      const tolerance = 1;
      const heightDiff = Math.abs(y - headerHeightRef.current);

      if (heightDiff > tolerance) {
        headerHeightRef.current = y;
        setHeaderHeight(y);
      }
    }, []);

    const _onScroll = useCallback((event: any) => {
      if (viewabilityFrameRef.current !== null) {
        return;
      }
      const windowHeight = event.nativeEvent.layoutMeasurement.height;
      viewabilityFrameRef.current = requestAnimationFrame(() => {
        viewabilityFrameRef.current = null;
        checkViewability(windowHeight);
      });
    }, []);

    useEffect(
      () => () => {
        if (viewabilityFrameRef.current !== null) {
          cancelAnimationFrame(viewabilityFrameRef.current);
        }
      },
      [],
    );

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
              options={filterOptions}
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

      // Use isFetching to show spinner during both initial load and refetch
      if (discussionQuery.isFetching || !!sortedSections.length) {
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
      discussionQuery.isFetching,
      sortedSections.length,
      _handleEmptyPress,
      emptyTextMessage,
    ]);

    const _renderItem = useCallback(
      ({ item, index }: any) => {
        return (
          <CommentsSection
            item={item}
            index={index}
            hiddenCommentKeys={hiddenCommentKeys}
            pinnedReply={pinnedReply}
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
            onUpvotePress={(args: any) => onUpvotePress({ ...args, postType: PostTypes.COMMENT })}
          />
        );
      },
      [
        mainAuthor,
        pinnedReply,
        hiddenCommentKeys,
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
          keyExtractor={(item: any) => `${item.author}/${item.permlink}`}
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
        <PostOptionsModal
          ref={postOptionsModalRef}
          isVisibleTranslateModal={true}
          onDelete={_handleDeleteFromMenu}
        />
      </Fragment>
    );
  },
);

export default PostComments;
