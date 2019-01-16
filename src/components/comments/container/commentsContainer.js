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
      isShowComments: false,
      isRenderRequire: true,
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

  _showComentsToggle = (permlink) => {
    const { isShowComments, selectedPermlink } = this.state;
    const { selectedPermlink: _selectedPermlink } = this.props;

    if (_selectedPermlink !== selectedPermlink) {
      this.setState({ isShowComments: !!isShowComments, selectedPermlink: permlink });
    } else {
      this.setState({ isShowComments: !isShowComments, selectedPermlink: permlink });
    }

    this.setState({ isRenderRequire: false }, () => this.setState({ isRenderRequire: true }));
  };

  render() {
    const {
      comments, isShowComments, isRenderRequire, selectedPermlink,
    } = this.state;
    const {
      isLoggedIn,
      commentCount,
      author,
      permlink,
      currentAccount,
      commentNumber,
      fetchPost,
      selectedPermlink: _selectedPermlink,
    } = this.props;
    if (isRenderRequire) {
      return (
        <CommentsView
          key={permlink}
          selectedPermlink={_selectedPermlink || selectedPermlink}
          isShowComments={isShowComments}
          showComentsToggle={this._showComentsToggle}
          author={author}
          commentNumber={commentNumber || 1}
          commentCount={commentCount}
          comments={comments}
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
    return null;
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
});

export default withNavigation(connect(mapStateToProps)(CommentsContainer));
