import React, { PureComponent } from 'react';
import { View, FlatList, Text } from 'react-native';
import { injectIntl } from 'react-intl';

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
<<<<<<< HEAD

        {!users
          ? <ListPlaceHolder />
          : (
            <FlatList
              data={users}
              refreshing={refreshing}
              keyExtractor={item => item.voter}
              removeClippedSubviews={false}
              onRefresh={() => fetchLeaderBoard()}
              renderItem={({ item, index }) => this._renderItem(item, index)}
            />
          )
        }
=======
        <FlatList
          data={users}
          refreshing={refreshing}
          keyExtractor={item => item._id}
          removeClippedSubviews={false}
          onRefresh={() => fetchLeaderBoard()}
          renderItem={({ item, index }) => this._renderItem(item, index)}
        />
>>>>>>> a1029cd94557166ab9cc5cca1bfee8d0915c9f67
      </View>
    );
  }
}

export default injectIntl(LeaderboardView);
