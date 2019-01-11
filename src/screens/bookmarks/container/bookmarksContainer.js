import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';

// Services and Actions
import { getFavorites, removeFavoriteUser } from '../../../providers/esteem/esteem';

// Constants
import ROUTES from '../../../constants/routeNames';

// Utilities

// Component
import BookmarksScreen from '../screen/bookmarksScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class DraftsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      favorites: [],
      bookmarks: [],
      isLoading: false,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    this._getFavorites();
  }

  // Component Functions
  _getFavorites = () => {
    const { currentAccount, intl } = this.props;
    this.setState({ isLoading: true });

    getFavorites(currentAccount.name)
      .then((data) => {
        this.setState({ favorites: this._sortData(data), isLoading: false });
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'favorites.load_error' }));
        this.setState({ isLoading: false });
      });
  };

  _removeFavorite = (selectedUsername) => {
    const { currentAccount, intl } = this.props;

    removeFavoriteUser(currentAccount.name, selectedUsername)
      .then(() => {
        const { favorites } = this.state;
        const newFavorites = [...favorites].filter(fav => fav.account !== selectedUsername);

        this.setState({ favorites: this._sortData(newFavorites) });
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
      });
  };

  _handleOnFavoritePress = (username) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
    });
  };

  _sortData = data => data.sort((a, b) => {
    const dateA = new Date(a.created).getTime();
    const dateB = new Date(b.created).getTime();

    return dateB > dateA ? 1 : -1;
  });

  render() {
    const { isLoading, favorites, bookmarks } = this.state;
    const { currentAccount } = this.props;

    return (
      <BookmarksScreen
        isLoading={isLoading}
        currentAccount={currentAccount}
        favorites={favorites}
        bookmarks={bookmarks}
        removeFavorite={this._removeFavorite}
        handleOnFavoritePress={this._handleOnFavoritePress}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(injectIntl(DraftsContainer));
