import React, { Component } from 'react';

import { PostCardView } from '..';

/*
*            Props Name        Description                                     Value
*@props -->  props name here   description here                                Value Type Here
*
*/

class PostCardContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <PostCardView {...this.props} />;
  }
}

export default PostCardContainer;
