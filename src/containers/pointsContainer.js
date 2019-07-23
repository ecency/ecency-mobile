import React, { Component } from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";
import get from "lodash/get";
import { injectIntl } from "react-intl";
import { withNavigation } from "react-navigation";

// Services and Actions
import { getUser, getUserPoints, claim } from "../providers/esteem/ePoint";
import { openPinCodeModal } from "../redux/actions/applicationActions";
import { promote, getAccount } from "../providers/steem/dsteem";
import { getUserDataWithUsername } from "../realm/realm";
import { toastNotification } from "../redux/actions/uiAction";

// Constant
import POINTS from "../constants/options/points";

// Constants
import ROUTES from "../constants/routeNames";

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
      isLoading: true
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    const { username, isConnected } = this.props;

    if (isConnected) {
      this._fetchuserPointActivities(username);
      this.fetchInterval = setInterval(
        this._fetchuserPointActivities,
        6 * 60 * 1000
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    const { username } = this.props;

    if (
      nextProps.isConnected &&
      ((nextProps.activeBottomTab === ROUTES.TABBAR.POINTS &&
        nextProps.username) ||
        (nextProps.username !== username && nextProps.username))
    ) {
      this._fetchuserPointActivities(nextProps.username);
    }
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  // Component Functions

  _handleOnPressTransfer = index => {
    const { dispatch } = this.props;
    const { balance } = this.state;
    let navigateTo;
    let navigateParams;

    switch (Number(index)) {
      case 0:
        navigateTo = ROUTES.SCREENS.TRANSFER;
        navigateParams = {
          transferType: "points",
          fundType: "POINT",
          balance
        };
        break;

      case 1:
        navigateTo = ROUTES.SCREENS.PROMOTE;
        navigateParams = {
          balance
        };
        break;

      default:
        break;
    }

    dispatch(
      openPinCodeModal({
        navigateTo,
        navigateParams
      })
    );
  };

  _groomUserActivities = userActivities =>
    userActivities.map(item => ({
      ...item,
      icon: get(POINTS[get(item, "type")], "icon"),
      iconType: get(POINTS[get(item, "type")], "iconType"),
      textKey: get(POINTS[get(item, "type")], "textKey")
    }));

  _fetchuserPointActivities = async username => {
    if (!username) return;
    this.setState({ refreshing: true });

    await getUser(username)
      .then(userPoints => {
        const balance = Math.round(get(userPoints, "points") * 1000) / 1000;
        this.setState({ userPoints, balance });
      })
      .catch(err => {
        Alert.alert(err.message);
      });

    await getUserPoints(username)
      .then(userActivities => {
        if (Object.entries(userActivities).length !== 0) {
          this.setState({
            userActivities: this._groomUserActivities(userActivities)
          });
        }
      })
      .catch(err => {
        Alert.alert(err);
      });

    this.setState({
      refreshing: false,
      isLoading: false
    });
  };

  _getUserBalance = async username => {
    await getUser(username)
      .then(userPoints => {
        const balance = Math.round(get(userPoints, "points") * 1000) / 1000;
        return balance;
      })
      .catch(err => {
        Alert.alert(err);
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
            20
          )}`
        );
      });

    this.setState({ isClaiming: false });
  };

  _promote = async (duration, permlink, author, user) => {
    const { currentAccount, pinCode, dispatch, intl, navigation } = this.props;
    this.setState({ isLoading: true });

    await promote(user || currentAccount, pinCode, duration, permlink, author)
      .then(() => {
        this.setState({ isLoading: false });
        dispatch(
          toastNotification(intl.formatMessage({ id: "alert.successful" }))
        );
        navigation.goBack();
      })
      .catch(error => {
        Alert.alert(
          `Fetching data from server failed, please try again or notify us at info@esteem.app \n${error.message.substr(
            0,
            20
          )}`
        );
      });
  };

  render() {
    const {
      isClaiming,
      isDarkTheme,
      isLoading,
      refreshing,
      userActivities,
      userPoints,
      balance
    } = this.state;
    const { children, accounts, currentAccount } = this.props;

    return (
      children &&
      children({
        accounts,
        currentAccount,
        currentAccountName: currentAccount.name,
        claimPoints: this._claimPoints,
        fetchUserActivity: this._fetchuserPointActivities,
        isClaiming,
        isDarkTheme,
        isLoading,
        refreshing,
        userActivities,
        userPoints,
        handleOnPressTransfer: this._handleOnPressTransfer,
        balance,
        getUserBalance: this._getUserBalance,
        promote: this._promote,
        getAccount,
        getUserDataWithUsername
      })
    );
  }
}

const mapStateToProps = state => ({
  username: state.account.currentAccount.name,
  isDarkTheme: state.application.isDarkTheme,
  activeBottomTab: state.ui.activeBottomTab,
  isConnected: state.application.isConnected,
  accounts: state.account.otherAccounts,
  currentAccount: state.account.currentAccount,
  pinCode: state.account.pin
});

export default withNavigation(
  connect(mapStateToProps)(injectIntl(PointsContainer))
);
