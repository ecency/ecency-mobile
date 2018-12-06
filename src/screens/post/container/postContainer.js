import React, { Component } from 'react';
// import { connect } from 'react-redux';

// Services and Actions
import { getUserData, getAuthStatus } from '../../../realm/realm';
import { getPost, getUser } from '../../../providers/steem/dsteem';

// Middleware

// Constants

// Utilities
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
      currentUser: null,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    const { navigation } = this.props;
    const { author, permlink } = navigation.state && navigation.state.params;

    this._loadPost(author, permlink);
    this._getUser();
  }

  // Component Functions

  _loadPost = (author, permlink) => {
    const { currentUser } = this.state;
    // TODO: get from redux for cureentUser
    getPost(author, permlink, currentUser && currentUser.name)
      .then((result) => {
        if (result) {
          this.setState({ post: result });
        }
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  async _getUser() {
    let _currentUser;
    let userData;
    let isLoggedIn;

    await getAuthStatus().then((res) => {
      isLoggedIn = res.isLoggedIn;
    });

    if (isLoggedIn) {
      await getUserData().then((res) => {
        _currentUser = Array.from(res);
      });

      userData = _currentUser && (await getUser(_currentUser[0].username));

      await this.setState({
        currentUser: userData,
      });
    }
  }

  render() {
    const { post, error, currentUser } = this.state;

    return <PostScreen currentUser={currentUser} post={post} error={error} />;
  }
}

export default PostContainer;
