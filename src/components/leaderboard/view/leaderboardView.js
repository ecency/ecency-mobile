import React, { PureComponent } from 'react';
import { View, FlatList, Text } from 'react-native';
import { injectIntl } from 'react-intl';

// Constants

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
  _renderItem = (item, index) => (
    <UserListItem
      index={index}
      username={item._id}
      description={item.created}
      isHasRightItem
      isBlackRightColor
      rightText={item.count}
      itemIndex={index + 1}
    />
  );

  render() {
    const { users, intl } = this.props;

    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {intl.formatMessage({
            id: 'notification.leaderboard_title',
          })}
        </Text>
        <FlatList
          data={users}
          keyExtractor={item => item.voter}
          removeClippedSubviews={false}
          renderItem={({ item, index }) => this._renderItem(item, index)}
        />
      </View>
    );
  }
}

export default injectIntl(LeaderboardView);
