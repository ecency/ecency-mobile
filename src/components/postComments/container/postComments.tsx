import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { ActivityIndicator, Platform, RefreshControl, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';

// Components
import { postBodySummary } from '@ecency/render-helper';
import COMMENT_FILTER, { VALUE } from '../../../constants/options/comment';
import { FilterBar } from '../../filterBar';
import { postQueries } from '../../../providers/queries';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import ROUTES from '../../../constants/routeNames';
import { showActionModal, toastNotification } from '../../../redux/actions/uiAction';
import { writeToClipboard } from '../../../utils/clipboard';
import { deleteComment } from '../../../providers/hive/dhive';
import { updateCommentCache } from '../../../redux/actions/cacheActions';
import { CommentCacheStatus } from '../../../redux/reducers/cacheReducer';
import { CommentsSection } from '../children/commentsSection';
import styles from '../children/postComments.styles';
import EStyleSheet from 'react-native-extended-stylesheet';


const PostComments = forwardRef(
  (
    {
      author,
      permlink,
      mainAuthor,
      postContentView,
      isLoading,
      onRefresh,
      handleOnCommentsLoaded,
      handleOnReplyPress
    },
    ref,
  ) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const navigation = useNavigation();

    const currentAccount = useAppSelector((state) => state.account.currentAccount);
    const pinHash = useAppSelector((state) => state.application.pin);
    const isDarkTheme = useAppSelector(state => state.application.isDarkTheme);

    const discussionQuery = postQueries.useDiscussionQuery(author, permlink);
    const postsCachePrimer = postQueries.usePostsCachePrimer();

    const writeCommentRef = useRef(null);
    const commentsListRef = useRef<FlatList | null>(null)

    const [selectedFilter, setSelectedFilter] = useState('trending');
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
    const [shouldRenderComments, setShouldRenderComments] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);



    const sortedSections = useMemo(
      () => _sortComments(selectedFilter, discussionQuery.sectionedData),
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
        if (commentsListRef.current && (!sortedSections.length || !shouldRenderComments)) {
          commentsListRef.current.scrollToOffset({ offset: headerHeight + 200 })
        } else if (commentsListRef.current && sortedSections.length) {
          commentsListRef.current.scrollToIndex({ index: 0, viewOffset: 108 });
        }
      }
    }));




    useEffect(() => {
      if (!discussionQuery.isLoading) {
        handleOnCommentsLoaded();
      }
    }, [discussionQuery.isLoading]);


    const _onRefresh = () => {
      discussionQuery.refetch();
      onRefresh();
    }


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
      });
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
      });
    };




    const _handleDeleteComment = (_permlink) => {
      deleteComment(currentAccount, pinHash, _permlink).then(() => {

        // remove cached entry based on parent
        const _commentPath = `${currentAccount.username}/${_permlink}`
        console.log("deleted comment", _commentPath);

        const _deletedItem = discussionQuery.data[_commentPath];
        if (_deletedItem) {
          _deletedItem.status = CommentCacheStatus.DELETED;
          delete _deletedItem.updated;
          dispatch(updateCommentCache(_commentPath, _deletedItem, { isUpdate: true }));
        }

      });
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
      });
    };




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
      //lazy render comments after post is rendered;
      if (!shouldRenderComments) {
        setHeaderHeight(y);
        setShouldRenderComments(true);
      }
    }



    const _postContentView = (
      <>
        {postContentView && postContentView}
        {!isLoading && (
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
      if (discussionQuery.isLoading || !!sortedSections.length) {
        return <ActivityIndicator style={{marginTop: 16}} color={EStyleSheet.value('$primaryBlack')}  />;
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
      return <CommentsSection
        item={item}
        index={index}
        mainAuthor={mainAuthor}
        handleDeleteComment={_handleDeleteComment}
        handleOnEditPress={_handleOnEditPress}
        handleOnVotersPress={_handleOnVotersPress}
        handleOnLongPress={_handleShowOptionsMenu}
        openReplyThread={_openReplyThread}
      />
    }



    return (
      <FlatList
        ref={commentsListRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={_postContentView}
        ListEmptyComponent={_renderEmptyContent}
        data={shouldRenderComments ? sortedSections : []}
        onContentSizeChange={_onContentSizeChange}
        renderItem={_renderItem}
        keyExtractor={(item) => `${item.author}/${item.permlink}`}
        refreshControl={
          <RefreshControl
            refreshing={discussionQuery.isFetching}
            onRefresh={_onRefresh}
            progressBackgroundColor="#357CE6"
            tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
            titleColor="#fff"
            colors={['#fff']} />
        }
      />
    );
  },
);

export default PostComments;



const _sortComments = (sortOrder = 'trending', _comments) => {
  const sortedComments = _comments;

  const absNegative = (a) => a.net_rshares < 0;

  const sortOrders = {
    trending: (a, b) => {
      if (absNegative(a)) {
        return 1;
      }

      if (absNegative(b)) {
        return -1;
      }

      const apayout = a.total_payout;
      const bpayout = b.total_payout;

      if (apayout !== bpayout) {
        return bpayout - apayout;
      }

      return 0;
    },
    reputation: (a, b) => {
      const keyA = a.author_reputation;
      const keyB = b.author_reputation;

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
    votes: (a, b) => {
      const keyA = a.active_votes.length;
      const keyB = b.active_votes.length;

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
    age: (a, b) => {
      if (absNegative(a)) {
        return 1;
      }

      if (absNegative(b)) {
        return -1;
      }

      const keyA = Date.parse(a.created);
      const keyB = Date.parse(b.created);

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
  };

  sortedComments.sort(sortOrders[sortOrder]);

  return sortedComments;
};
