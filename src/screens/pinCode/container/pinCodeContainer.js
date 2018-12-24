import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import {
  setUserDataWithPinCode,
  verifyPinCode,
  updatePinCode,
} from '../../../providers/steem/auth';

// Actions & Services
import { closePinCodeModal } from '../../../redux/actions/applicationActions';
import { getExistUser, setExistUser, getUserDataWithUsername } from '../../../realm/realm';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';

// Component
import PinCodeScreen from '../screen/pinCodeScreen';

class PinCodeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExistUser: null,
      informationText: '',
      pinCode: null,
      isOldPinVerified: false,
      oldPinCode: null,
    };
  }

  // TODO: if check for decide to set to pin or verify to pin page
  // TODO: these text should move to view!
  componentDidMount() {
    this._getDataFromStorage().then(() => {
      const { intl } = this.props;
      const { isExistUser } = this.state;
      if (isExistUser) {
        this.setState({
          informationText: intl.formatMessage({
            id: 'pincode.enter_text',
          }),
        });
      } else {
        this.setState({
          informationText: intl.formatMessage({
            id: 'pincode.set_new',
          }),
        });
      }
    });
  }

  componentWillReceiveProps(nextProps){
console.log('nextProps :', nextProps);
  }

  _getDataFromStorage = () => new Promise((resolve) => {
    getExistUser().then((isExistUser) => {
      this.setState(
        {
          isExistUser,
        },
        resolve,
      );
    });
  });

  _resetPinCode = pin => new Promise((resolve, reject) => {
    console.log('_resetPinCode :', pin);
    const {
      currentAccount,
      dispatch,
      accessToken,
      navigateTo,
      navigation,
      intl,
    } = this.props;
    const { isOldPinVerified, oldPinCode } = this.state;

    const pinData = {
      pinCode: pin,
      password: currentAccount ? currentAccount.password : '',
      username: currentAccount ? currentAccount.name : '',
      accessToken,
      oldPinCode,
    };

    if (isOldPinVerified) {
      console.log('pinData updatePinCode :', pinData);
      updatePinCode(pinData).then((response) => {
        const _currentAccount = currentAccount;
        _currentAccount.local = response;

        dispatch(updateCurrentAccount({ ..._currentAccount }));

        dispatch(closePinCodeModal());
        if (navigateTo) {
          navigation.navigate(navigateTo);
        }
        resolve();
      });
    } else {
      console.log('pinData verifyPinCode :', pinData);
      verifyPinCode(pinData)
        .then(() => {
          this.setState({ isOldPinVerified: true });
          this.setState({
            informationText: intl.formatMessage({
              id: 'pincode.set_new',
            }),
            pinCode: null,
            oldPinCode: pin,
          });
          resolve();
        })
        .catch((err) => {
          Alert.alert('Warning', err.message);
          reject(err);
        });
    }
  });

  _setFirstPinCode = pin => new Promise((resolve) => {
    console.log('_setFirstPinCode :', pin);
    const {
      currentAccount,
      dispatch,
      accessToken,
      navigateTo,
      navigation,
    } = this.props;

    const pinData = {
      pinCode: pin,
      password: currentAccount ? currentAccount.password : '',
      username: currentAccount ? currentAccount.name : '',
      accessToken,
    };
    setUserDataWithPinCode(pinData).then((response) => {
      const _currentAccount = currentAccount;
      _currentAccount.local = response;

      dispatch(updateCurrentAccount({ ..._currentAccount }));

      setExistUser(true).then(() => {
        dispatch(closePinCodeModal());
        if (navigateTo) {
          navigation.navigate(navigateTo);
        }
        resolve();
      });
    });
  });

  _verifyPinCode = pin => new Promise((resolve, reject) => {
    console.log('_verifyPinCode :', pin);
    const {
      currentAccount,
      dispatch,
      accessToken,
      navigateTo,
      navigation,
      setWrappedComponentState,
    } = this.props;

    // If the user is exist, we are just checking to pin and navigating to home screen
    const pinData = {
      pinCode: pin,
      password: currentAccount ? currentAccount.password : '',
      username: currentAccount ? currentAccount.name : '',
      accessToken,
    };
    verifyPinCode(pinData)
      .then((res) => {
        setWrappedComponentState(res);
        dispatch(closePinCodeModal());

        const realmData = getUserDataWithUsername(currentAccount.name);
        const _currentAccount = currentAccount;
        _currentAccount.username = _currentAccount.name;
        [_currentAccount.local] = realmData;
        dispatch(updateCurrentAccount({ ..._currentAccount }));

        if (navigateTo) {
          navigation.navigate(navigateTo);
        }
      })
      .catch((err) => {
        Alert.alert('Warning', err.message);
        reject(err);
      });
  });

  _setPinCode = async (pin) => {
    const {
      intl,
      isReset,
    } = this.props;
    const {
      isExistUser, pinCode,
    } = this.state;
console.log('this.props :', this.props);
    // For exist users
    if (isReset) return this._resetPinCode(pin);
    if (isExistUser) return this._verifyPinCode(pin);

    // For new users
    if (pinCode === pin) return this._setFirstPinCode(pin);

    if (!pinCode) {
      console.log('1 :', pinCode);
      // If the user is logging in for the first time, the user should set to pin
      await this.setState({
        informationText: intl.formatMessage({
          id: 'pincode.write_again',
        }),
        pinCode: pin,
      });
      return Promise.resolve();
    }
    console.log('2 :', pinCode);

    await this.setState({
      informationText: intl.formatMessage({
        id: 'pincode.write_again',
      }),
    });
    await setTimeout(() => {
      this.setState({
        informationText: intl.formatMessage({
          id: 'pincode.set_new',
        }),
        pinCode: null,
      });
      return Promise.resolve();
    }, 1000);
  };

  render() {
    const { currentAccount, intl } = this.props;
    const { informationText, isExistUser } = this.state;
    return (
      <PinCodeScreen
        informationText={informationText}
        setPinCode={this._setPinCode}
        showForgotButton={isExistUser}
        username={currentAccount.name}
        intl={intl}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default injectIntl(connect(mapStateToProps)(PinCodeContainer));
