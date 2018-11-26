import React, { Component, Fragment } from 'react';

// Constants

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { PostDisplay } from '../../../components/postView';
// Styles
// eslint-disable-next-line
//import styles from './_styles';

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
    const { post, currentUser } = this.props;

    return (
      <Fragment>
        <BasicHeader isHasDropdown title="Post" />
        <PostDisplay post={post} currentUser={currentUser} />
      </Fragment>
    );
  }
}

export default PostScreen;
