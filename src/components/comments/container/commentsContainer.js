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
  _getComments = async () => {
    const { author, permlink } = this.props;

    await getComments(author, permlink).then((comments) => {
      this.setState({
        comments,
      });
    });
  };

  _handleOnReplyPress = (item) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      params: {
        isReply: true,
        post: item,
      },
    });
  };

  render() {
    const { comments } = this.state;
    const {
      isLoggedIn, commentCount, author, permlink,
    } = this.props;
    return (
      <CommentsView
        handleOnReplyPress={this._handleOnReplyPress}
        comments={comments}
        isLoggedIn={isLoggedIn}
        commentCount={commentCount}
        author={author}
        permlink={permlink}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
});

export default withNavigation(connect(mapStateToProps)(CommentsContainer));
