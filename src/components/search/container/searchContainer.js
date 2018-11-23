import React, { Component } from 'react';
import { connect } from 'react-redux';

// Services and Actions

// Middleware

// Constants

// Utilities

// Component
import { SearchView } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class SearchContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions
  _handleCloseButton = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  _handleOnChangeSearchInput = (text) => {
    console.log('text :', text);
  };

  render() {
    // eslint-disable-next-line
    const {} = this.props;

    return (
      <SearchView
        handleCloseButton={this._handleCloseButton}
        handleOnChangeSearchInput={this._handleOnChangeSearchInput}
      />
    );
  }
}

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(SearchContainer);
