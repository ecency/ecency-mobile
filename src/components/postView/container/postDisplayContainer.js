import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

// Services and Actions
import { getPost } from '../../../providers/steem/dsteem';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

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
    this.state = {
      _post: null,
    };
  }

  // Component Life Cycle Functions

  // Component Functions
  _handleOnVotersPress = (activeVotes) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
      },
    });
  };

  _handleOnReplyPress = () => {
    const { post, navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        isReply: true,
        post,
      },
    });
  };

  _fetchPost = async () => {
    const { currentAccount, post } = this.props;

    await getPost(post.author, post.permlink, currentAccount.username).then((result) => {
      if (result) {
        this.setState({ _post: result });
      }
    });
  };

  render() {
    const { post, currentAccount } = this.props;
    const { _post } = this.state;

    return (
      <PostDisplayView
        handleOnVotersPress={this._handleOnVotersPress}
        handleOnReplyPress={this._handleOnReplyPress}
        currentAccount={currentAccount}
        fetchPost={this._fetchPost}
        post={_post || post}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default withNavigation(connect(mapStateToProps)(PostDisplayContainer));
