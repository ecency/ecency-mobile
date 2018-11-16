import React, { Component } from 'react';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { FollowsScreen } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class FollowsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    const { navigation } = this.props;
    const users = navigation.state && navigation.state.params && navigation.state.params.users;
    const isFollowing = navigation.state && navigation.state.params && navigation.state.params.isFollowing;

    return <FollowsScreen isFollowing={isFollowing} data={users} {...this.props} />;
  }
}

export default FollowsContainer;
