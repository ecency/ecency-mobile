import React, { useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

// Action
import { toastNotification } from '../../../redux/actions/uiAction';

// Dsteem
import { deleteComment } from '../../../providers/steem/dsteem';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

// Component
import PostDisplayView from '../view/postDisplayView';

const PostDisplayContainer = ({
  navigation,
  post,
  fetchPost,
  isFetchPost,
  currentAccount,
  pinCode,
  dispatch,
  intl,
  isLoggedIn,
  isNewPost,
  parentPost,
  isPostUnavailable,
  author,
}) => {
  // Component Functions
  const _handleOnVotersPress = activeVotes => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
      },
      // TODO: make unic
      key: post.permlink + activeVotes.length,
    });
  };

  const _handleOnReblogsPress = reblogs => {
    if (reblogs.length > 0) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.REBLOGS,
        params: {
          reblogs,
        },
        key: post.permlink + reblogs.length,
      });
    }
  };

  const _handleOnReplyPress = () => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        isReply: true,
        post,
        fetchPost: _fetchPost,
      },
    });
  };

  const _handleOnEditPress = () => {
    if (post) {
      const isReply = post.parent_author;

      navigation.navigate({
        routeName: ROUTES.SCREENS.EDITOR,
        params: {
          isEdit: true,
          isReply,
          post,
          fetchPost: _fetchPost,
        },
      });
    }
  };

  const _handleDeleteComment = permlink => {
    deleteComment(currentAccount, pinCode, permlink).then(() => {
      navigation.goBack();
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.removed',
          }),
        ),
      );
    });
  };

  const _fetchPost = async () => {
    if (post) {
      fetchPost(post.author, post.permlink);
    }
  };

  useEffect(() => {
    _fetchPost();
  }, [isFetchPost]);

  return (
    <PostDisplayView
      author={author}
      currentAccount={currentAccount}
      fetchPost={_fetchPost}
      handleOnEditPress={_handleOnEditPress}
      handleOnRemovePress={_handleDeleteComment}
      handleOnReplyPress={_handleOnReplyPress}
      handleOnVotersPress={_handleOnVotersPress}
      handleOnReblogsPress={_handleOnReblogsPress}
      isLoggedIn={isLoggedIn}
      isNewPost={isNewPost}
      isPostUnavailable={isPostUnavailable}
      parentPost={parentPost}
      post={post}
    />
  );
};

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  isLoggedIn: state.application.isLoggedIn,
});

export default withNavigation(connect(mapStateToProps)(injectIntl(PostDisplayContainer)));
