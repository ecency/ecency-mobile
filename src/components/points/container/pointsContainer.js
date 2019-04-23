import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';

// Services and Actions
import { getUser, getUserPoints, claim } from '../../../providers/esteem/ePoint';

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
      isClaiming: false,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    this._fetchuserPointActivities();

    this.fetchInterval = setInterval(this._fetchuserPointActivities, 360000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
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
        if (Object.entries(userActivities).length !== 0) {
          this.setState({
            userActivities: this._groomUserActivities(userActivities),
          });
        }
      })
      .catch((err) => {
        Alert.alert(err);
      });

    this.setState({ refreshing: false });
  };

  _claimPoints = async () => {
    const { username } = this.props;
    this.setState({ isClaiming: true });

    await claim(username)
      .then(() => {
        this._fetchuserPointActivities();
      })
      .catch((err) => {
        Alert.alert(err);
      });

    this.setState({ isClaiming: false });
  }

  render() {
    const {
      userPoints, userActivities, isDarkTheme, refreshing, isClaiming,
    } = this.state;

    return (
      <PointsView
        userPoints={userPoints}
        userActivities={userActivities}
        isDarkTheme={isDarkTheme}
        fetchUserActivity={this._fetchuserPointActivities}
        refreshing={refreshing}
        isClaiming={isClaiming}
        claimPoints={this._claimPoints}
      />
    );
  }
}

const mapStateToProps = state => ({
  username: state.account.currentAccount.name,
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(PointsContainer);
