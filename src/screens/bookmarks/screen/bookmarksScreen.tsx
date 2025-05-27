import React from 'react';
import { injectIntl } from 'react-intl';
import { View, FlatList, Text } from 'react-native';

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
  handleOnBookmarkPress,
  favorites,
  bookmarks,
  removeFavorite,
  removeBookmark,
  initialTabIndex,
}) => {
  const [tabIndex, setTabIndex] = React.useState(initialTabIndex);
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
  ]);

  const _renderItem = (item, index, itemType) => {
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
          username={isFavorites ? item.account : item.author}
        />
      );
    }
  };

  const _renderEmptyContent = () => {
    if (isLoading) {
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

  const _getTabItem = (data, type) => {
    const isFavorites = type === 'favorites';

    return (
      <View style={styles.container}>
        <FlatList
          data={data.map((item) =>
            item._id !== data[item._id] && isFavorites
              ? item.account !== data[item.account] && item
              : item,
          )}
          keyExtractor={(item) => item._id}
          removeClippedSubviews={false}
          renderItem={({ item, index }) => _renderItem(item, index, type)}
          ListEmptyComponent={_renderEmptyContent()}
        />
      </View>
    );
  };

  const _handleLongPress = (_selectedItemId) => {
    const _onConfirmDelete = () => {
      tabIndex === 0 ? removeBookmark(_selectedItemId) : removeFavorite(_selectedItemId);
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

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'bookmarks':
        return <View style={styles.tabbarItem}>{_getTabItem(bookmarks, 'bookmarks')}</View>;
      case 'favorites':
        return <View style={styles.tabbarItem}>{_getTabItem(favorites, 'favorites')}</View>;
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <BasicHeader
        title={intl.formatMessage({
          id: 'bookmarks.title',
        })}
      />

      <TabView
        navigationState={{ index: tabIndex, routes }}
        onIndexChange={setTabIndex}
        renderTabBar={TabBar}
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
