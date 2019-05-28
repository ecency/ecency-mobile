import React, { PureComponent, Fragment } from 'react';

// Constants

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { PostDisplay } from '../../../components/postView';
import { PostDropdown } from '../../../components/postDropdown';

class PostScreen extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const {
      currentAccount,
      fetchPost,
      isFetchComments,
      isLoggedIn,
      isNewPost,
      parentPost,
      post,
      isPostUnavailable,
      author,
    } = this.props;

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
  }
}

export default PostScreen;
