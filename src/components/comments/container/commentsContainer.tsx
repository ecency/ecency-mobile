import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

import { postBodySummary } from '@ecency/render-helper';
import { useNavigation } from '@react-navigation/native';
import { getComments, deleteComment } from '../../../providers/hive/dhive';
// Services and Actions
import { writeToClipboard } from '../../../utils/clipboard';
import { showProfileModal, toastNotification } from '../../../redux/actions/uiAction';

// Middleware

// Constants
import ROUTES from '../../../constants/routeNames';

// Component
import CommentsView from '../view/commentsView';
import { updateCommentCache } from '../../../redux/actions/cacheActions';
import { CacheStatus } from '../../../redux/reducers/cacheReducer';
import { postQueries } from '../../../providers/queries';
import { PostTypes } from '../../../constants/postTypes';

const CommentsContainer = ({
  author,
  permlink,
  selectedFilter,
  currentAccount: { name },
  isOwnProfile,
  fetchPost,
  currentAccount,
  pinCode,
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
}) => {
  const navigation = useNavigation();
  const postsCachePrimer = postQueries.usePostsCachePrimer();

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
      await getComments(author, permlink, name)
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

  const _handleDeleteComment = (_permlink, _parent_permlink) => {
    let filteredComments;
    if (postType === PostTypes.WAVE && handleCommentDelete) {
      handleCommentDelete({
        _permlink,
        _parent_permlink,
      });
      return;
    }
    deleteComment(currentAccount, pinCode, _permlink).then(() => {
      let deletedItem = null;

      const _applyFilter = (item) => {
        if (item.permlink === _permlink) {
          deletedItem = item;
          return false;
        }
        return true;
      };

      if (lcomments.length > 0) {
        filteredComments = lcomments.filter(_applyFilter);
        setLComments(filteredComments);
      } else {
        filteredComments = propComments.filter(_applyFilter);
        setPropComments(filteredComments);
      }

      // remove cached entry based on parent
      if (deletedItem) {
        const cachePath = `${deletedItem.author}/${deletedItem.permlink}`;
        deletedItem.status = CacheStatus.DELETED;
        delete deletedItem.updated;
        dispatch(updateCommentCache(cachePath, deletedItem, { isUpdate: true }));
      }
    });
  };

  const _handleOnUserPress = (username) => {
    if (username) {
      dispatch(showProfileModal(username));
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
    />
  );
};

const mapStateToProps = (state) => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
});

export default connect(mapStateToProps)(injectIntl(CommentsContainer));
