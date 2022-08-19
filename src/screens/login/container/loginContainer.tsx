import React, { PureComponent } from 'react';
import { Alert, Platform } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import Config from 'react-native-config';
import messaging from '@react-native-firebase/messaging';

// Services and Actions
import { login, loginWithSC2 } from '../../../providers/hive/auth';
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
import { setInitPosts, setFeedPosts } from '../../../redux/actions/postsAction';
import { setPushTokenSaved, setExistUser } from '../../../realm/realm';
import { setPushToken } from '../../../providers/ecency/ecency';
import { decodeBase64, encryptKey } from '../../../utils/crypto';

// Middleware

// Constants
import ROUTES from '../../../constants/routeNames';

// Utilities

// Component
import LoginScreen from '../screen/loginScreen';
import persistAccountGenerator from '../../../utils/persistAccountGenerator';
import { fetchSubscribedCommunities } from '../../../redux/actions/communitiesAction';
import { showActionModal } from '../../../redux/actions/uiAction';
import { UserAvatar } from '../../../components';

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
  componentDidMount(){
    //TOOD: migrate getParam to routes.state.param after nt/navigaiton merge

    const {navigation} = this.props;
    const username = navigation.getParam('username', '')
    const code:string = navigation.getParam('code', '')
    
    if(username && code){
      this._confirmCodeLogin(username, code);
    }
  }

  // Component Functions
  _confirmCodeLogin = (username, code) => {
    const {dispatch, intl} = this.props;

    try{
      //check accessCode formatting and compare expiry
      const dataStr = decodeBase64(code);
      if(!dataStr){
        throw new Error('login.deep_login_malformed_url');
      }
  
      let data = JSON.parse(dataStr.slice(0, dataStr.lastIndexOf('}') + 1));
      
      const curTimestamp = new Date().getTime();
      const expiryTimestamp = data && data.timestamp && ((data.timestamp * 1000) + 604800000) //add 7 day (604800000ms) expiry
  
      if(!expiryTimestamp || expiryTimestamp < curTimestamp){
        throw new Error('login.deep_login_url_expired');
      }
  
      //Everything is set, show login confirmation
      dispatch(showActionModal({
        title: intl.formatMessage({id: 'login.deep_login_alert_title'}, {username}),
        body: intl.formatMessage({id: 'login.deep_login_alert_body'}),
        buttons: [
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            onPress: () => console.log('Cancel'),
            style:'cancel'
          },
          {
            text: intl.formatMessage({ id: 'alert.confirm' }),
            onPress: ()=> this._loginWithCode(code),
          },
        ],
        headerContent: <UserAvatar username={username} size='xl' />,
      }))
    } catch(err){
      console.warn("Failed to login using code", err)
      Alert.alert(
        intl.formatMessage({id: 'alert.fail'}),
        intl.formatMessage({id: err.message})
      )
    }
    
  }



  _loginWithCode = (code) => {
    const {dispatch, isPinCodeOpen, navigation, intl} = this.props;
    this.setState({ isLoading: true });
    loginWithSC2(code)
    .then((result) => {
      if (result) {
        const persistAccountData = persistAccountGenerator(result);

        dispatch(updateCurrentAccount({ ...result }));
        dispatch(fetchSubscribedCommunities(result.username));
        dispatch(addOtherAccount({ ...persistAccountData }));
        dispatch(loginAction(true));

        if (isPinCodeOpen) {
          dispatch(
            openPinCodeModal({
              accessToken: result.accessToken,
              navigateTo: ROUTES.DRAWER.MAIN,
            }),
          );
        } else {
          navigation.navigate({
            routeName: ROUTES.DRAWER.MAIN,
            params: { accessToken: result.accessToken },
          });
        }
      } else {
        // TODO: Error alert (Toast Message)
      }
      this.setState({ isLoading: false });
    })
    .catch((error) => {
      this.setState({ isLoading: false });
      Alert.alert(
        'Error',
        intl.formatMessage({ id:
        error.message,
        }),
      );
      // TODO: return
    });
  }

  _handleOnPressLogin = (username, password) => {
    const { dispatch, intl, isPinCodeOpen, navigation } = this.props;

    this.setState({ isLoading: true });

    login(username, password)
      .then((result) => {
        if (result) {
          const persistAccountData = persistAccountGenerator(result);

          dispatch(updateCurrentAccount({ ...result }));
          dispatch(fetchSubscribedCommunities(username));
          dispatch(addOtherAccount({ ...persistAccountData }));
          dispatch(loginAction(true));
          dispatch(setInitPosts([]));
          dispatch(setFeedPosts([]));

          userActivity(20);
          setExistUser(true);
          this._setPushToken(result.name);
          const encryptedPin = encryptKey(Config.DEFAULT_PIN, Config.PIN_KEY);
          dispatch(setPinCode(encryptedPin));

          if (isPinCodeOpen) {
            dispatch(openPinCodeModal({ navigateTo: ROUTES.DRAWER.MAIN }));
          } else {
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
    return (
      <LoginScreen
        handleOnPressLogin={this._handleOnPressLogin}
        getAccountsWithUsername={this._getAccountsWithUsername}
        handleSignUp={this._handleSignUp}
        isLoading={isLoading}
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
