import React, { Component } from 'react';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
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

  // Component Life Cycle Functions

  // Component Functions

  render() {
    return <PostCardView {...this.props} />;
  }
}

export default PostCardContainer;
