import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';

// Services and Actions
import { getLeaderboard } from '../../../providers/esteem/esteem';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

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
    };
  }

  // Component Life Cycle Functions
  async componentDidMount() {
    const users = await getLeaderboard();

    this.setState({ users });
  }

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

  render() {
    const { users } = this.state;

    return <LeaderboardView users={users} handleOnUserPress={this._handleOnUserPress} />;
  }
}

export default withNavigation(LeaderboardContainer);
