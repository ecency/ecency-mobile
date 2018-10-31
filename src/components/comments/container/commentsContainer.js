import React, { Component } from 'react';
import { getComments } from '../../../providers/steem/dsteem';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { CommentsView } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class CommentsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    const { author, permlink } = this.props;

    getComments(author, permlink)
      .then((comments) => {
        this.setState({
          comments,
        });
        console.log(comments);
      })
      .catch((error) => {
        alert(error);
      });
  }
  // Component Functions

  _handleOnReplyPress = () => {
    alert(
      'Reply functions not working yet. Thank you for your understanding. Your friends at eSteem :)',
    );
  };

  render() {
    const { comments } = this.state;

    return (
      <CommentsView
        handleOnReplyPress={this._handleOnReplyPress}
        comments={comments}
        {...this.props}
      />
    );
  }
}

export default CommentsContainer;
