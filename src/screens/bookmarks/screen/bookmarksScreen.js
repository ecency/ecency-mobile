import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { View, FlatList, Text } from 'react-native';
import ScrollableTabView from '@esteemapp/react-native-scrollable-tab-view';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { PostCardPlaceHolder, UserListItem } from '../../../components/basicUIElements';
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
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  _renderItem = (item, index) => {
    const { currentAccount } = this.props;

    return (
      <UserListItem
        index={index}
        username={item.account}
        rightText="bok"
        subRightText="bok"
      />
    );
  };

  _getTabItem = (data, type) => {
    const { isLoading, intl } = this.props;
    const isNoItem = (data && data.length === 0) || !data;

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
          <View>
            <PostCardPlaceHolder />
            <PostCardPlaceHolder />
          </View>
        ) : (
          !isNoItem && (
            <FlatList
              data={data}
              keyExtractor={item => item._id}
              removeClippedSubviews={false}
              renderItem={({ item, index }) => this._renderItem(item, index)}
            />
          )
        )}
      </View>
    );
  };

  render() {
    const { favorites, bookmarks, intl } = this.props;

    return (
      <View style={globalStyles.container}>
        <BasicHeader
          title={intl.formatMessage({
            id: 'bookmarks.title',
          })}
        />

        <ScrollableTabView
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
            {this._getTabItem(favorites, 'bookmarks')}
          </View>
          <View
            tabLabel={intl.formatMessage({
              id: 'favorites.title',
            })}
            style={styles.tabbarItem}
          >
            {this._getTabItem(bookmarks, 'favorites')}
          </View>
        </ScrollableTabView>
      </View>
    );
  }
}

export default injectIntl(BookmarksScreen);
