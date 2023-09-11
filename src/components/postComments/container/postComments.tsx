import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
  useEffect,
  Fragment,
} from 'react';
import { ActivityIndicator, Platform, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';

// Components
import { postBodySummary } from '@ecency/render-helper';
import EStyleSheet from 'react-native-extended-stylesheet';
import COMMENT_FILTER, { VALUE } from '../../../constants/options/comment';
import { FilterBar } from '../../filterBar';
import { postQueries } from '../../../providers/queries';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import ROUTES from '../../../constants/routeNames';
import { showActionModal, showProfileModal, toastNotification } from '../../../redux/actions/uiAction';
import { writeToClipboard } from '../../../utils/clipboard';
import { deleteComment } from '../../../providers/hive/dhive';
import { updateCommentCache } from '../../../redux/actions/cacheActions';
import { CacheStatus } from '../../../redux/reducers/cacheReducer';

import { PostTypes } from '../../../constants/postTypes';

import { CommentsSection } from '../children/commentsSection';
import { sortComments } from '../children/sortComments';
import styles from '../children/postComments.styles';
import { PostHtmlInteractionHandler } from '../../postHtmlRenderer';



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
      onUpvotePress
    },
    ref,
  ) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const navigation = useNavigation();

    const currentAccount = useAppSelector((state) => state.account.currentAccount);
    const pinHash = useAppSelector((state) => state.application.pin);
    const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);

    const discussionQuery = postQueries.useDiscussionQuery(author, permlink);
    const postsCachePrimer = postQueries.usePostsCachePrimer();

    const writeCommentRef = useRef(null);
    const postInteractionRef = useRef<typeof PostHtmlInteractionHandler|null>(null);
    const commentsListRef = useRef<FlatList | null>(null);

    const [selectedFilter, setSelectedFilter] = useState('trending');
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
    const [headerHeight, setHeaderHeight] = useState(0);

    const [refreshing, setRefreshing] = useState(false);


    const sortedSections = useMemo(
      () => sortComments(selectedFilter, discussionQuery.sectionedData),
      [discussionQuery.sectionedData, selectedFilter],
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
        setRefreshing(false);
      }
    }, [discussionQuery.isLoading]);

    const _onRefresh = () => {
      setRefreshing(true);
      discussionQuery.refetch();
      onRefresh();
    };

 


    const _handleOnDropdownSelect = (option, index) => {
      setSelectedFilter(option);
      setSelectedOptionIndex(index);
    };

    const _handleOnVotersPress = (activeVotes, content) => {
      navigation.navigate({
        name: ROUTES.SCREENS.VOTERS,
        params: {
          activeVotes,
          content,
        },
        key: content.permlink,
      } as never);
    };

    const _handleOnEditPress = (item) => {
      navigation.navigate({
        name: ROUTES.SCREENS.EDITOR,
        key: `editor_edit_reply_${item.permlink}`,
        params: {
          isEdit: true,
          isReply: true,
          post: item,
        },
      } as never);
    };

    const _handleDeleteComment = (_permlink) => {

      const _onConfirmDelete = async () => {
        try {
          await deleteComment(currentAccount, pinHash, _permlink);
          // remove cached entry based on parent
          const _commentPath = `${currentAccount.username}/${_permlink}`;
          console.log('deleted comment', _commentPath);

          const _deletedItem = discussionQuery.data[_commentPath];
          if (_deletedItem) {
            _deletedItem.status = CacheStatus.DELETED;
            delete _deletedItem.updated;
            dispatch(updateCommentCache(_commentPath, _deletedItem, { isUpdate: true }));
          }
        } catch (err) {
          console.warn('Failed to delete comment')
        }

      }

      dispatch(showActionModal({
        title: intl.formatMessage({ id: 'delete.confirm_delete_title' }),
        buttons: [{
          text: intl.formatMessage({ id: 'alert.cancel' }),
          onPress: () => { console.log("canceled delete comment") }
        }, {
          text: intl.formatMessage({ id: 'alert.delete' }),
          onPress: _onConfirmDelete
        }]
      }))


    };

    const _openReplyThread = (comment) => {
      postsCachePrimer.cachePost(comment);
      navigation.navigate({
        name: ROUTES.SCREENS.POST,
        key: comment.permlink,
        params: {
          author: comment.author,
          permlink: comment.permlink,
        },
      } as never);
    };

    const _handleOnUserPress = (username) => {
      dispatch(showProfileModal(username));
    }

    const _handleShowOptionsMenu = (comment) => {
      const _showCopiedToast = () => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.copied',
            }),
          ),
        );
      };

      const _copyCommentLink = () =>
        writeToClipboard(`https://ecency.com${comment.url}`).then(_showCopiedToast);

      const _copyCommentBody = () => {
        const body = postBodySummary(comment.markdownBody, undefined, Platform.OS);
        writeToClipboard(body).then(_showCopiedToast);
      };

      const _openThread = () => _openReplyThread(comment);

      dispatch(
        showActionModal({
          title: intl.formatMessage({ id: 'post.select_action' }),
          buttons: [
            {
              text: intl.formatMessage({ id: 'post.copy_link' }),
              onPress: _copyCommentLink,
            },
            {
              text: intl.formatMessage({ id: 'post.copy_text' }),
              onPress: _copyCommentBody,
            },
            {
              text: intl.formatMessage({ id: 'post.open_thread' }),
              onPress: _openThread,
            },
          ],
        }),
      );
    };



   


    const _onContentSizeChange = (x: number, y: number) => {
      // update header height
      if (y !== headerHeight) {
        setHeaderHeight(y);
      }
    };



    const _postContentView = (
      <>
        {postContentView && postContentView}
        {!isPostLoading && (
          <FilterBar
            dropdownIconName="arrow-drop-down"
            options={VALUE.map((val) => intl.formatMessage({ id: `comment_filter.${val}` }))}
            defaultText={intl.formatMessage({ id: `comment_filter.${VALUE[0]}` })}
            onDropdownSelect={(selectedIndex) =>
              _handleOnDropdownSelect(COMMENT_FILTER[selectedIndex], selectedIndex)
            }
            selectedOptionIndex={selectedOptionIndex}
          />
        )}
      </>
    );

    const _renderEmptyContent = () => {

      if(isPostLoading){
        return null;
      }

      if (discussionQuery.isLoading || !!sortedSections.length) {
        return (
          <ActivityIndicator style={{ marginTop: 16 }} color={EStyleSheet.value('$primaryBlack')} />
        );
      }
      const _onPress = () => {
        if (handleOnReplyPress) {
          handleOnReplyPress();
        }
      };
      return (
        <Text onPress={_onPress} style={styles.emptyText}>
          {intl.formatMessage({ id: 'comments.no_comments' })}
        </Text>
      );
    };

    const _renderItem = ({ item, index }) => {
      return (
        <CommentsSection
          item={item}
          index={index}
          mainAuthor={mainAuthor}
          handleDeleteComment={_handleDeleteComment}
          handleOnEditPress={_handleOnEditPress}
          handleOnVotersPress={_handleOnVotersPress}
          handleOnLongPress={_handleShowOptionsMenu}
          handleOnUserPress={_handleOnUserPress}
          handleImagePress={postInteractionRef.current?.handleImagePress}
          handleLinkPress={postInteractionRef.current?.handleLinkPress}
          handleVideoPress={postInteractionRef.current?.handleVideoPress}
          handleYoutubePress={postInteractionRef.current?.handleYoutubePress}
          openReplyThread={_openReplyThread}
          onUpvotePress={(args) => onUpvotePress({ ...args, postType: PostTypes.COMMENT })}
        />
      )
    }



    return (
      <Fragment>
        <FlatList
          ref={commentsListRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={_postContentView}
          ListEmptyComponent={_renderEmptyContent}
          data={isPostLoading ? [] : sortedSections}
          onContentSizeChange={_onContentSizeChange}
          renderItem={_renderItem}
          keyExtractor={(item) => `${item.author}/${item.permlink}`}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          updateCellsBatchingPeriod={100}
          windowSize={13}
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
        />
        <PostHtmlInteractionHandler 
          ref={postInteractionRef}
        />
      </Fragment>
        
    );
  },
);

export default PostComments;

