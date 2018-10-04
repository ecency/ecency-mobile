import React, { Component } from 'react';
// Constants

// Components
import { AuthorScreen } from '..';
/*
*            Props Name        Description                                     Value
*@props -->  props name here   description here                                Value Type Here
*
*/

class AuthorContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    return <AuthorScreen {...this.props} />;
  }
}

export default AuthorContainer;
