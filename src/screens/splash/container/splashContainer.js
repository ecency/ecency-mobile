import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getUserData, getAuthStatus } from '../../../realm/realm';
import { getAccount } from '../../../providers/steem/dsteem';

// Actions
import { addOtherAccount, updateCurrentAccount } from '../../../redux/actions/accountAction';
import {
  activeApplication,
  login,
  openPinCodeModal,
} from '../../../redux/actions/applicationActions';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

import SplashScreen from '../screen/splashScreen';

class SplashContainer extends Component {
  componentDidMount = () => {
    this._getUserData();
  };

  _getUserData = () => {
    const { navigation, dispatch } = this.props;

    getAuthStatus().then((res) => {
      if (res) {
        getUserData().then((response) => {
          if (response.length > 0) {
            response.forEach((accountData) => {
              dispatch(addOtherAccount({ username: accountData.username }));
            });
            getAccount(response[response.length - 1].username).then((accountData) => {
              dispatch(updateCurrentAccount(...accountData));
              dispatch(activeApplication());
              dispatch(login());
              if (__DEV__ === false) {
                dispatch(openPinCodeModal());
              }
              navigation.navigate(ROUTES.DRAWER.MAIN);
            });
          }
        });
      } else {
        dispatch(activeApplication());
        navigation.navigate(ROUTES.SCREENS.LOGIN);
      }
    });
  };

  render() {
    return <SplashScreen />;
  }
}

export default connect()(SplashContainer);
