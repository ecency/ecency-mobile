import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { View, FlatList, Text } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import ActionSheet from 'react-native-actionsheet';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import {
  PostCardPlaceHolder,
  UserListItem,
  WalletDetailsPlaceHolder,
} from '../../../components/basicUIElements';
import { TabBar } from '../../../components/tabBar';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './bookmarksStyles';

class BookmarksScreen extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      selectedItemId: null,
      activeTab: 0,
    };
  }

  // Component Life Cycles

  // Component Functions
  _renderItem = (item, index, itemType) => {
    const { handleOnFavoritePress, handleOnBookarkPress } = this.props;
    const isFavorites = itemType === 'favorites';
    const text = isFavorites ? item.account : `${item.author}/${item.permlink}`;

    if (item.author || item.account) {
      return (
        <UserListItem
          handleOnLongPress={() => this._handleLongPress(isFavorites ? item.account : item._id)}
          handleOnPress={() =>
            isFavorites
              ? handleOnFavoritePress(item.account)
              : handleOnBookarkPress(item.permlink, item.author)
          }
          index={index}
          isClickable
          text={text}
          username={isFavorites ? item.account : item.author}
        />
      );
    }
  };

  _getTabItem = (data, type) => {
    const { isLoading, intl } = this.props;
    const isNoItem = (data && data.length === 0) || !data;
    const placeHolder =
      type === 'bookmarks' ? <PostCardPlaceHolder /> : <WalletDetailsPlaceHolder />;
    const isFavorites = type === 'favorites';

    return (
      <View style={styles.container}>
        {isNoItem && !isLoading && (
          <Text style={globalStyles.hintText}>
            {intl.formatMessage({
              id: 'bookmarks.empty_list',
            })}
          </Text>
        )}
        {isLoading ? (
          <View>{placeHolder}</View>
        ) : (
          !isNoItem && (
            <FlatList
              data={data.map(item =>
                item._id !== data[item._id] && isFavorites
                  ? item.account !== data[item.account] && item
                  : item,
              )}
              keyExtractor={item => item._id}
              removeClippedSubviews={false}
              renderItem={({ item, index }) => this._renderItem(item, index, type)}
            />
          )
        )}
      </View>
    );
  };

  _handleLongPress = selectedItemId => {
    this.setState({ selectedItemId }, () => {
      this.ActionSheet.show();
    });
  };

  render() {
    const { favorites, bookmarks, intl, removeFavorite, removeBookmark } = this.props;
    const { selectedItemId, activeTab } = this.state;

    return (
      <View style={globalStyles.container}>
        <BasicHeader
          title={intl.formatMessage({
            id: 'bookmarks.title',
          })}
        />

        <ScrollableTabView
          onChangeTab={event => this.setState({ activeTab: event.i })}
          style={globalStyles.tabView}
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
            {this._getTabItem(bookmarks, 'bookmarks')}
          </View>
          <View
            tabLabel={intl.formatMessage({
              id: 'favorites.title',
            })}
            style={styles.tabbarItem}
          >
            {this._getTabItem(favorites, 'favorites')}
          </View>
        </ScrollableTabView>
        <ActionSheet
          ref={o => (this.ActionSheet = o)}
          options={[
            intl.formatMessage({ id: 'alert.delete' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'alert.remove_alert' })}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
          onPress={index => {
            if (index === 0) {
              activeTab === 0 ? removeBookmark(selectedItemId) : removeFavorite(selectedItemId);
            }
          }}
        />
      </View>
    );
  }
}

export default injectIntl(BookmarksScreen);
