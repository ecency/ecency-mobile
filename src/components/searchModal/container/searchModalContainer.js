import React, { Component } from 'react';
// import { connect } from 'react-redux';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { SearchModalView } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class SearchModalContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    return <SearchModalView {...this.props} />;
  }
}

export default SearchModalContainer;
