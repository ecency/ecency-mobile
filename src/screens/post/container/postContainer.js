import React, { Component } from 'react';
import { connect } from 'react-redux';

// Services and Actions
import { getPost } from '../../../providers/steem/dsteem';

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
  async componentDidMount() {
    const { navigation } = this.props;
    const { author, permlink } = navigation.state && navigation.state.params;

    await this._loadPost(author, permlink);
  }

  // Component Functions

  _loadPost = async (author, permlink) => {
    const { currentAccount, isLoggedIn } = this.props;

    await getPost(author, permlink, isLoggedIn && currentAccount.username)
      .then((result) => {
        if (result) {
          this.setState({ post: result });
        }
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  render() {
    const { currentAccount, isLoggedIn } = this.props;
    const { post, error } = this.state;

    return (
      <PostScreen
        currentAccount={currentAccount}
        error={error}
        isLoggedIn={isLoggedIn}
        post={post}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  isLoggedIn: state.application.isLoggedIn,
});

export default connect(mapStateToProps)(PostContainer);
