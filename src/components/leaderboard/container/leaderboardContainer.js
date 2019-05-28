import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';
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
    this._fetchLeaderBoard();
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
    this.setState({ refreshing: true });

    const users = await getLeaderboard();

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

export default withNavigation(LeaderboardContainer);
