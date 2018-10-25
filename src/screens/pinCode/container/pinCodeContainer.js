import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import { connect } from 'react-redux';

import { setUserDataWithPinCode, verifyPinCode } from '../../../providers/steem/auth';

// Constants
import { default as INITIAL } from '../../../constants/initial';
import { default as ROUTES } from '../../../constants/routeNames';

import { PinCodeScreen } from '..';

class PinCodeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExistUser: null,
      informationText: '',
      pinCode: null,
    };
  }

  // TODO: if check for decide to set to pin or verify to pin page
  componentDidMount() {
    this._getDataFromStorage().then(() => {
      const { isExistUser } = this.state;
      if (isExistUser) {
        this.setState({
          informationText: 'Enter pin to unlock',
        });
      } else {
        this.setState({
          informationText: 'Set new pin',
        });
      }
    });
  }

  _getDataFromStorage = () => new Promise((resolve) => {
    AsyncStorage.getItem(INITIAL.IS_EXIST_USER, (err, result) => {
      this.setState(
        {
          isExistUser: JSON.parse(result),
        },
        resolve,
      );
    });
  });

  _setPinCode = pin => new Promise((resolve, reject) => {
    const {
      currentAccount: { password, name },
      navigation,
    } = this.props;
    const { isExistUser, pinCode } = this.state;
    if (isExistUser) {
      // If the user is exist, we are just checking to pin and navigating to home screen
      const pinData = {
        pinCode: pin,
        password,
        username: name,
        accessToken: navigation.getParam('accessToken', ''),
      };
      verifyPinCode(pinData)
        .then(() => {
          // TODO: make global route
          navigation.navigate(ROUTES.DRAWER.MAIN);
        })
        .catch((err) => {
          alert(err);
          reject(err);
        });
    } else if (!pinCode) {
      // If the user is logging in for the first time, the user should set to pin
      this.setState({
        informationText: 'Write again',
        pinCode: pin,
      });
      resolve();
    } else if (pinCode === pin) {
      const pinData = {
        pinCode: pin,
        password,
        username: name,
      };
      setUserDataWithPinCode(pinData).then(() => {
        AsyncStorage.setItem(INITIAL.IS_EXIST_USER, JSON.stringify(true), () => {
          navigation.navigate(ROUTES.DRAWER.MAIN);
          resolve();
        });
      });
    } else {
      this.setState({
        informationText: 'wrongggg!!!',
      });
      setTimeout(() => {
        this.setState({
          informationText: 'setup screen',
          pinCode: null,
        });
        resolve();
      }, 1000);
    }
  });

  render() {
    const { currentAccount } = this.props;
    const { informationText, isExistUser } = this.state;
    return (
      <PinCodeScreen
        informationText={informationText}
        setPinCode={this._setPinCode}
        showForgotButton={isExistUser}
        username={currentAccount ? currentAccount.name : 'unknow'}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.data.accounts.find(
    item => item.id === state.account.data.currentAccountId,
  ),
});

export default connect(mapStateToProps)(PinCodeContainer);
