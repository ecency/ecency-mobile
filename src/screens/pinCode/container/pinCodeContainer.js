import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import Config from 'react-native-config';
import get from 'lodash/get';

// Actions & Services
import { navigate } from '../../../navigation/service';
import { setUserDataWithPinCode, verifyPinCode, updatePinCode } from '../../../providers/hive/auth';
import {
  closePinCodeModal,
  isPinCodeOpen,
  login,
  logoutDone,
  setPinCode as savePinCode,
} from '../../../redux/actions/applicationActions';
import {
  getExistUser,
  setExistUser,
  getUserDataWithUsername,
  removeAllUserData,
  removePinCode,
  setAuthStatus,
  setPinCodeOpen,
} from '../../../realm/realm';
import { updateCurrentAccount, removeOtherAccount } from '../../../redux/actions/accountAction';
import { getUser } from '../../../providers/hive/dhive';

// Utils
import { encryptKey, decryptKey } from '../../../utils/crypto';

// Component
import PinCodeScreen from '../screen/pinCodeScreen';

class PinCodeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExistUser: null,
      informationText: '',
      newPinCode: null,
      isOldPinVerified: get(props.pinCodeParams, 'isOldPinVerified', false),
      oldPinCode: get(props.pinCodeParams, 'oldPinCode', null),
      failedAttempts: 0,
    };
  }

  // TODO: if check for decide to set to pin or verify to pin page
  // TODO: these text should move to view!
  componentDidMount() {
    this._getDataFromStorage().then(() => {
      const { intl } = this.props;
      const { isOldPinVerified } = this.state;

      if (!isOldPinVerified) {
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

  _getDataFromStorage = () =>
    new Promise((resolve) => {
      getExistUser().then((isExistUser) => {
        this.setState(
          {
            isExistUser,
          },
          resolve,
        );
      });
    });

  _resetPinCode = (pin) =>
    new Promise((resolve, reject) => {
      const {
        currentAccount,
        dispatch,
        pinCodeParams: { navigateTo, navigateParams, accessToken, callback },
        intl,
      } = this.props;
      const { isOldPinVerified, oldPinCode, newPinCode } = this.state;

      const pinData = {
        pinCode: pin,
        password: currentAccount ? currentAccount.password : '',
        username: currentAccount ? currentAccount.name : '',
        accessToken,
        oldPinCode,
      };

      //if old pin already verified, check new pin setup conditions.
      if (isOldPinVerified) {
        //if newPin already exist and pin is a valid pin, compare and set new pin
        if (pin !== undefined && pin === newPinCode) {
          updatePinCode(pinData).then((response) => {
            const _currentAccount = currentAccount;
            _currentAccount.local = response;

            dispatch(updateCurrentAccount({ ..._currentAccount }));
            this._savePinCode(pin);

            if (callback) {
              callback(pin, oldPinCode);
            }
            dispatch(closePinCodeModal());
            if (navigateTo) {
              navigate({
                routeName: navigateTo,
                params: navigateParams,
              });
            }
            resolve();
          });
        }

        // if newPin code exists and above case failed, that means pins did not match
        // warn user about it and do nothing
        else if (newPinCode) {
          Alert.alert(
            intl.formatMessage({
              id: 'alert.warning',
            }),
            intl.formatMessage({
              id: 'pincode.pin_not_matched',
            }),
          );
          resolve();
        }

        //if newPinCode do yet exist, save it in state and prompt user to reneter pin.
        else {
          this.setState({
            informationText: intl.formatMessage({
              id: 'pincode.write_again',
            }),
            newPinCode: pin,
          });
          resolve();
        }
      }

      // if old pin code is not yet verified attempt to verify code
      else {
        verifyPinCode(pinData)
          .then(() => {
            this.setState({ isOldPinVerified: true });
            this.setState({
              informationText: intl.formatMessage({
                id: 'pincode.set_new',
              }),
              newPinCode: null,
              oldPinCode: pin,
            });
            resolve();
          })
          .catch((err) => {
            console.warn('Failed to verify pin code', err);
            Alert.alert(
              intl.formatMessage({
                id: 'alert.warning',
              }),
              intl.formatMessage({
                id: err.message,
              }),
            );
            reject(err);
          });
      }
    });

  _setFirstPinCode = (pin) =>
    new Promise((resolve) => {
      const {
        currentAccount,
        dispatch,
        pinCodeParams: { navigateTo, navigateParams, accessToken, callback },
      } = this.props;
      const { oldPinCode } = this.state;

      const pinData = {
        pinCode: pin,
        password: currentAccount ? currentAccount.password : '',
        username: currentAccount ? currentAccount.name : '',
        accessToken,
      };
      setUserDataWithPinCode(pinData).then((response) => {
        getUser(currentAccount.name).then((user) => {
          const _currentAccount = user;
          _currentAccount.local = response;

          dispatch(updateCurrentAccount({ ..._currentAccount }));

          setExistUser(true).then(() => {
            this._savePinCode(pin);
            if (callback) {
              callback(pin, oldPinCode);
            }
            dispatch(closePinCodeModal());
            if (navigateTo) {
              navigate({
                routeName: navigateTo,
                params: navigateParams,
              });
            }
            resolve();
          });
        });
      });
    });

  _verifyPinCode = (pin) =>
    new Promise((resolve, reject) => {
      const {
        currentAccount,
        dispatch,
        pinCodeParams: { navigateTo, navigateParams, accessToken, callback },
      } = this.props;
      const { oldPinCode } = this.state;

      // If the user is exist, we are just checking to pin and navigating to feed screen
      const pinData = {
        pinCode: pin,
        password: currentAccount ? currentAccount.password : '',
        username: currentAccount ? currentAccount.name : '',
        accessToken,
      };
      verifyPinCode(pinData)
        .then(() => {
          this._savePinCode(pin);
          getUserDataWithUsername(currentAccount.name).then((realmData) => {
            const _currentAccount = currentAccount;
            _currentAccount.username = _currentAccount.name;
            [_currentAccount.local] = realmData;
            dispatch(updateCurrentAccount({ ..._currentAccount }));
            dispatch(closePinCodeModal());

            //on successful code verification run requested operation passed as props
            if (callback) {
              callback(pin, oldPinCode);
            }
            if (navigateTo) {
              navigate({
                routeName: navigateTo,
                params: navigateParams,
              });
            }
            resolve();
          });
        })
        .catch((err) => {
          console.warn('code verification for login failed: ', err);
          reject(err);
        });
    });

  _savePinCode = (pin) => {
    const { dispatch } = this.props;
    const encryptedPin = encryptKey(pin, Config.PIN_KEY);
    dispatch(savePinCode(encryptedPin));
  };

  _forgotPinCode = async () => {
    const { otherAccounts, dispatch } = this.props;

    await removeAllUserData()
      .then(async () => {
        dispatch(updateCurrentAccount({}));
        dispatch(login(false));
        removePinCode();
        setAuthStatus({ isLoggedIn: false });
        setExistUser(false);
        if (otherAccounts.length > 0) {
          otherAccounts.map((item) => dispatch(removeOtherAccount(item.username)));
        }
        dispatch(logoutDone());
        dispatch(closePinCodeModal());
        dispatch(isPinCodeOpen(false));
        setPinCodeOpen(false);
      })
      .catch((err) => {
        console.warn('Failed to remove user data', err);
      });
  };

  _handleFailedAttempt = (error) => {
    console.warn('Failed to set pin: ', error);
    const { intl } = this.props;
    const { failedAttempts } = this.state;
    //increment failed attempt
    const totalAttempts = failedAttempts + 1;

    if (totalAttempts < 3) {
      //shwo failure alert box
      Alert.alert(
        intl.formatMessage({
          id: 'alert.warning',
        }),
        intl.formatMessage({
          id: error.message,
        }),
      );

      let infoMessage = intl.formatMessage({
        id: 'pincode.enter_text',
      });
      infoMessage += `, ${totalAttempts} ${intl.formatMessage({ id: 'pincode.attempts_postfix' })}`;
      if (totalAttempts > 1) {
        infoMessage += `\n${intl.formatMessage({ id: 'pincode.message_reset_warning' })}`;
      }
      this.setState({
        failedAttempts: totalAttempts,
        informationText: infoMessage,
      });

      return false;
    } else {
      //wipe user data
      this._forgotPinCode();
      return true;
    }
  };

  _setPinCode = async (pin, isReset) => {
    const { intl, currentAccount, applicationPinCode } = this.props;
    const { isExistUser } = this.state;

    try {
      const realmData = await getUserDataWithUsername(currentAccount.name);
      const userData = realmData[0];

      // check if reset routine is triggered by user, reroute code to reset hanlder
      if (isReset) {
        await this._resetPinCode(pin);
        return true;
      }

      //user is logged in and is not reset routine...
      if (isExistUser) {
        if (!userData.accessToken && !userData.masterKey && applicationPinCode) {
          const verifiedPin = decryptKey(applicationPinCode, Config.PIN_KEY);
          if (verifiedPin === pin) {
            await this._setFirstPinCode(pin);
          } else {
            Alert.alert(
              intl.formatMessage({
                id: 'alert.warning',
              }),
              intl.formatMessage({
                id: 'alert.invalid_pincode',
              }),
            );
          }
        } else {
          await this._verifyPinCode(pin);
        }
        return true;
      }

      //means this is not reset routine and user do not exist
      //only possible option left is user logging int,
      //verifyPinCode then
      else {
        await this._verifyPinCode(pin);
        return true;
      }
    } catch (error) {
      return this._handleFailedAttempt(error);
    }
  };

  _handleForgotButton = () => {
    const { intl } = this.props;

    Alert.alert(
      intl.formatMessage({
        id: 'alert.warning',
      }),
      intl.formatMessage({
        id: 'alert.clear_user_alert',
      }),
      [
        { text: intl.formatMessage({ id: 'alert.clear' }), onPress: () => this._forgotPinCode() },
        { text: intl.formatMessage({ id: 'alert.cancel' }), style: 'destructive' },
      ],
    );
  };

  render() {
    const {
      currentAccount,
      intl,
      pinCodeParams: { isReset },
    } = this.props;
    const { informationText, isOldPinVerified, isExistUser } = this.state;

    return (
      <PinCodeScreen
        informationText={informationText}
        setPinCode={(pin) => this._setPinCode(pin, isReset)}
        showForgotButton={!isOldPinVerified}
        username={currentAccount.name}
        intl={intl}
        handleForgotButton={() => this._handleForgotButton()}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  applicationPinCode: state.application.pin,
  otherAccounts: state.account.otherAccounts,
  pinCodeParams: state.application.pinCodeNavigation,
});

export default injectIntl(connect(mapStateToProps)(PinCodeContainer));
