/* eslint-disable react/jsx-wrap-multilines */
import React, { PureComponent } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { injectIntl } from 'react-intl';
import { withNavigation } from 'react-navigation';

// Constants
import ROUTES from '../../../constants/routeNames';

// Components
import { BasicHeader, UserListItem } from '../../../components';

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
  _handleOnUserPress = (username) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username,
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
      <View style={styles.container}>
        <BasicHeader title={headerTitle} isHasSearch handleOnSearch={handleSearch} />
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={() => loadMore()}
          removeClippedSubviews={false}
          renderItem={this._renderItem}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.text}>
                {intl.formatMessage({
                  id: 'voters.no_user',
                })}
              </Text>
            )
          }
        />
      </View>
    );
  }
}

export default withNavigation(injectIntl(FollowsScreen));
/* eslint-enable */
