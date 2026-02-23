import React, { useCallback, useEffect, useState } from 'react';
import get from 'lodash/get';

// Action
import { useNavigation } from '@react-navigation/native';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Component
import PostDisplayView from '../view/postDisplayView';
import { useAppSelector } from '../../../hooks';
import { selectCurrentAccount, selectIsLoggedIn } from '../../../redux/selectors';

const PostDisplayContainer = ({
  post,
  fetchPost,
  isFetchPost,
  isFetchComments,
  isNewPost,
  parentPost,
  isPostUnavailable,
  isWavePost,
  author,
  permlink,
}) => {
  const navigation = useNavigation();

  const currentAccount = useAppSelector(selectCurrentAccount);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const [activeVotes, setActiveVotes] = useState([]);
  const [activeVotesCount, setActiveVotesCount] = useState(0);

  useEffect(() => {
    if (post) {
      const votes = get(post, 'active_votes', []);
      const activeVotesCount = get(post, 'stats.total_votes', 0);
      setActiveVotes((prevVotes) => (prevVotes !== votes ? votes : prevVotes));
      setActiveVotesCount((prevCount) =>
        prevCount !== activeVotesCount ? activeVotesCount : prevCount,
      );
    }
  }, [post]);

  // Component Functions
  const _fetchPost = useCallback(async () => {
    if (post) {
      fetchPost(post?.author, post?.permlink);
    }
  }, [post?.author, post?.permlink, fetchPost]);

  useEffect(() => {
    if (isFetchPost || isFetchComments) {
      _fetchPost();
    }
  }, [isFetchPost, isFetchComments, _fetchPost]);

  const _handleOnVotersPress = useCallback(() => {
    navigation.navigate({
      name: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
        content: post,
      },
      // TODO: make unic
      key: post?.permlink + activeVotes.length,
    } as never);
  }, [navigation, activeVotes, post]);

  const _handleOnReblogsPress = useCallback(() => {
    navigation.navigate({
      name: ROUTES.SCREENS.REBLOGS,
      params: {
        author,
        permlink,
      },
      key: `${post?.permlink}-reblogs-${post?.reblogs ?? 0}`,
    } as never);
  }, [navigation, author, permlink, post?.permlink, post?.reblogs]);

  const _handleOnReplyPress = useCallback(() => {
    navigation.navigate({
      name: ROUTES.SCREENS.EDITOR,
      key: 'editor_replay',
      params: {
        isReply: true,
        post,
        fetchPost: _fetchPost,
      },
    } as never);
  }, [navigation, post, _fetchPost]);

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
      activeVotesCount={activeVotesCount}
      isWavePost={isWavePost}
      fetchPost={_fetchPost}
      handleOnReplyPress={_handleOnReplyPress}
      handleOnVotersPress={_handleOnVotersPress}
      handleOnReblogsPress={_handleOnReblogsPress}
    />
  );
};

export default PostDisplayContainer;
