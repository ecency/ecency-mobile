import React, { useEffect, useState } from 'react';
import { injectIntl, useIntl } from 'react-intl';
import get from 'lodash/get';

// Action
import { useNavigation } from '@react-navigation/native';
import { toastNotification } from '../../../redux/actions/uiAction';

// Dsteem
import { deleteComment } from '../../../providers/hive/dhive';
import { getPostReblogs } from '../../../providers/ecency/ecency';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Component
import PostDisplayView from '../view/postDisplayView';
import { useAppDispatch, useAppSelector } from '../../../hooks';

const PostDisplayContainer = ({
  post,
  fetchPost,
  isFetchPost,
  isFetchComments,
  isNewPost,
  parentPost,
  isPostUnavailable,
  author,
  permlink,
  content,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const currentAccount = useAppSelector(state => state.account.currentAccount);
  const isLoggedIn = useAppSelector(state => state.application.isLoggedIn);
  const pinCode = useAppSelector(state => state.application.pin);

  const [activeVotes, setActiveVotes] = useState([]);
  const [activeVotesCount, setActiveVotesCount] = useState(0);
  const [reblogs, setReblogs] = useState([]);

  useEffect(() => {
    if (post) {
      console.log('Gettting reblogs inside postDisplayContainer');
      const votes = get(post, 'active_votes', []);
      setActiveVotes(votes);
      setActiveVotesCount(votes.length);
      getPostReblogs(post).then((result) => {
        setReblogs(result || []);
      });
    }
  }, [post]);

  useEffect(() => {
    _fetchPost();
  }, [isFetchPost, isFetchComments]);

  // Component Functions
  const _handleOnVotersPress = () => {
    navigation.navigate({
      name: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
        content: post,
      },
      // TODO: make unic
      key: post.permlink + activeVotes.length,
    } as never);
  };

  const _handleOnReblogsPress = () => {
    if (reblogs.length > 0) {
      navigation.navigate({
        name: ROUTES.SCREENS.REBLOGS,
        params: {
          reblogs,
          author: content.author,
          permlink: content.permlink,
        },
        key: post.permlink + reblogs.length,
      } as never);
    }
  };

  const _handleOnReplyPress = () => {
    navigation.navigate({
      name: ROUTES.SCREENS.EDITOR,
      key: 'editor_replay',
      params: {
        isReply: true,
        post,
        fetchPost: _fetchPost,
      },
    } as never);
  };

  const _handleOnEditPress = () => {
    if (post) {
      const isReply = post.parent_author;

      navigation.navigate({
        name: ROUTES.SCREENS.EDITOR,
        key: `editor_post_${post.permlink}`,
        params: {
          isEdit: true,
          isReply,
          post,
          fetchPost: _fetchPost,
        },
      } as never);
    }
  };

  const _handleDeleteComment = (permlink) => {
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


  return (
    <PostDisplayView
      author={author}
      permlink={permlink}
      currentAccount={currentAccount}
      isPostUnavailable={isPostUnavailable}
      isLoggedIn={isLoggedIn}
      isNewPost={isNewPost}
      parentPost={parentPost}
      post={post}
      activeVotes={activeVotes}
      activeVotesCount={activeVotesCount}
      reblogs={reblogs}
      fetchPost={_fetchPost}
      handleOnEditPress={_handleOnEditPress}
      handleOnRemovePress={_handleDeleteComment}
      handleOnReplyPress={_handleOnReplyPress}
      handleOnVotersPress={_handleOnVotersPress}
      handleOnReblogsPress={_handleOnReblogsPress}

    />
  );
};


export default injectIntl(PostDisplayContainer);
