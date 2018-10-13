import React, { Component } from 'react';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { HomeScreen } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class HomeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    return <HomeScreen {...this.props} />;
  }
}

export default HomeContainer;
