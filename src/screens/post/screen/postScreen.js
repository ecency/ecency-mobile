import React, { Fragment } from 'react';

// Components
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
  permlink,
}) => {
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
        permlink={permlink}
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
