import React, { Component } from 'react';

// Services and Actions
import { postContent } from '../../../providers/steem/dsteem';
import { getUserData } from '../../../realm/realm';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

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

  _submitPost = async (form) => {
    const { navigation } = this.props;
    let userData;
    let postingKey;
    const title = form.formFields['title-area'].content;
    const permlink = generatePermlink(title);

    await getUserData().then((res) => {
      userData = res && Array.from(res)[0];
      postingKey = decryptKey(userData.postingKey, '1234');
    });

    if (userData) {
      const post = {
        body: form.formFields['text-area'].content,
        title,
        author: userData.username,
        permlink: permlink && permlink,
        tags: form.tags,
      };

      postContent(post, postingKey)
        .then((result) => {
          alert('Your post succesfully shared');
          navigation.navigate(ROUTES.SCREENS.HOME);
        })
        .catch((error) => {
          alert(`Opps! there is a problem${error}`);
        });
    }
  };

  _handleSubmit = (form) => {
    this._submitPost(form);
  };

  render() {
    return <EditorScreen handleOnSubmit={this._handleSubmit} />;
  }
}

export default ExampleContainer;
