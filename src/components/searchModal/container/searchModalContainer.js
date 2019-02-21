import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';

// Services and Actions
import { search } from '../../../providers/esteem/esteem';
import { lookupAccounts, getTrendingTags } from '../../../providers/steem/dsteem';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

// Component
import SearchModalView from '../view/searchModalView';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class SearchModalContainer extends PureComponent {
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
    if (text && text !== '@' && text !== '#') {
      if (text[0] === '@') {
        lookupAccounts(text.substr(1)).then((res) => {
          const users = res.map(item => ({ author: item }));
          this.setState({ searchResults: { type: 'user', data: users } });
        });
      } else if (text[0] === '#') {
        getTrendingTags(text.substr(1)).then((res) => {
          console.log('res :', res);
          // TODO:
        });
      } else {
        search({ q: text }).then((res) => {
          res.results = res.results.filter(item => item.title !== '');
          this.setState({ searchResults: { type: 'content', data: res.results } });
        });
      }
    }
  };

  _handleOnPressListItem = (type, item) => {
    const { navigation, handleOnClose } = this.props;
    handleOnClose();
    this.setState({ searchResults: {} });
    if (type === 'user') {
      navigation.navigate({
        routeName: ROUTES.SCREENS.PROFILE,
        params: {
          username: item.author,
        },
        key: item.author,
      });
    } else if (type === 'content') {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          author: item.author,
          permlink: item.permlink,
        },
        key: item.permlink,
      });
    }
  };

  render() {
    const { searchResults } = this.state;
    const { handleOnClose, isOpen, placeholder } = this.props;
    return (
      <SearchModalView
        searchResults={searchResults}
        handleCloseButton={this._handleCloseButton}
        handleOnChangeSearchInput={this._handleOnChangeSearchInput}
        handleOnPressListItem={this._handleOnPressListItem}
        isOpen={isOpen}
        handleOnClose={handleOnClose}
        placeholder={placeholder}
      />
    );
  }
}

export default withNavigation(SearchModalContainer);
