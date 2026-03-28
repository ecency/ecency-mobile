import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

import { postBodySummary } from '@ecency/render-helper';
import { useNavigation } from '@react-navigation/native';
import { SheetManager } from 'react-native-actions-sheet';
import { getDiscussionsQueryOptions, useDeleteComment } from '@ecency/sdk';
import { useQueryClient } from '@tanstack/react-query';
// Services and Actions
import { writeToClipboard } from '../../../utils/clipboard';
import { toastNotification } from '../../../redux/actions/uiAction';

// Constants
import ROUTES from '../../../constants/routeNames';

// Component
import CommentsView from '../view/commentsView';
import { postQueries } from '../../../providers/queries';
import { PostTypes } from '../../../constants/postTypes';
import { SheetNames } from '../../../navigation/sheets';
import { selectCurrentAccount, selectIsLoggedIn } from '../../../redux/selectors';
import { useAuthContext } from '../../../providers/sdk';

const CommentsContainer = ({
  author,
  permlink,
  selectedFilter,
  isOwnProfile,
  fetchPost,
  currentAccount,
  comments,
  dispatch,
  intl,
  commentCount,
  isLoggedIn,
  commentNumber,
  mainAuthor,
  handleOnOptionsPress,
  selectedPermlink,
  isHideImage,
  isShowSubComments,
  hasManyComments,
  showAllComments,
  hideManyCommentsButton,
  flatListProps,
  postContentView,
  isLoading,
  fetchedAt,
  incrementRepliesCount,
  handleOnReplyPress,
  handleOnCommentsLoaded,
  postType,
  handleCommentDelete,
  onTagPress,
}) => {
  const navigation = useNavigation();
  const postsCachePrimer = postQueries.usePostsCachePrimer();
  const queryClient = useQueryClient();
  const authContext = useAuthContext();
  const deleteCommentMutation = useDeleteComment(currentAccount?.name, authContext);

  const [lcomments, setLComments] = useState([]);
  const [propComments, setPropComments] = useState(comments);

  useEffect(() => {
    _getComments();
  }, []);

  useEffect(() => {
    _getComments();
    const sortedComments = _sortComments(selectedFilter);
    setLComments(sortedComments);
  }, [commentCount, selectedFilter]);

  useEffect(() => {
    const _comments = comments;
    setPropComments(_comments);
  }, [comments]);

  // Component Functions

  const _sortComments = (sortOrder = 'trending', _comments) => {
    const sortedComments = _comments || lcomments;

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
        const keyA = get(a, 'author_reputation');
        const keyB = get(b, 'author_reputation');

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

        const keyA = Date.parse(get(a, 'created'));
        const keyB = Date.parse(get(b, 'created'));

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

  const _getComments = async () => {
    if (isOwnProfile) {
      await fetchPost();
      if (handleOnCommentsLoaded) {
        handleOnCommentsLoaded();
      }
    } else if (author && permlink && !propComments) {
      await queryClient
        .fetchQuery(getDiscussionsQueryOptions(author, permlink))
        .then((__comments) => {
          // favourable place for merging comment cache
          __comments = _sortComments(selectedFilter, __comments);

          setLComments(__comments);
          if (handleOnCommentsLoaded) {
            handleOnCommentsLoaded();
          }
        })
        .catch(() => {
          console.log('cancel pressed');
        });
    }
  };

  const _handleOnVotersPress = (activeVotes, content) => {
    navigation.navigate({
      name: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
        content,
      },
      key: get(content, 'permlink'),
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
        fetchPost: _getComments,
      },
    });
  };

  const _handleDeleteComment = (
    _permlink,
    _parent_permlink,
    _parent_author,
    _root_author?,
    _root_permlink?,
  ) => {
    if (postType === PostTypes.WAVE && handleCommentDelete) {
      handleCommentDelete({
        _permlink,
        _parent_permlink,
      });
      return;
    }
    deleteCommentMutation
      .mutateAsync({
        author: currentAccount?.name,
        permlink: _permlink,
        parentAuthor: _parent_author,
        parentPermlink: _parent_permlink || permlink,
        rootAuthor: _root_author || author,
        rootPermlink: _root_permlink || permlink,
      })
      .then(() => {
        // Remove from local state for immediate UI update
        setLComments((prev) => prev.filter((item) => item.permlink !== _permlink));
        setPropComments((prev) => prev.filter((item) => item.permlink !== _permlink));
      })
      .catch((err) => {
        const errorDetail = err?.message ? String(err.message) : String(err);
        dispatch(toastNotification(`Failed to delete comment: ${errorDetail}`));
        console.warn('Failed to delete comment', err);
      });
  };

  const _handleOnUserPress = (username) => {
    if (username) {
      SheetManager.show(SheetNames.QUICK_PROFILE, {
        payload: {
          username,
        },
      });
    }
  };

  const _openReplyThread = (comment) => {
    postsCachePrimer.cachePost(comment);
    navigation.navigate({
      name: ROUTES.SCREENS.POST,
      params: {
        author: comment.author,
        permlink: comment.permlink,
      },
      key: `${comment.author}/${comment.permlink}`,
    });
  };

  const _handleOnPressCommentMenu = (index, selectedComment) => {
    const _showCopiedToast = () => {
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.copied',
          }),
        ),
      );
    };

    if (index === 0) {
      writeToClipboard(`https://ecency.com${get(selectedComment, 'url')}`).then(_showCopiedToast);
    }
    if (index === 1) {
      const body = postBodySummary(selectedComment.markdownBody, null, Platform.OS);
      writeToClipboard(body).then(_showCopiedToast);
    } else if (index === 2) {
      _openReplyThread(selectedComment);
    }
  };

  return (
    <CommentsView
      key={selectedFilter}
      hasManyComments={hasManyComments}
      hideManyCommentsButton={hideManyCommentsButton}
      selectedFilter={selectedFilter}
      selectedPermlink={selectedPermlink}
      author={author}
      mainAuthor={mainAuthor}
      commentNumber={commentNumber || 1}
      commentCount={commentCount}
      comments={lcomments.length > 0 ? lcomments : propComments}
      currentAccountUsername={currentAccount.name}
      handleOnEditPress={_handleOnEditPress}
      handleOnReplyPress={handleOnReplyPress}
      isLoggedIn={isLoggedIn}
      fetchPost={fetchPost}
      handleDeleteComment={_handleDeleteComment}
      handleOnPressCommentMenu={_handleOnPressCommentMenu}
      handleOnOptionsPress={handleOnOptionsPress}
      handleOnUserPress={_handleOnUserPress}
      isOwnProfile={isOwnProfile}
      isHideImage={isHideImage}
      handleOnVotersPress={_handleOnVotersPress}
      isShowSubComments={isShowSubComments}
      showAllComments={showAllComments}
      flatListProps={flatListProps}
      openReplyThread={_openReplyThread}
      incrementRepliesCount={incrementRepliesCount}
      fetchedAt={fetchedAt}
      postContentView={postContentView}
      isLoading={isLoading}
      postType={postType}
      onTagPress={onTagPress}
    />
  );
};

const mapStateToProps = (state) => ({
  isLoggedIn: selectIsLoggedIn(state),
  currentAccount: selectCurrentAccount(state),
});

export default connect(mapStateToProps)(injectIntl(CommentsContainer));
