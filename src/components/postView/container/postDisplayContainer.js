import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';

// Services and Actions

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
    this.state = {};
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

  render() {
    const { post, currentAccount } = this.props;

    return (
      <PostDisplayView
        handleOnVotersPress={this._handleOnVotersPress}
        handleOnReplyPress={this._handleOnReplyPress}
        currentAccount={currentAccount}
        post={post}
      />
    );
  }
}

export default withNavigation(PostDisplayContainer);
