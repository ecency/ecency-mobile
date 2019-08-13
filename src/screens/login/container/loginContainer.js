import React, { PureComponent } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import AppCenter from 'appcenter';

// Services and Actions
import { login } from '../../../providers/steem/auth';
import { lookupAccounts } from '../../../providers/steem/dsteem';
import { userActivity } from '../../../providers/esteem/ePoint';
import {
  failedAccount,
  addOtherAccount,
  updateCurrentAccount,
} from '../../../redux/actions/accountAction';
import { login as loginAction, openPinCodeModal } from '../../../redux/actions/applicationActions';
import { setPushTokenSaved } from '../../../realm/realm';
import { setPushToken } from '../../../providers/esteem/esteem';

// Middleware

// Constants
import ROUTES from '../../../constants/routeNames';

// Utilities

// Component
import LoginScreen from '../screen/loginScreen';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class LoginContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  // Component Life Cycle Functions

  // Component Functions

  _handleOnPressLogin = (username, password) => {
    const { dispatch, intl, isPinCodeOpen, navigation } = this.props;

    this.setState({ isLoading: true });

    login(username, password, isPinCodeOpen)
      .then(result => {
        if (result) {
          dispatch(updateCurrentAccount({ ...result }));
          dispatch(addOtherAccount({ username: result.name }));
          dispatch(loginAction(true));
          userActivity(result.name, 20);
          this._setPushToken(result.name);
          if (isPinCodeOpen) {
            dispatch(openPinCodeModal({ navigateTo: ROUTES.DRAWER.MAIN }));
          } else {
            navigation.navigate({
              routeName: ROUTES.DRAWER.MAIN,
            });
          }
        }
      })
      .catch(err => {
        Alert.alert(
          'Error',
          intl.formatMessage({
            id: err.message,
          }),
        );
        dispatch(failedAccount(err.message));
        this.setState({ isLoading: false });
      });
  };

  _setPushToken = async username => {
    const { notificationSettings, notificationDetails } = this.props;
    const notifyTypesConst = {
      vote: 1,
      mention: 2,
      follow: 3,
      comment: 4,
      reblog: 5,
      transfers: 6,
    };
    const notifyTypes = [];
    const token = await AppCenter.getInstallId();

    Object.keys(notificationDetails).map(item => {
      const notificationType = item.replace('Notification', '');

      if (notificationDetails[item]) {
        notifyTypes.push(notifyTypesConst[notificationType]);
      }
    });

    const data = {
      username,
      token,
      system: Platform.OS,
      allows_notify: Number(notificationSettings),
      notify_types: notifyTypes,
    };
    setPushToken(data).then(() => {
      setPushTokenSaved(true);
    });
  };

  _getAccountsWithUsername = async username => {
    const { intl, isConnected } = this.props;

    if (!isConnected) return null;

    try {
      const validUsers = await lookupAccounts(username);

      return validUsers;
    } catch (error) {
      Alert.alert(
        intl.formatMessage({ id: 'alert.error' }),
        intl.formatMessage({ id: 'alert.unknow_error' }),
      );
    }
  };

  _handleSignUp = () => {
    const { intl } = this.props;

    Linking.openURL('https://signup.steemit.com/?ref=esteem').catch(err =>
      Alert.alert(intl.formatMessage({ id: 'alert.error' }), err.message),
    );
  };

  render() {
    const { isLoading } = this.state;
    const { navigation } = this.props;
    return (
      <LoginScreen
        handleOnPressLogin={this._handleOnPressLogin}
        getAccountsWithUsername={this._getAccountsWithUsername}
        handleSignUp={this._handleSignUp}
        isLoading={isLoading}
        navigation={navigation}
      />
    );
  }
}

const mapStateToProps = state => ({
  account: state.accounts,
  notificationDetails: state.application.notificationDetails,
  notificationSettings: state.application.isNotificationOpen,
  isConnected: state.application.isConnected,
  isPinCodeOpen: state.application.isPinCodeOpen,
});

export default injectIntl(connect(mapStateToProps)(LoginContainer));
