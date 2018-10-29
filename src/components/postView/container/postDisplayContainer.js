import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';
// import { connect } from 'react-redux';

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
  _handleOnUserPress = (username) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username + Math.random() * 100,
    });
  };

  render() {
    const { post } = this.props;

    return <PostDisplayView handleOnUserPress={this._handleOnUserPress} post={post} />;
  }
}

export default withNavigation(PostDisplayContainer);
