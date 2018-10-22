import React, { Component } from 'react';

// Services and Actions

// Middleware

// Constants

// Utilities
// import { postContent } from '../../providers/steem/dsteem';
// import { getUserData, getAuthStatus } from '../../realm/realm';
// import { decryptKey } from '../../utils/crypto';
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

  // generatePermlink = () => {
  //   let title;

  //   title = this.state.title
  //     .replace(/[^\w\s]/gi, '')
  //     .replace(/\s\s+/g, '-')
  //     .replace(/\s/g, '-')
  //     .toLowerCase();
  //   title = `${title}-id-${Math.random()
  //     .toString(36)
  //     .substr(2, 16)}`;

  //   return title;
  // };

  // submitPost = async () => {
  //   let userData;
  //   let postingKey;

  //   await getUserData().then((res) => {
  //     userData = Array.from(res);
  //     postingKey = decryptKey(userData[0].postingKey, 'pinCode');
  //   });

  //   post = {
  //     body: this.state.body,
  //     title: this.state.title,
  //     author: userData[0].username,
  //     permlink: this.generatePermlink(),
  //     tags: this.state.tags,
  //   };

  //   console.log(post);

  //   postContent(post, postingKey)
  //     .then((result) => {
  //       console.log(result);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  render() {
    return <EditorScreen />;
  }
}

export default ExampleContainer;
