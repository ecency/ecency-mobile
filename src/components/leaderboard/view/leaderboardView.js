import React, { PureComponent, Fragment } from 'react';
import { View, FlatList, Text } from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { UserListItem, ListPlaceHolder } from '../../basicUIElements';
import { FilterBar } from '../../filterBar';
import FILTER_OPTIONS, { VALUE } from '../../../constants/options/leaderboard';
// Styles
import styles from './leaderboardStyles';

class LeaderboardView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  // Component Functions
  _renderItem = (item, index) => {
    const { handleOnUserPress } = this.props;

    return (
      <UserListItem
        key={get(item, '_id')}
        index={index}
        username={get(item, '_id')}
        description={get(item, 'created')}
        isHasRightItem
        isClickable
        isBlackRightColor
        rightText={get(item, 'points')}
        middleText={get(item, 'count')}
        itemIndex={index + 1}
        handleOnPress={() => handleOnUserPress(get(item, '_id'))}
        rightTextStyle={styles.rewardText}
      />
    );
  };

  render() {
    const { users, intl, fetchLeaderBoard, refreshing } = this.props;

    return (
      <Fragment>
        <FilterBar
          dropdownIconName="arrow-drop-down"
          options={VALUE}
          selectedOptionIndex={0}
          defaultText={VALUE[0]}
          onDropdownSelect={selectedIndex => fetchLeaderBoard(FILTER_OPTIONS[selectedIndex])}
        />

        <View style={styles.container}>
          <View style={styles.columnTitleWrapper}>
            <Text style={styles.title}>
              {intl.formatMessage({
                id: 'notification.leaderboard_title',
              })}
            </Text>
            <Text style={[styles.columnTitle]}>Activities</Text>
            <Text style={[styles.columnTitle]}>Reward</Text>
          </View>

          <FlatList
            data={users}
            refreshing={refreshing}
            keyExtractor={item => get(item, '_id', Math.random()).toString()}
            removeClippedSubviews={false}
            ListEmptyComponent={<ListPlaceHolder />}
            onRefresh={() => fetchLeaderBoard()}
            renderItem={({ item, index }) => this._renderItem(item, index)}
          />
        </View>
      </Fragment>
    );
  }
}

export default injectIntl(LeaderboardView);
