import React, { Component } from 'react';
// import { connect } from 'react-redux';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { PostDisplayView } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class PostDisplayContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    const { post, currentUser } = this.props;

    return <PostDisplayView currentUser={currentUser} post={post} />;
  }
}

export default PostDisplayContainer;
