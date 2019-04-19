import React, { Component, Alert } from 'react';
import { connect } from 'react-redux';

// Services and Actions
import { getUser, getUserPoints } from '../../../providers/esteem/ePoint';

// Constant
import POINTS from '../../../constants/options/points';
// Component
import PointsView from '../view/pointsView';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class PointsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userPoints: {},
      userActivities: {},
      refreshing: false,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    this._fetchuserPointActivities();
  }

  // Component Functions

  _groomUserActivities = userActivities => userActivities.map(item => ({
    ...item,
    icon: POINTS[item.type].icon,
    iconType: POINTS[item.type].iconType,
    textKey: POINTS[item.type].textKey,
  }));

  _fetchuserPointActivities = async () => {
    const { username } = this.props;

    this.setState({ refreshing: true });

    await getUser(username)
      .then((userPoints) => {
        this.setState({ userPoints });
      })
      .catch((err) => {
        Alert.alert(err);
      });

    await getUserPoints(username)
      .then((userActivities) => {
        this.setState({
          userActivities: this._groomUserActivities(userActivities),
        });
      })
      .catch((err) => {
        Alert.alert(err);
      });

    this.setState({ refreshing: false });
  };

  render() {
    const {
      userPoints, userActivities, isDarkTheme, refreshing,
    } = this.state;

    return (
      <PointsView
        userPoints={userPoints}
        userActivities={userActivities}
        isDarkTheme={isDarkTheme}
        fetchUserActivity={this._fetchuserPointActivities}
        refreshing={refreshing}
      />
    );
  }
}

const mapStateToProps = state => ({
  username: state.account.currentAccount.name,
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(PointsContainer);
