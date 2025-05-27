import React, { PureComponent } from 'react';
import { injectIntl } from 'react-intl';
import { ActivityIndicator, FlatList, Text } from 'react-native';
// Constants
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
// Components
import { SheetManager } from 'react-native-actions-sheet';
import { BasicHeader, UserListItem } from '../../../components';

// Utils
import styles from './followScreenStyles';
import { SheetNames } from '../../../navigation/sheets';

class FollowsScreen extends PureComponent {
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
  _handleOnUserPress = (username) => {
    SheetManager.show(SheetNames.QUICK_PROFILE, {
      payload: {
        username,
      },
    });
  };

  _renderItem = ({ item, index }) => {
    const { isFollowing } = this.props;
    const username = isFollowing ? item.following : item.follower;

    return (
      <UserListItem
        index={index}
        username={username}
        handleOnPress={() => this._handleOnUserPress(username)}
      />
    );
  };

  render() {
    const { loadMore, data, isFollowing, count, handleSearch, intl, isLoading } = this.props;
    const title = intl.formatMessage({
      id: !isFollowing ? 'profile.follower' : 'profile.following',
    });
    const headerTitle = `${title} (${count})`;

    return (
      <SafeAreaView style={styles.container}>
        <BasicHeader
          title={headerTitle}
          isHasSearch
          backIconName="close"
          handleOnSearch={handleSearch}
        />
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={() => loadMore()}
          removeClippedSubviews={false}
          renderItem={this._renderItem}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator color={EStyleSheet.value('$primaryBlue')} />
            ) : (
              <Text style={styles.text}>
                {intl.formatMessage({
                  id: 'voters.no_user',
                })}
              </Text>
            )
          }
        />
      </SafeAreaView>
    );
  }
}
export default connect()(injectIntl(FollowsScreen));
