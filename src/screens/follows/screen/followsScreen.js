import React, { PureComponent } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { injectIntl } from 'react-intl';

// Constants

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { UserListItem } from '../../../components/basicUIElements';

// Utils
import styles from './followScreenStyles';

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

  _renderItem = (item, index) => {
    const { isFollowing } = this.props;
    const username = isFollowing ? item.following : item.follower;

    return <UserListItem index={index} username={username} />;
  };

  _renderFooter = () => {
    const { isLoading } = this.props;

    if (isLoading) {
      return (
        <View style={styles.flatlistFooter}>
          <ActivityIndicator animating size="large" />
        </View>
      );
    }
    return null;
  };

  render() {
    const { loadMore, data, isFollowing, count, filterResult, handleSearch, intl } = this.props;
    const title = intl.formatMessage({
      id: !isFollowing ? 'profile.follower' : 'profile.following',
    });

    const headerTitle = `${title} (${count})`;

    return (
      <View style={styles.container}>
        <BasicHeader title={headerTitle} isHasSearch handleOnSearch={handleSearch} />
        {(filterResult && data && filterResult.length > 0) || (data && data.length > 0) ? (
          <FlatList
            data={filterResult || data}
            keyExtractor={(item, index) => index.toString()}
            onEndReached={() => loadMore()}
            removeClippedSubviews={false}
            renderItem={({ item, index }) => this._renderItem(item, index)}
            ListFooterComponent={this._renderFooter}
          />
        ) : (
          <Text style={styles.text}>
            {intl.formatMessage({
              id: 'voters.no_user',
            })}
          </Text>
        )}
      </View>
    );
  }
}

export default injectIntl(FollowsScreen);
