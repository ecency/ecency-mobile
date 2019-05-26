import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

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

  _handleOnChangeSearchInput = text => {
    if (text && text !== '@' && text !== '#') {
      if (text[0] === '@') {
        lookupAccounts(text.substr(1)).then(res => {
          const users = res.map(item => ({
            image: `https://steemitimages.com/u/${item}/avatar/small`,
            text: item,
            ...item,
          }));
          this.setState({ searchResults: { type: 'user', data: users } });
        });
      } else if (text[0] === '#') {
        getTrendingTags(text.substr(1)).then(res => {
          const tags = res.map(item => ({
            text: `#${item.name}`,
            ...item,
          }));

          this.setState({ searchResults: { type: 'tag', data: tags } });
        });
      } else {
        search({ q: text }).then(res => {
          res.results = res.results
            .filter(item => item.title !== '')
            .map(item => ({
              image: item.img_url || `https://steemitimages.com/u/${item.author}/avatar/small`,
              text: item.title,
              ...item,
            }));
          this.setState({ searchResults: { type: 'content', data: res.results } });
        });
      }
    }
  };

  _handleOnPressListItem = (type, item) => {
    const { navigation, handleOnClose, username } = this.props;
    let routeName = null;
    let params = null;
    let key = null;

    handleOnClose();
    this.setState({ searchResults: {} });

    switch (type) {
      case 'user':
        routeName = item.text === username ? ROUTES.TABBAR.PROFILE : ROUTES.SCREENS.PROFILE;
        params = {
          username: item.text,
        };
        key = item.text;
        break;
      case 'content':
        routeName = ROUTES.SCREENS.POST;
        params = {
          author: item.author,
          permlink: item.permlink,
        };
        key = item.permlink;
        break;
      case 'tag':
        routeName = ROUTES.SCREENS.SEARCH_RESULT;
        params = {
          tag: item.text.substr(1),
        };
        break;

      default:
        break;
    }

    if (routeName) {
      navigation.navigate({
        routeName,
        params,
        key,
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

const mapStateToProps = state => ({
  username: state.account.currentAccount.name,
});

export default connect(mapStateToProps)(withNavigation(SearchModalContainer));
