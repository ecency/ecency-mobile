import React, { Component, Fragment } from 'react';

// Constants

// Components
import { EditorHeader } from '../../../components/editorHeader';
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
    const { post } = this.props;

    return (
      <Fragment>
        <EditorHeader isHasDropdown title="Post" />
        <PostDisplay post={post} />
      </Fragment>
    );
  }
}

export default PostScreen;
