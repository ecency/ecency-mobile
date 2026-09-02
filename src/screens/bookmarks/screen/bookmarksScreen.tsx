import React from 'react';
import { injectIntl } from 'react-intl';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';

// Components
import { TabView } from 'react-native-tab-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SheetManager } from 'react-native-actions-sheet';
import { UserListItem, WalletDetailsPlaceHolder, BasicHeader, TabBar } from '../../../components';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './bookmarksStyles';
import { ButtonTypes } from '../../../components/actionModal/container/actionModalContainer';
import { SheetNames } from '../../../navigation/sheets';

const BookmarksScreen = ({
  isLoading,
  intl,
  handleOnFavoritePress,
  handleOnTagPress,
  favoriteTags,
  removeFavoriteTag,
  isLoadingFavoriteTags,
  fetchNextFavoriteTagsPage,
  hasNextFavoriteTagsPage,
  isFetchingNextFavoriteTagsPage,
  handleOnBookmarkPress,
  favorites,
  bookmarks,
  removeFavorite,
  removeBookmark,
  initialTabIndex,
  fetchNextBookmarksPage,
  hasNextBookmarksPage,
  isFetchingNextBookmarksPage,
  fetchNextFavoritesPage,
  hasNextFavoritesPage,
  isFetchingNextFavoritesPage,
}: any) => {
  const [tabIndex, setTabIndex] = React.useState(initialTabIndex);

  // React Navigation can reuse this route and only update its params, in which
  // case the container recomputes initialTabIndex on an already mounted screen.
  React.useEffect(() => {
    setTabIndex(initialTabIndex);
  }, [initialTabIndex]);
  const bookmarksListRef = React.useRef<any>(null);
  const favoritesListRef = React.useRef<any>(null);
  const tagsListRef = React.useRef<any>(null);
  const [routes] = React.useState([
    {
      key: 'bookmarks',
      title: intl.formatMessage({
        id: 'bookmarks.title',
      }),
    },
    {
      key: 'favorites',
      title: intl.formatMessage({
        id: 'favorites.title',
      }),
    },
    {
      key: 'tags',
      title: intl.formatMessage({
        id: 'favorite_tags.title',
      }),
    },
  ]);

  const _renderTagItem = (item: any) => (
    // A followed hashtag has no account behind it, so it gets a plain row rather than
    // the avatar row the other two tabs use. Single root View: the list measures it.
    <View>
      <TouchableOpacity
        style={styles.tagItem}
        onPress={() => handleOnTagPress(item.tag)}
        onLongPress={() => _handleLongPress(item.tag)}
      >
        <Text style={styles.tagText}>#{item.tag}</Text>
      </TouchableOpacity>
    </View>
  );

  const _renderItem = (item: any, index: any, itemType: any) => {
    if (itemType === 'tags') {
      return _renderTagItem(item);
    }
    const isFavorites = itemType === 'favorites';
    const text = isFavorites ? item.account : `${item.author}/${item.permlink}`;

    if (item.author || item.account) {
      return (
        <UserListItem
          handleOnLongPress={() => _handleLongPress(isFavorites ? item.account : item._id)}
          handleOnPress={() =>
            isFavorites
              ? handleOnFavoritePress(item.account)
              : handleOnBookmarkPress(item.permlink, item.author)
          }
          index={index}
          isClickable
          text={text}
          isLoggedIn={true}
          username={isFavorites ? item.account : item.author}
        />
      );
    }
  };

  const _renderEmptyContent = (type?: string) => {
    if (type === 'tags' ? isLoadingFavoriteTags : isLoading) {
      return <WalletDetailsPlaceHolder />;
    }

    return (
      <Text style={globalStyles.hintText}>
        {intl.formatMessage({
          id: 'bookmarks.empty_list',
        })}
      </Text>
    );
  };

  const _getTabItem = (data: any, type: any, listRef: any) => {
    const isFavorites = type === 'favorites';
    const isTags = type === 'tags';
    const fetchNextPage = isTags
      ? fetchNextFavoriteTagsPage
      : isFavorites
      ? fetchNextFavoritesPage
      : fetchNextBookmarksPage;
    const hasNextPage = isTags
      ? hasNextFavoriteTagsPage
      : isFavorites
      ? hasNextFavoritesPage
      : hasNextBookmarksPage;
    const isFetchingNextPage = isTags
      ? isFetchingNextFavoriteTagsPage
      : isFavorites
      ? isFetchingNextFavoritesPage
      : isFetchingNextBookmarksPage;

    const handleLoadMore = () => {
      if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
        fetchNextPage();
      }
    };

    return (
      <FlatList
        ref={listRef}
        style={styles.container}
        data={data.map((item: any) =>
          item._id !== data[item._id] && isFavorites
            ? item.account !== data[item.account] && item
            : item,
        )}
        contentContainerStyle={styles.listContent}
        // Every row carries the API's _id; the tag and account are the fallbacks.
        keyExtractor={(item) => item._id ?? item.tag ?? item.account}
        removeClippedSubviews={false}
        renderItem={(({ item, index }: any) => _renderItem(item, index, type)) as any}
        ListEmptyComponent={_renderEmptyContent(type)}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <WalletDetailsPlaceHolder /> : null}
      />
    );
  };

  const _handleLongPress = (_selectedItemId: any) => {
    const _onConfirmDelete = () => {
      if (tabIndex === 0) {
        removeBookmark(_selectedItemId);
      } else if (tabIndex === 1) {
        removeFavorite(_selectedItemId);
      } else {
        removeFavoriteTag(_selectedItemId);
      }
    };

    SheetManager.show(SheetNames.ACTION_MODAL, {
      payload: {
        title: intl.formatMessage({ id: 'alert.remove_alert' }),
        buttons: [
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            type: ButtonTypes.CANCEL,
            onPress: () => {
              console.log('canceled delete comment');
            },
          },
          {
            text: intl.formatMessage({ id: 'alert.delete' }),
            onPress: _onConfirmDelete,
          },
        ],
      },
    });
  };

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case 'bookmarks':
        return (
          <View style={styles.tabbarItem}>
            {_getTabItem(bookmarks, 'bookmarks', bookmarksListRef)}
          </View>
        );
      case 'favorites':
        return (
          <View style={styles.tabbarItem}>
            {_getTabItem(favorites, 'favorites', favoritesListRef)}
          </View>
        );
      case 'tags':
        return (
          <View style={styles.tabbarItem}>{_getTabItem(favoriteTags, 'tags', tagsListRef)}</View>
        );
    }
  };

  return (
    <SafeAreaView edges={['top']} style={globalStyles.container}>
      <BasicHeader
        title={intl.formatMessage({
          id: 'bookmarks.title',
        })}
      />

      <TabView
        navigationState={{ index: tabIndex, routes }}
        onIndexChange={setTabIndex}
        renderTabBar={(tabProps) => (
          <TabBar
            {...tabProps}
            onTabPress={({ route }) => {
              const listRef =
                route.key === 'tags'
                  ? tagsListRef
                  : route.key === 'favorites'
                  ? favoritesListRef
                  : bookmarksListRef;
              listRef.current?.scrollToOffset({ offset: 0, animated: true });
            }}
          />
        )}
        renderScene={renderScene}
        style={globalStyles.tabView}
        commonOptions={{
          labelStyle: styles.tabLabelColor,
        }}
      />
    </SafeAreaView>
  );
};

export default injectIntl(BookmarksScreen);
