import React, { Fragment, useEffect } from 'react';

// Components
import Orientation, { useDeviceOrientationChange } from 'react-native-orientation-locker';
import { BasicHeader, PostDisplay, PostDropdown } from '../../../components';

const PostScreen = ({
  currentAccount,
  fetchPost,
  isFetchComments,
  isLoggedIn,
  isNewPost,
  parentPost,
  post,
  isPostUnavailable,
  author,
}) => {
  useEffect(() => {
    return () => Orientation.lockToPortrait();
  }, []);

  useDeviceOrientationChange((orientation) => {
    if (orientation === 'LANDSCAPE-RIGHT' || orientation === 'LANDSCAPE-LEFT') {
      Orientation.unlockAllOrientations();
    }
  });
  return (
    <Fragment>
      <BasicHeader
        isHasDropdown
        title="Post"
        content={post}
        dropdownComponent={<PostDropdown content={post} fetchPost={fetchPost} />}
        isNewPost={isNewPost}
      />
      <PostDisplay
        author={author}
        currentAccount={currentAccount}
        isPostUnavailable={isPostUnavailable}
        fetchPost={fetchPost}
        isFetchComments={isFetchComments}
        isLoggedIn={isLoggedIn}
        isNewPost={isNewPost}
        parentPost={parentPost}
        post={post}
      />
    </Fragment>
  );
};

export default PostScreen;
