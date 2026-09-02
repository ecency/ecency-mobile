import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

// Services and Actions
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import {
  useGetBookmarksQuery,
  useGetFavouritesQuery,
  useGetFavoriteTagsQuery,
  useDeleteBookmarkMutation,
  useDeleteFavouriteMutation,
  useDeleteFavoriteTagMutation,
} from '../../../providers/queries';

// Constants
import ROUTES from '../../../constants/routeNames';

// Utilities
import { selectCurrentAccount } from '../../../redux/selectors';

// Component
import BookmarksScreen from '../screen/bookmarksScreen';

const BookmarksContainer = ({ currentAccount, intl: _intl, navigation, route }: any) => {
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

  const {
    data: favoriteTags = [],
    isLoading: isLoadingFavoriteTags,
    refetch: refetchFavoriteTags,
  } = useGetFavoriteTagsQuery();

  const deleteBookmarkMutation = useDeleteBookmarkMutation();
  const deleteFavoriteMutation = useDeleteFavouriteMutation();
  const deleteFavoriteTagMutation = useDeleteFavoriteTagMutation();

  const isLoading = isLoadingBookmarks || isLoadingFavorites || isLoadingFavoriteTags;

  const _fetchData = () => {
    refetchBookmarks();
    refetchFavorites();
    refetchFavoriteTags();
  };

  const _removeFavorite = (selectedUsername: any) => {
    deleteFavoriteMutation.mutate({ account: selectedUsername } as any);
  };

  const _removeFavoriteTag = (tag: string) => {
    deleteFavoriteTagMutation.mutate(tag);
  };

  const _handleOnTagPress = (tag: string) => {
    navigation.navigate({
      name: ROUTES.SCREENS.TAG_RESULT,
      params: { tag },
    });
  };

  const _removeBoomark = (id: any) => {
    deleteBookmarkMutation.mutate({ bookmarkId: id } as any);
  };

  const _handleOnFavoritePress = (username: any) => {
    navigation.navigate({
      name: ROUTES.SCREENS.PROFILE,
      params: {
        username,
        fetchData: _fetchData,
      },
    });
  };

  const _handleOnBookmarkPress = (permlink: any, author: any) => {
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
      favoriteTags={favoriteTags}
      removeFavorite={_removeFavorite}
      removeBookmark={_removeBoomark}
      removeFavoriteTag={_removeFavoriteTag}
      handleOnFavoritePress={_handleOnFavoritePress}
      handleOnBookmarkPress={_handleOnBookmarkPress}
      handleOnTagPress={_handleOnTagPress}
      initialTabIndex={route.params?.showTags ? 2 : route.params?.showFavorites ? 1 : 0}
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

const mapStateToProps = (state: any) => ({
  currentAccount: selectCurrentAccount(state),
});

export default gestureHandlerRootHOC(connect(mapStateToProps)(injectIntl(BookmarksContainer)));
