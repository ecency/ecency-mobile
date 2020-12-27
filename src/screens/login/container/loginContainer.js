import React, { PureComponent } from 'react';
import { Alert, Platform } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import Config from 'react-native-config';
import messaging from '@react-native-firebase/messaging';

// Services and Actions
import { login } from '../../../providers/hive/auth';
import { lookupAccounts } from '../../../providers/hive/dhive';
import { userActivity } from '../../../providers/ecency/ePoint';
import {
  failedAccount,
  addOtherAccount,
  updateCurrentAccount,
} from '../../../redux/actions/accountAction';
import {
  login as loginAction,
  openPinCodeModal,
  setPinCode,
} from '../../../redux/actions/applicationActions';
import { setPushTokenSaved, setExistUser } from '../../../realm/realm';
import { setPushToken } from '../../../providers/ecency/ecency';
import { encryptKey } from '../../../utils/crypto';

// Middleware

// Constants
import ROUTES from '../../../constants/routeNames';

// Utilities

// Component
import LoginScreen from '../screen/loginScreen';
import persistAccountGenerator from '../../../utils/persistAccountGenerator';

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
      .then((result) => {
        if (result) {
          const persistAccountData = persistAccountGenerator(result);

          dispatch(updateCurrentAccount({ ...result }));
          dispatch(addOtherAccount({ ...persistAccountData }));
          dispatch(loginAction(true));

          userActivity(result.name, 20);
          setExistUser(true);
          this._setPushToken(result.name);
          if (isPinCodeOpen) {
            dispatch(openPinCodeModal({ navigateTo: ROUTES.DRAWER.MAIN }));
          } else {
            const encryptedPin = encryptKey(Config.DEFAULT_PIN, Config.PIN_KEY);
            dispatch(setPinCode(encryptedPin));
            navigation.navigate({
              routeName: ROUTES.DRAWER.MAIN,
            });
          }
        }
      })
      .catch((err) => {
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

  _setPushToken = async (username) => {
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

    Object.keys(notificationDetails).map((item) => {
      const notificationType = item.replace('Notification', '');

      if (notificationDetails[item]) {
        notifyTypes.push(notifyTypesConst[notificationType]);
      }
    });

    messaging()
      .getToken()
      .then((token) => {
        const data = {
          username,
          token,
          system: `fcm-${Platform.OS}`,
          allows_notify: Number(notificationSettings),
          notify_types: notifyTypes,
        };
        setPushToken(data).then(() => {
          setPushTokenSaved(true);
        });
      });
  };

  _getAccountsWithUsername = async (username) => {
    const { intl, isConnected } = this.props;

    if (!isConnected) {
      return null;
    }

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
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.REGISTER,
    });
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

const mapStateToProps = (state) => ({
  account: state.accounts,
  notificationDetails: state.application.notificationDetails,
  notificationSettings: state.application.isNotificationOpen,
  isConnected: state.application.isConnected,
  isPinCodeOpen: state.application.isPinCodeOpen,
});

export default injectIntl(connect(mapStateToProps)(LoginContainer));
