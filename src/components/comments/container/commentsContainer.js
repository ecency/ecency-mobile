import React, { useState, useEffect, useCallback } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

import { getComments, deleteComment } from '../../../providers/steem/dsteem';
// Services and Actions
import { writeToClipboard } from '../../../utils/clipboard';
import { toastNotification } from '../../../redux/actions/uiAction';

// Middleware

// Constants
import ROUTES from '../../../constants/routeNames';

// Component
import CommentsView from '../view/commentsView';

const CommentsContainer = ({
  author,
  permlink,
  selectedFilter,
  currentAccount: { name },
  isOwnProfile,
  fetchPost,
  navigation,
  content,
  currentAccount,
  pinCode,
  comments,
  dispatch,
  intl,
  commentCount,
  isLoggedIn,
  commentNumber,
  isShowMoreButton,
  mainAuthor,
  selectedPermlink: _selectedPermlink,
  isHideImage,
  isShowSubComments,
  hasManyComments,
  showAllComments,
  hideManyCommentsButton,
}) => {
  const [lcomments, setLComments] = useState([]);
  const [selectedPermlink, setSelectedPermlink] = useState('');

  useEffect(() => {
    _getComments();
  }, []);

  useEffect(() => {
    _getComments();
    const shortedComments = _shortComments(selectedFilter);
    setLComments(shortedComments);
  }, [commentCount, selectedFilter]);

  // Component Functions

  const _shortComments = (sortOrder, _comments) => {
    const sortedComments = _comments || lcomments;

    const allPayout = c =>
      parseFloat(get(c, 'pending_payout_value').split(' ')[0]) +
      parseFloat(get(c, 'total_payout_value').split(' ')[0]) +
      parseFloat(get(c, 'curator_payout_value').split(' ')[0]);

    const absNegative = a => a.net_rshares < 0;

    const sortOrders = {
      trending: (a, b) => {
        if (absNegative(a)) {
          return 1;
        }

        if (absNegative(b)) {
          return -1;
        }

        const apayout = allPayout(a);
        const bpayout = allPayout(b);
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
        const keyA = a.net_votes;
        const keyB = b.net_votes;

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
      fetchPost();
    } else if (author && permlink) {
      await getComments(author, permlink, name)
        .then(__comments => {
          if (selectedFilter) {
            const sortComments = _shortComments(selectedFilter, __comments);
            setLComments(sortComments);
          } else {
            setLComments(__comments);
          }
        })
        .catch(() => {});
    }
  };

  const _handleOnReplyPress = item => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        isReply: true,
        post: item,
        fetchPost,
      },
    });
  };

  const _handleOnVotersPress = activeVotes => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
      },
      key: get(content, 'permlink'),
    });
  };

  const _handleOnEditPress = item => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        isEdit: true,
        isReply: true,
        post: item,
        fetchPost: _getComments,
      },
    });
  };

  const _handleDeleteComment = _permlink => {
    let filteredComments;

    deleteComment(currentAccount, pinCode, _permlink).then(() => {
      if (lcomments.length > 0) {
        filteredComments = lcomments.filter(item => item.permlink !== _permlink);
      } else {
        filteredComments = comments.filter(item => item.permlink !== _permlink);
      }
      setLComments(filteredComments);
    });
  };

  const _handleOnPressCommentMenu = (index, selectedComment) => {
    if (index === 0) {
      writeToClipboard(`https://esteem.app${get(selectedComment, 'url')}`).then(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.copied',
            }),
          ),
        );
      });
    } else if (index === 1 && isOwnProfile) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        key: get(selectedComment, 'permlink'),
        params: {
          author: get(selectedComment, 'author'),
          permlink: get(selectedComment, 'permlink'),
        },
      });
    }
  };

  return (
    <CommentsView
      key={selectedFilter}
      hasManyComments={hasManyComments}
      hideManyCommentsButton={hideManyCommentsButton}
      selectedFilter={selectedFilter}
      selectedPermlink={_selectedPermlink || selectedPermlink}
      author={author}
      mainAuthor={mainAuthor}
      isShowMoreButton={isShowMoreButton}
      commentNumber={commentNumber || 1}
      commentCount={commentCount}
      comments={lcomments.length > 0 ? lcomments : comments}
      currentAccountUsername={currentAccount.name}
      handleOnEditPress={_handleOnEditPress}
      handleOnReplyPress={_handleOnReplyPress}
      isLoggedIn={isLoggedIn}
      fetchPost={fetchPost}
      handleDeleteComment={_handleDeleteComment}
      handleOnPressCommentMenu={_handleOnPressCommentMenu}
      isOwnProfile={isOwnProfile}
      isHideImage={isHideImage}
      handleOnVotersPress={_handleOnVotersPress}
      isShowSubComments={isShowSubComments}
      showAllComments={showAllComments}
    />
  );
};

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
});

export default withNavigation(connect(mapStateToProps)(injectIntl(CommentsContainer)));
