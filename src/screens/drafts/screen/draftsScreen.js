import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { View, FlatList, Text } from 'react-native';
import ScrollableTabView from '@esteemapp/react-native-scrollable-tab-view';

// Utils
import { getPostSummary } from '../../../utils/formatter';
import { catchDraftImage } from '../../../utils/image';
// Constants

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { PostListItem } from '../../../components/postListItem';
import { PostCardPlaceHolder } from '../../../components/basicUIElements';
import { TabBar } from '../../../components/tabBar';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './draftStyles';

class DraftsScreen extends Component {
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

  _renderItem = (item, type) => {
    const {
      currentAccount, removeDraft, editDraft, removeSchedule,
    } = this.props;
    const tags = item.tags ? item.tags.split(/[ ,]+/) : [];
    const tag = tags[0] || '';
    const image = catchDraftImage(item.body);
    const summary = getPostSummary(item.body, 100);

    return (
      <PostListItem
        created={item.created}
        mainTag={tag}
        title={item.title}
        summary={summary}
        image={image ? { uri: catchDraftImage(item.body) } : null}
        username={currentAccount.name}
        reputation={currentAccount.reputation}
        handleOnPressItem={editDraft}
        handleOnRemoveItem={type === 'schedules' ? removeSchedule : removeDraft}
        id={item._id}
      />
    );
  };

  _getTabItem = (data, type) => {
    const { isLoading, intl } = this.props;
    const isNoItem = (data && data.length === 0) || !data;

    return (
      <View style={globalStyles.lightContainer}>
        {isNoItem && !isLoading && (
          <Text style={globalStyles.hintText}>
            {intl.formatMessage({
              id: 'drafts.empty_list',
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
              renderItem={({ item }) => this._renderItem(item, type)}
            />
          )
        )}
      </View>
    );
  };

  render() {
    const { drafts, schedules, intl } = this.props;

    return (
      <View style={globalStyles.container}>
        <BasicHeader
          title={intl.formatMessage({
            id: 'drafts.title',
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
              id: 'drafts.title',
            })}
            style={styles.tabbarItem}
          >
            {this._getTabItem(drafts, 'drafts')}
          </View>
          <View
            tabLabel={intl.formatMessage({
              id: 'schedules.title',
            })}
            style={styles.tabbarItem}
          >
            {this._getTabItem(schedules, 'schedules')}
          </View>
        </ScrollableTabView>
      </View>
    );
  }
}

export default injectIntl(DraftsScreen);
