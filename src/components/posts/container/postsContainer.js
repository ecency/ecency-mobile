import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';

// Services and Actions

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

// Component
import { PostsView } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class PostsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  _handleOnUserPress = (username) => {
    const { navigation } = this.props;
    alert('vok');

    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username + Math.random() * 100,
    });
  };

  _handleOnContentPress = (author, permlink) => {
    const { navigation } = this.props;

    if (author && permlink) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          author,
          permlink,
        },
        key: permlink,
      });
    }
  };

  render() {
    return (
      <PostsView
        handleOnUserPress={this._handleOnUserPress}
        handleOnContentPress={this._handleOnContentPress}
        {...this.props}
      />
    );
  }
}

export default withNavigation(PostsContainer);
