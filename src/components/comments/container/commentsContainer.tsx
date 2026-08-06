import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

import { useNavigation } from '@react-navigation/native';
import { SheetManager } from 'react-native-actions-sheet';
import { getDiscussionsQueryOptions, useDeleteComment } from '@ecency/sdk';
import { useQueryClient } from '@tanstack/react-query';
// Services and Actions
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
  commentCount,
  isLoggedIn,
  commentNumber,
  mainAuthor,
  handleOnOptionsPress,
  selectedPermlink,
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
  onAuthorPress,
}: any) => {
  const navigation = useNavigation();
  const postsCachePrimer = postQueries.usePostsCachePrimer();
  const queryClient = useQueryClient();
  const authContext = useAuthContext();
  const deleteCommentMutation = useDeleteComment(currentAccount?.name, authContext, 'async');

  const [lcomments, setLComments] = useState<any[]>([]);
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

  const _sortComments = (sortOrder = 'trending', _comments?: any) => {
    const _source = _comments || lcomments;
    // Guard against non-array inputs (discussion map / undefined) reaching .sort —
    // was a top Sentry crash ("undefined is not a function").
    const sortedComments = Array.isArray(_source) ? _source : [];

    const absNegative = (a: any) => a.net_rshares < 0;

    const sortOrders = {
      trending: (a: any, b: any) => {
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
      reputation: (a: any, b: any) => {
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
      votes: (a: any, b: any) => {
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
      age: (a: any, b: any) => {
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

    sortedComments.sort((sortOrders as any)[sortOrder]);

    return sortedComments;
  };

  const _getComments = async () => {
    if (isOwnProfile) {
      if (fetchPost) {
        await fetchPost();
      }
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

  const _handleOnVotersPress = (activeVotes: any, content: any) => {
    navigation.navigate({
      name: ROUTES.SCREENS.VOTERS,
      params: {
        content,
      },
      key: get(content, 'permlink'),
    });
  };

  const _handleOnEditPress = (item: any) => {
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

  const _handleDeleteComment = (
    _permlink: any,
    _parent_permlink: any,
    _parent_author: any,
    _root_author?: any,
    _root_permlink?: any,
  ) => {
    if (postType === PostTypes.WAVE && handleCommentDelete) {
      handleCommentDelete({
        _permlink,
        _parent_permlink,
        // The container account the wave lives under (hive.flow or
        // ecency.waves); decides which host the delete is broadcast against.
        _parent_author,
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
        setPropComments((prev: any) => prev.filter((item: any) => item.permlink !== _permlink));
      })
      .catch((err) => {
        const errorDetail = err?.message ? String(err.message) : String(err);
        dispatch(toastNotification(`Failed to delete comment: ${errorDetail}`));
        console.warn('Failed to delete comment', err);
      });
  };

  const _handleOnUserPress = (username: any) => {
    if (username) {
      SheetManager.show(SheetNames.QUICK_PROFILE, {
        payload: {
          username,
        },
      });
    }
  };

  const _openReplyThread = (comment: any) => {
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
      handleOnOptionsPress={handleOnOptionsPress}
      handleOnUserPress={_handleOnUserPress}
      isOwnProfile={isOwnProfile}
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
      onAuthorPress={onAuthorPress}
    />
  );
};

const mapStateToProps = (state: any) => ({
  isLoggedIn: selectIsLoggedIn(state),
  currentAccount: selectCurrentAccount(state),
});

export default connect(mapStateToProps)(injectIntl(CommentsContainer));
