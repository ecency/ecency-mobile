import React, { Component } from 'react';
// import { connect } from 'react-redux';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { PostScreen } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class PostContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    // const {} = this.props;

    return <PostScreen {...this.props} />;
  }
}

export default PostContainer;
