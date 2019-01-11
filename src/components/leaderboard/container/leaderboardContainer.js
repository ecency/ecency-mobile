import React, { PureComponent } from 'react';

// Services and Actions
import { getLeaderboard } from '../../../providers/esteem/esteem';

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

  render() {
    const { users } = this.state;

    return <LeaderboardView users={users} handleOnUserPress={this._handleOnUserPress} />;
  }
}

export default LeaderboardContainer;
