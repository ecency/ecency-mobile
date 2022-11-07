import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';

// Services and Actions
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import {
  getFavorites,
  deleteFavorite,
  getBookmarks,
  deleteBookmark,
} from '../../../providers/ecency/ecency';

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

    getFavorites()
      .then((data) => {
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

    getBookmarks()
      .then((data) => {
        setBookmarks(_sortData(data));
        setIsLoading(false);
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'bookmarks.load_error' }));
        setIsLoading(false);
      });
  };

  const _removeFavorite = (selectedUsername) => {
    deleteFavorite(selectedUsername)
      .then(() => {
        const newFavorites = [...favorites].filter((fav) => fav.account !== selectedUsername);

        setFavorites(_sortData(newFavorites));
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
      });
  };

  const _removeBoomark = (id) => {
    deleteBookmark(id)
      .then(() => {
        const newBookmarks = [...bookmarks].filter((bookmark) => bookmark._id !== id);
        setBookmarks(_sortData(newBookmarks));
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
      });
  };

  const _handleOnFavoritePress = (username) => {
    navigation.navigate({
      name: ROUTES.SCREENS.PROFILE,
      params: {
        username,
        fetchData: _fetchData,
      },
    });
  };

  const _handleOnBookmarkPress = (permlink, author) => {
    if (permlink && author) {
      navigation.navigate({
        name: ROUTES.SCREENS.POST,
        params: {
          permlink,
          author,
        },
      });
    }
  };

  const _sortData = (data) => {
    return data.sort((a, b) => {
      const dateA = a.timestamp;
      const dateB = b.timestamp;

      return dateB - dateA;
    });
  };

  return (
    <BookmarksScreen
      isLoading={isLoading}
      currentAccount={currentAccount}
      favorites={favorites}
      bookmarks={bookmarks}
      removeFavorite={_removeFavorite}
      removeBookmark={_removeBoomark}
      handleOnFavoritePress={_handleOnFavoritePress}
      handleOnBookmarkPress={_handleOnBookmarkPress}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
});

export default gestureHandlerRootHOC(connect(mapStateToProps)(injectIntl(BookmarksContainer)));
