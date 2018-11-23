import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getUserData, getAuthStatus, getSettings } from '../../../realm/realm';
import { getUser } from '../../../providers/steem/dsteem';

// Actions
import { addOtherAccount, updateCurrentAccount } from '../../../redux/actions/accountAction';
import {
  activeApplication,
  login,
  openPinCodeModal,
  setLanguage,
  isNotificationOpen,
  setCurrency,
  setApi,
  isDarkTheme,
} from '../../../redux/actions/applicationActions';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

import SplashScreen from '../screen/splashScreen';

class SplashContainer extends Component {
  componentDidMount = () => {
    this._getUserData();
    this._getSettings();
  };

  _getUserData = () => {
    const { navigation, dispatch } = this.props;

    getAuthStatus().then((res) => {
      if (res.isLoggedIn) {
        getUserData().then((response) => {
          if (response.length > 0) {
            response.forEach((accountData) => {
              dispatch(
                addOtherAccount({ username: accountData.username, avatar: accountData.avatar }),
              );
            });
            getUser(response[response.length - 1].username)
              .then((accountData) => {
                const realmObject = response[response.length - 1];
                accountData.realm_object = realmObject;

                dispatch(updateCurrentAccount(accountData));
                dispatch(activeApplication());
                dispatch(login());
                if (__DEV__ === false) {
                  dispatch(openPinCodeModal());
                }
                navigation.navigate(ROUTES.DRAWER.MAIN);
              })
              .catch((err) => {
                alert(err);
              });
          }
        });
      } else {
        dispatch(activeApplication());
        navigation.navigate(ROUTES.DRAWER.MAIN);
      }
    });
  };

  _getSettings = () => {
    const { dispatch } = this.props;

    getSettings().then((response) => {
      console.log(response.isDarkTheme);

      if (response) {
        response.isDarkTheme && dispatch(isDarkTheme(response.isDarkTheme));
        response.language && dispatch(setLanguage(response.language));
        response.currency && dispatch(setCurrency(response.currency));
        response.notification && dispatch(isNotificationOpen(response.currency));
        response.server && dispatch(setApi(response.currency));
      }
    });
  };

  render() {
    return <SplashScreen />;
  }
}

export default connect()(SplashContainer);
