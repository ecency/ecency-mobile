import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Services and Actions
import { getUser, getUserPoints, claim } from '../../../providers/esteem/ePoint';
import { openPinCodeModal } from '../../../redux/actions/applicationActions';

// Constant
import POINTS from '../../../constants/options/points';

// Component
import PointsView from '../view/pointsView';

// Constants
import ROUTES from '../../../constants/routeNames';

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
      userActivities: null,
      refreshing: false,
      isClaiming: false,
      isLoading: true,
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    const { username } = this.props;

    this._fetchuserPointActivities(username);

    this.fetchInterval = setInterval(this._fetchuserPointActivities, 6 * 60 * 1000);
  }

  componentWillReceiveProps(nextProps) {
    const { username } = this.props;

    if (
      (nextProps.activeBottomTab === ROUTES.TABBAR.POINTS && nextProps.username) ||
      (nextProps.username !== username && nextProps.username)
    ) {
      this._fetchuserPointActivities(nextProps.username);
    }
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  // Component Functions

  _handleOnPressTransfer = () => {
    const { dispatch } = this.props;
    const { userPoints } = this.state;

    dispatch(
      openPinCodeModal({
        navigateTo: ROUTES.SCREENS.TRANSFER,
        navigateParams: {
          transferType: 'points',
          fundType: 'ESTM',
          balance: Math.round(get(userPoints, 'points') * 1000) / 1000,
        },
      }),
    );
  };

  _groomUserActivities = userActivities =>
    userActivities.map(item => ({
      ...item,
      icon: get(POINTS[get(item, 'type')], 'icon'),
      iconType: get(POINTS[get(item, 'type')], 'iconType'),
      textKey: get(POINTS[get(item, 'type')], 'textKey'),
    }));

  _fetchuserPointActivities = async username => {
    if (!username) return;
    this.setState({ refreshing: true });

    await getUser(username)
      .then(userPoints => {
        this.setState({ userPoints });
      })
      .catch(err => {
        Alert.alert(err);
      });

    await getUserPoints(username)
      .then(userActivities => {
        if (Object.entries(userActivities).length !== 0) {
          this.setState({
            userActivities: this._groomUserActivities(userActivities),
          });
        }
      })
      .catch(err => {
        Alert.alert(err);
      });

    this.setState({
      refreshing: false,
      isLoading: false,
    });
  };

  _claimPoints = async () => {
    const { username } = this.props;

    this.setState({ isClaiming: true });

    await claim(username)
      .then(() => {
        this._fetchuserPointActivities(username);
      })
      .catch(error => {
        Alert.alert(
          `Fetching data from server failed, please try again or notify us at info@esteem.app \n${error.message.substr(
            0,
            20,
          )}`,
        );
      });

    this.setState({ isClaiming: false });
  };

  render() {
    const {
      isClaiming,
      isDarkTheme,
      isLoading,
      refreshing,
      userActivities,
      userPoints,
    } = this.state;

    return (
      <PointsView
        claimPoints={this._claimPoints}
        fetchUserActivity={this._fetchuserPointActivities}
        isClaiming={isClaiming}
        isDarkTheme={isDarkTheme}
        isLoading={isLoading}
        refreshing={refreshing}
        userActivities={userActivities}
        userPoints={userPoints}
        handleOnPressTransfer={this._handleOnPressTransfer}
      />
    );
  }
}

const mapStateToProps = state => ({
  username: state.account.currentAccount.name,
  isDarkTheme: state.application.isDarkTheme,
  activeBottomTab: state.ui.activeBottomTab,
});

export default connect(mapStateToProps)(PointsContainer);
