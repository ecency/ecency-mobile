import React, { Component, Fragment } from 'react';

// Constants

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { PostDisplay } from '../../../components/postView';
import { PostDropdown } from '../../../components/postDropdown';

class PostScreen extends Component {
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
    const { post, currentAccount, isLoggedIn } = this.props;

    return (
      <Fragment>
        <BasicHeader
          isHasDropdown
          title="Post"
          content={post}
          dropdownComponent={<PostDropdown content={post} />}
        />
        <PostDisplay post={post} currentAccount={currentAccount} isLoggedIn={isLoggedIn} />
      </Fragment>
    );
  }
}

export default PostScreen;
