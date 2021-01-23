import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import get from 'lodash/get';

// Services and Actions
import Matomo from 'react-native-matomo-sdk';
import { getPost } from '../../../providers/hive/dhive';
// import { matomo } from '../../../providers/ecency/analytics';

// Component
import PostScreen from '../screen/postScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  content           which is include all post data                  Object
 *
 */
const PostContainer = ({ navigation, currentAccount, isLoggedIn, isAnalytics }) => {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [isPostUnavailable, setIsPostUnavailable] = useState(false);
  const [parentPost, setParentPost] = useState(null);

  let author;

  useEffect(() => {
    const { content, permlink, author: _author, isNewPost: _isNewPost } = get(
      navigation,
      'state.params',
    );
    if (_isNewPost) {
      setIsNewPost(_isNewPost);
    }

    if (content) {
      if (content.author && content.permlink) {
        _loadPost(content.author, content.permlink);
      } else {
        setPost(content);
      }
      // tracking info
      if (isAnalytics) {
        Matomo.trackView([`${content.url}`]).catch((error) =>
          console.warn('Failed to track screen', error),
        );
      }
    } else if (_author && permlink) {
      _loadPost(_author, permlink);
      author = _author;

      // tracking info
      if (isAnalytics) {
        Matomo.trackView([`/post/@${_author}/${permlink}`]).catch((error) =>
          console.warn('Failed to track screen', error),
        );
      }
    }
  }, []);

  // Component Functions

  const _loadPost = async (__author = null, permlink = null, isParentPost = false) => {
    const _author = __author || get(post, 'author');
    const _permlink = permlink || get(post, 'permlink');

    await getPost(_author, _permlink, isLoggedIn && get(currentAccount, 'username'))
      .then((result) => {
        if (get(result, 'id', 0) > 0) {
          if (isParentPost) {
            setParentPost(result);
          } else {
            setPost(result);
          }
        } else {
          setIsPostUnavailable(true);
        }
      })
      .catch((err) => {
        setError(err);
      });
  };

  useEffect(() => {
    const { isFetch: nextIsFetch } = navigation.state.params;
    if (nextIsFetch) {
      const { author: _author, permlink } = get(navigation, 'state.params');

      _loadPost(_author, permlink);
    }
  }, [navigation.state.params.isFetch]);

  if (
    !parentPost &&
    post &&
    get(post, 'depth') > 0 &&
    get(post, 'parent_author') &&
    get(post, 'parent_permlink')
  ) {
    _loadPost(get(post, 'parent_author'), get(post, 'parent_permlink'), true);
  }

  return (
    <PostScreen
      currentAccount={currentAccount}
      error={error}
      author={author}
      fetchPost={_loadPost}
      isFetchComments
      isLoggedIn={isLoggedIn}
      isNewPost={isNewPost}
      parentPost={parentPost}
      post={post}
      isPostUnavailable={isPostUnavailable}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  isLoggedIn: state.application.isLoggedIn,
  isAnalytics: state.application.isAnalytics,
});

export default connect(mapStateToProps)(withNavigation(PostContainer));
