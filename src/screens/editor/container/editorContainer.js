import React, { Component } from 'react';

// Services and Actions
import { postContent } from '../../../providers/steem/dsteem';
import { getUserData } from '../../../realm/realm';

// Middleware

// Constants

// Utilities
import { generatePermlink } from '../../../utils/editor';
import { decryptKey } from '../../../utils/crypto';

// Component
import { EditorScreen } from '../screen/editorScreen';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class ExampleContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  _submitPost = async () => {
    let userData;
    let postingKey;

    await getUserData().then((res) => {
      userData = Array.from(res);
      postingKey = decryptKey(userData[0].postingKey, '1234');
    });

    const post = {
      body: this.state.body,
      title: this.state.title,
      author: userData[0].username,
      permlink: generatePermlink(),
      tags: this.state.tags,
    };

    postContent(post, postingKey)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  _handleSubmit = (form) => {
    alert(form);
  };

  render() {
    return <EditorScreen handleOnSubmit={this._handleSubmit} />;
  }
}

export default ExampleContainer;
