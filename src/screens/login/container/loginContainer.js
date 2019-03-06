import React, { PureComponent } from 'react';
import { Alert, Linking } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

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
    const { dispatch, setPinCodeState, intl } = this.props;

    this.setState({ isLoading: true });

    login(username, password)
      .then((result) => {
        if (result) {
          dispatch(updateCurrentAccount({ ...result }));
          dispatch(addOtherAccount({ username: result.name }));
          dispatch(openPinCodeModal());
          setPinCodeState({ navigateTo: ROUTES.DRAWER.MAIN });
          dispatch(loginAction(true));
          userActivity(result.name, 20);
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

  _getAccountsWithUsername = async (username) => {
    const validUsers = await lookupAccounts(username);
    return validUsers;
  };

  _handleSignUp = () => {
    Linking.openURL('https://signup.steemit.com/?ref=esteem').catch(err => alert('An error occurred', err));
  };

  render() {
    const { isLoading } = this.state;
    const { navigation, setPinCodeState } = this.props;
    return (
      <LoginScreen
        handleOnPressLogin={this._handleOnPressLogin}
        getAccountsWithUsername={this._getAccountsWithUsername}
        handleSignUp={this._handleSignUp}
        isLoading={isLoading}
        navigation={navigation}
        setPinCodeState={setPinCodeState}
      />
    );
  }
}

const mapStateToProps = state => ({
  account: state.accounts,
});

export default injectIntl(connect(mapStateToProps)(LoginContainer));
