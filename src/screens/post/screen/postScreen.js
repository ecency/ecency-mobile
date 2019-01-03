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
      post, currentAccount, isLoggedIn, fetchPost, isFetchComments, isNewPost,
    } = this.props;

    return (
      <Fragment>
        <BasicHeader
          isHasDropdown
          title="Post"
          content={post}
          dropdownComponent={<PostDropdown content={post} />}
          isNewPost={isNewPost}
        />
        <PostDisplay
          post={post}
          currentAccount={currentAccount}
          isLoggedIn={isLoggedIn}
          fetchPost={fetchPost}
          isFetchComments={isFetchComments}
        />
      </Fragment>
    );
  }
}

export default PostScreen;
