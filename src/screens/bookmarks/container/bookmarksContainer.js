import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';

// Services and Actions
import {
  getFavorites,
  removeFavorite,
  getBookmarks,
  removeBookmark,
} from '../../../providers/esteem/esteem';

// Constants
import ROUTES from '../../../constants/routeNames';

// Utilities

// Component
import BookmarksScreen from '../screen/bookmarksScreen';

const BookmarksContainer = ({ currentAccount, intl, navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    _fetchData();
  }, []);

  // Component Functions

  const _fetchData = () => {
    _getBookmarks();
    _getFavorites();
  };

  const _getFavorites = () => {
    setIsLoading(true);

    getFavorites(currentAccount.name)
      .then(data => {
        setFavorites(_sortData(data));
        setIsLoading(false);
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'favorites.load_error' }));
        setIsLoading(false);
      });
  };

  const _getBookmarks = () => {
    setIsLoading(true);

    getBookmarks(currentAccount.name)
      .then(data => {
        setBookmarks(_sortData(data));
        setIsLoading(false);
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'bookmarks.load_error' }));
        setIsLoading(false);
      });
  };

  const _removeFavorite = selectedUsername => {
    removeFavorite(currentAccount.name, selectedUsername)
      .then(() => {
        const newFavorites = [...favorites].filter(fav => fav.account !== selectedUsername);

        setFavorites(_sortData(newFavorites));
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
      });
  };

  const _removeBoomark = id => {
    removeBookmark(currentAccount.name, id)
      .then(() => {
        const newBookmarks = [...bookmarks].filter(bookmark => bookmark._id !== id);

        setBookmarks(_sortData(newBookmarks));
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
      });
  };

  const _handleOnFavoritePress = username => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
        fetchData: _fetchData,
      },
    });
  };

  const _handleOnBookarkPress = (permlink, author) => {
    if (permlink && author) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          permlink,
          author,
        },
      });
    }
  };

  const _sortData = data =>
    data.sort((a, b) => {
      const dateA = new Date(a.created).getTime();
      const dateB = new Date(b.created).getTime();

      return dateB > dateA ? 1 : -1;
    });

  return (
    <BookmarksScreen
      isLoading={isLoading}
      currentAccount={currentAccount}
      favorites={favorites}
      bookmarks={bookmarks}
      removeFavorite={_removeFavorite}
      removeBookmark={_removeBoomark}
      handleOnFavoritePress={_handleOnFavoritePress}
      handleOnBookarkPress={_handleOnBookarkPress}
    />
  );
};

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(injectIntl(BookmarksContainer));
