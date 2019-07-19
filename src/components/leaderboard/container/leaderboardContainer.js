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

  _fetchLeaderBoard = async () => {
    const { intl, isConnected } = this.props;
    let users;

    if (!isConnected) return;

    this.setState({ refreshing: true });

    try {
      users = await getLeaderboard();
    } catch (error) {
      Alert.alert(
        intl.formatMessage({ id: 'alert.error' }),
        intl.formatMessage({ id: 'alert.unknow_error' }),
      );
    }

    this.setState({ users, refreshing: false });
  };

  render() {
    const { users, refreshing } = this.state;

    return (
      <LeaderboardView
        users={users}
        refreshing={refreshing}
        fetchLeaderBoard={this._fetchLeaderBoard}
        handleOnUserPress={this._handleOnUserPress}
      />
    );
  }
}

const mapStateToProps = state => ({
  isConnected: state.application.isConnected,
});

export default injectIntl(withNavigation(connect(mapStateToProps)(LeaderboardContainer)));
