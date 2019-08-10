import React, { PureComponent } from 'react';
import { View, FlatList, Text } from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Components
import { UserListItem, ListPlaceHolder } from '../../basicUIElements';

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
        rightText={get(item, 'count')}
        itemIndex={index + 1}
        handleOnPress={() => handleOnUserPress(get(item, '_id'))}
      />
    );
  };

  render() {
    const { users, intl, fetchLeaderBoard, refreshing } = this.props;

    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {intl.formatMessage({
            id: 'notification.leaderboard_title',
          })}
        </Text>
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
    );
  }
}

export default injectIntl(LeaderboardView);
