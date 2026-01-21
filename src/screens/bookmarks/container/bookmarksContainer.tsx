import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

// Services and Actions
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import {
  useGetBookmarksQuery,
  useGetFavouritesQuery,
  useDeleteBookmarkMutation,
  useDeleteFavouriteMutation,
} from '../../../providers/queries';

// Constants
import ROUTES from '../../../constants/routeNames';

// Utilities
import { selectCurrentAccount } from '../../../redux/selectors';

// Component
import BookmarksScreen from '../screen/bookmarksScreen';

const BookmarksContainer = ({ currentAccount, intl: _intl, navigation, route }) => {
  const {
    data: bookmarks = [],
    isLoading: isLoadingBookmarks,
    refetch: refetchBookmarks,
    fetchNextPage: fetchNextBookmarksPage,
    hasNextPage: hasNextBookmarksPage,
    isFetchingNextPage: isFetchingNextBookmarksPage,
  } = useGetBookmarksQuery();

  const {
    data: favorites = [],
    isLoading: isLoadingFavorites,
    refetch: refetchFavorites,
    fetchNextPage: fetchNextFavoritesPage,
    hasNextPage: hasNextFavoritesPage,
    isFetchingNextPage: isFetchingNextFavoritesPage,
  } = useGetFavouritesQuery();

  const deleteBookmarkMutation = useDeleteBookmarkMutation();
  const deleteFavoriteMutation = useDeleteFavouriteMutation();

  const isLoading = isLoadingBookmarks || isLoadingFavorites;

  const _fetchData = () => {
    refetchBookmarks();
    refetchFavorites();
  };

  const _removeFavorite = (selectedUsername) => {
    deleteFavoriteMutation.mutate({ account: selectedUsername });
  };

  const _removeBoomark = (id) => {
    deleteBookmarkMutation.mutate({ bookmarkId: id });
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
      initialTabIndex={route.params?.showFavorites ? 1 : 0}
      // Pagination props for bookmarks
      fetchNextBookmarksPage={fetchNextBookmarksPage}
      hasNextBookmarksPage={hasNextBookmarksPage}
      isFetchingNextBookmarksPage={isFetchingNextBookmarksPage}
      // Pagination props for favorites
      fetchNextFavoritesPage={fetchNextFavoritesPage}
      hasNextFavoritesPage={hasNextFavoritesPage}
      isFetchingNextFavoritesPage={isFetchingNextFavoritesPage}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: selectCurrentAccount(state),
});

export default gestureHandlerRootHOC(connect(mapStateToProps)(injectIntl(BookmarksContainer)));
