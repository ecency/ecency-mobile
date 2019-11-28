import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';
import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';

// Services and Actions
import { getLeaderboard } from '../../../providers/esteem/esteem';

// Constants
import ROUTES from '../../../constants/routeNames';

// Component
import LeaderboardView from '../view/leaderboardView';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class LeaderboardContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      users: null,
      refreshing: false,
      selectedIndex: 0,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    const { isConnected } = this.props;

    if (isConnected) {
      this._fetchLeaderBoard();
    }
  }

  _handleOnUserPress = username => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
    });
  };

  _fetchLeaderBoard = async (selectedFilter, index) => {
    const { intl, isConnected } = this.props;
    const { selectedIndex } = this.state;

    if (index == undefined) {
      index = selectedIndex;
    }
    let users;

    console.log(index);
    if (!isConnected) return;

    this.setState({ refreshing: true, selectedIndex: index });

    try {
      users = await getLeaderboard(selectedFilter);
    } catch (error) {
      Alert.alert(
        intl.formatMessage({ id: 'alert.error' }),
        intl.formatMessage({ id: 'alert.unknow_error' }),
      );
    }

    this.setState({ users, refreshing: false });
  };

  render() {
    const { users, refreshing, selectedIndex } = this.state;

    return (
      <LeaderboardView
        users={users}
        refreshing={refreshing}
        fetchLeaderBoard={this._fetchLeaderBoard}
        handleOnUserPress={this._handleOnUserPress}
        selectedIndex={selectedIndex}
      />
    );
  }
}

const mapStateToProps = state => ({
  isConnected: state.application.isConnected,
});

export default injectIntl(withNavigation(connect(mapStateToProps)(LeaderboardContainer)));
