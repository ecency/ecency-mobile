import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import { getComments } from '../../../providers/steem/dsteem';

// Services and Actions

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

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
    this._getComments();
  }

  componentWillReceiveProps(nextProps) {
    const { commentCount } = this.props;

    if (nextProps.commentCount > commentCount) {
      this._getComments();
    }
  }

  // Component Functions
  _getComments = () => {
    const { author, permlink } = this.props;

    getComments(author, permlink).then((comments) => {
      this.setState({
        comments,
      });
    });
  };

  _handleOnReplyPress = (item) => {
    const { navigation, fetchPost } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        isReply: true,
        post: item,
        fetchPost,
      },
    });
  };

  _handleOnEditPress = (item) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        isEdit: true,
        isReply: true,
        post: item,
        fetchPost: this._getComments,
      },
    });
  };

  render() {
    const { comments: _comments, selectedPermlink } = this.state;
    const {
      isLoggedIn,
      commentCount,
      author,
      permlink,
      currentAccount,
      commentNumber,
      comments,
      fetchPost,
      isShowMoreButton,
      selectedPermlink: _selectedPermlink,
    } = this.props;

    return (
      <CommentsView
        key={permlink}
        selectedPermlink={_selectedPermlink || selectedPermlink}
        author={author}
        isShowMoreButton={isShowMoreButton}
        commentNumber={commentNumber || 1}
        commentCount={commentCount}
        comments={_comments || comments}
        currentAccountUsername={currentAccount.name}
        handleOnEditPress={this._handleOnEditPress}
        handleOnReplyPress={this._handleOnReplyPress}
        isLoggedIn={isLoggedIn}
        permlink={permlink}
        fetchPost={fetchPost}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
});

export default withNavigation(connect(mapStateToProps)(CommentsContainer));
