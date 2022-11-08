import React, { useState, useRef } from 'react';
import { injectIntl } from 'react-intl';
import { View, FlatList, Text } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';

// Components
import { UserListItem, WalletDetailsPlaceHolder, BasicHeader, TabBar } from '../../../components';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './bookmarksStyles';
import { OptionsModal } from '../../../components/atoms';

const BookmarksScreen = ({
  isLoading,
  intl,
  handleOnFavoritePress,
  handleOnBookmarkPress,
  favorites,
  bookmarks,
  removeFavorite,
  removeBookmark,
}) => {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const actionSheetRef = useRef(null);

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
    if (actionSheetRef.current) {
      setSelectedItemId(_selectedItemId);
      actionSheetRef.current.show();
    }
  };

  return (
    <View style={globalStyles.container}>
      <BasicHeader
        title={intl.formatMessage({
          id: 'bookmarks.title',
        })}
      />

      <ScrollableTabView
        onChangeTab={(event) => setActiveTab(event.i)}
        style={[globalStyles.tabView, { paddingBottom: 40 }]}
        renderTabBar={() => (
          <TabBar
            style={styles.tabbar}
            tabUnderlineDefaultWidth={80}
            tabUnderlineScaleX={2}
            tabBarPosition="overlayTop"
          />
        )}
      >
        <View
          tabLabel={intl.formatMessage({
            id: 'bookmarks.title',
          })}
          style={styles.tabbarItem}
        >
          {_getTabItem(bookmarks, 'bookmarks')}
        </View>
        <View
          tabLabel={intl.formatMessage({
            id: 'favorites.title',
          })}
          style={styles.tabbarItem}
        >
          {_getTabItem(favorites, 'favorites')}
        </View>
      </ScrollableTabView>
      <OptionsModal
        ref={actionSheetRef}
        options={[
          intl.formatMessage({ id: 'alert.delete' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'alert.remove_alert' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={(index) => {
          if (index === 0) {
            activeTab === 0 ? removeBookmark(selectedItemId) : removeFavorite(selectedItemId);
          }
        }}
      />
    </View>
  );
};

export default injectIntl(BookmarksScreen);
