import React, { Component } from 'react';
import { connect } from 'react-redux';

// Services and Actions
import { search } from '../../../providers/esteem/esteem';
import { lookupAccounts } from '../../../providers/steem/dsteem';

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
    this.state = {
      searchResults: {},
    };
  }

  // Component Life Cycle Functions

  // Component Functions
  _handleCloseButton = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  _handleOnChangeSearchInput = (text) => {
    if (text && text !== '@') {
      if (text[0] === '@') {
        lookupAccounts(text.substr(1)).then((res) => {
          const users = res.map(item => ({ author: item }));
          this.setState({ searchResults: { type: 'user', data: users } });
        });
      } else {
        search({ q: text }).then((res) => {
          // TODO: title and image_url null check
          this.setState({ searchResults: { type: 'content', data: res.results } });
        });
      }
    }
  };

  render() {
    const { searchResults } = this.state;

    return (
      <SearchView
        searchResults={searchResults}
        handleCloseButton={this._handleCloseButton}
        handleOnChangeSearchInput={this._handleOnChangeSearchInput}
      />
    );
  }
}

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(SearchContainer);
