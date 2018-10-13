import React, { Component } from 'react';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { PostsView } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class PostsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    return <PostsView {...this.props} />;
  }
}

export default PostsContainer;
