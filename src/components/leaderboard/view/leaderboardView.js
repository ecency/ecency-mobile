import React, { PureComponent } from 'react';
import { View, FlatList, Text } from 'react-native';
import { injectIntl } from 'react-intl';

// Components
import { UserListItem } from '../../basicUIElements';

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
        index={index}
        username={item._id}
        description={item.created}
        isHasRightItem
        isClickable
        isBlackRightColor
        rightText={item.count}
        itemIndex={index + 1}
        handleOnPress={() => handleOnUserPress(item._id)}
      />
    );
  };

  render() {
    const {
      users, intl, fetchLeaderBoard, refreshing,
    } = this.props;

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
          keyExtractor={item => item.voter}
          removeClippedSubviews={false}
          onRefresh={() => fetchLeaderBoard()}
          renderItem={({ item, index }) => this._renderItem(item, index)}
        />
      </View>
    );
  }
}

export default injectIntl(LeaderboardView);
