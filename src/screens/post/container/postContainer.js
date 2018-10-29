import React, { Component } from 'react';
// import { connect } from 'react-redux';

// Services and Actions
import { getPost } from '../../../providers/steem/dsteem';

// Middleware

// Constants

// Utilities
import { parsePost } from '../../../utils/postParser';
// Component
import { PostScreen } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  content           which is include all post data                  Object
  *
  */

class PostContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      post: null,
      error: null,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    const { navigation } = this.props;
    const { author, permlink } = navigation.state && navigation.state.params;

    this._loadPost(author, permlink);
  }

  // Component Functions

  _loadPost = (author, permlink) => {
    getPost(author, permlink)
      .then((result) => {
        if (result) {
          this.setState({ post: parsePost(result) });
        }
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  render() {
    const { post, error } = this.state;

    return <PostScreen key={Math.random * 100} post={post} error={error} />;
  }
}

export default PostContainer;
