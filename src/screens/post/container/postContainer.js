import React, { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import get from 'lodash/get';

// Services and Action
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { getPost } from '../../../providers/hive/dhive';

// Component
import PostScreen from '../screen/postScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  content           which is include all post data                  Object
 *
 */
const PostContainer = ({ currentAccount, isLoggedIn, route }) => {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [isPostUnavailable, setIsPostUnavailable] = useState(false);
  const [parentPost, setParentPost] = useState(null);

  const deviceOrientation = useSelector((state) => state.ui.deviceOrientation);

  let author;

  // Commented Orientation Locker causing issues on Android. Can be enabled later
  /*
  useEffect(() => {
    return () => Orientation.lockToPortrait();
  }, []);

  useEffect(() => {
    if (deviceOrientation === 'LANDSCAPE-RIGHT' || deviceOrientation === 'LANDSCAPE-LEFT') {
      Orientation.unlockAllOrientations();
    } else {
      Orientation.lockToPortrait();
    }
  }, [deviceOrientation]);
  */

  useEffect(() => {
    const { content, permlink, author: _author, isNewPost: _isNewPost } = route.params ?? {};
    if (_isNewPost) {
      setIsNewPost(_isNewPost);
    }

    if (content) {
      if (content.author && content.permlink) {
        _loadPost(content.author, content.permlink);
      } else {
        setPost(content);
      }
    } else if (_author && permlink) {
      _loadPost(_author, permlink);
      author = _author;
    }
  }, []);

  // Component Functions

  const _loadPost = async (__author = null, permlink = null, isParentPost = false) => {
    const _author = __author || get(post, 'author');
    const _permlink = permlink || get(post, 'permlink');

    await getPost(_author, _permlink, isLoggedIn && get(currentAccount, 'username'))
      .then((result) => {
        if (get(result, 'post_id', 0) > 0) {
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
    const { isFetch: nextIsFetch } = route.params ?? {};
    if (nextIsFetch) {
      const { author: _author, permlink } = route.params;

      _loadPost(_author, permlink);
    }
  }, [route.params.isFetch]);

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
      orientation={deviceOrientation}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  isLoggedIn: state.application.isLoggedIn,
});

export default gestureHandlerRootHOC(connect(mapStateToProps)(PostContainer));
