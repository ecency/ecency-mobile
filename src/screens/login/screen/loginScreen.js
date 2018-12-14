import React, { Component } from 'react';
import {
  View, Linking, StatusBar, Platform, Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ScrollableTabView from '@esteemapp/react-native-scrollable-tab-view';
import { injectIntl } from 'react-intl';

// Actions
import {
  failedAccount,
  addOtherAccount,
  updateCurrentAccount,
} from '../../../redux/actions/accountAction';
import { login as loginAction, openPinCodeModal } from '../../../redux/actions/applicationActions';

// Internal Components
import { FormInput } from '../../../components/formInput';
import { InformationArea } from '../../../components/informationArea';
import { Login } from '../../../providers/steem/auth';
import { LoginHeader } from '../../../components/loginHeader';
import { MainButton } from '../../../components/mainButton';
import { TabBar } from '../../../components/tabBar';
import { TextButton } from '../../../components/buttons';
import { lookupAccounts } from '../../../providers/steem/dsteem';
import STEEM_CONNECT_LOGO from '../../../assets/steem_connect.png';
import { Modal } from '../../../components';
import SteemConnect from '../../steem-connect/steemConnect';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Styles
import styles from './loginStyles';

class LoginScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      isLoading: false,
      isUsernameValid: true,
      keyboardIsOpen: false,
      isModalOpen: false,
    };
  }

  _handleOnPressLogin = () => {
    const { dispatch, setPinCodeState } = this.props;
    const { password, username } = this.state;

    this.setState({ isLoading: true });

    Login(username, password)
      .then((result) => {
        if (result) {
          dispatch(updateCurrentAccount({ ...result }));
          dispatch(addOtherAccount({ username: result.name }));
          dispatch(openPinCodeModal());
          setPinCodeState({ navigateTo: ROUTES.DRAWER.MAIN });
          dispatch(loginAction(true));
        }
      })
      .catch((err) => {
        // TODO: Change with global error handling
        Alert.alert('Error', err.message);
        dispatch(failedAccount(err.message));
        this.setState({ isLoading: false });
      });
  };

  _handleUsernameChange = async (username) => {
    await this.setState({ username });
    const validUsers = await lookupAccounts(username);
    const isValid = validUsers.includes(username);

    this.setState({ isUsernameValid: isValid });
  };

  _handleOnPasswordChange = (value) => {
    this.setState({ password: value });
  };

  _handleSignUp = () => {
    Linking.openURL('https://signup.steemit.com/?ref=esteem').catch(err => alert('An error occurred', err));
  };


  _handleOnModalToggle = () => {
    const { isModalOpen } = this.state;
    this.setState({ isModalOpen: !isModalOpen });
  }

  render() {
    const { navigation, intl, setPinCodeState } = this.props;
    const {
      isLoading, username, isUsernameValid, keyboardIsOpen, password, isModalOpen,
    } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar hidden translucent />
        <LoginHeader
          isKeyboardOpen={keyboardIsOpen}
          title={intl.formatMessage({
            id: 'login.signin',
          })}
          description={intl.formatMessage({
            id: 'login.signin_title',
          })}
          onPress={() => this._handleSignUp()}
          rightButtonText={intl.formatMessage({
            id: 'login.signup',
          })}
        />
        <ScrollableTabView
          locked={isLoading}
          style={styles.tabView}
          renderTabBar={() => (
            <TabBar
              style={styles.tabbar}
              tabUnderlineDefaultWidth={100} // default containerWidth / (numberOfTabs * 4)
              tabUnderlineScaleX={2} // default 3
              activeColor="#357ce6"
              inactiveColor="#222"
            />
          )}
        >
          <View
            tabLabel={intl.formatMessage({
              id: 'login.signin',
            })}
            style={styles.tabbarItem}
          >
            <KeyboardAwareScrollView
              onKeyboardWillShow={() => this.setState({ keyboardIsOpen: true })}
              onKeyboardWillHide={() => this.setState({ keyboardIsOpen: false })}
              enableAutoAutomaticScroll={Platform.OS === 'ios'}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <FormInput
                rightIconName="md-at"
                leftIconName="md-close-circle"
                isValid={isUsernameValid}
                onChange={value => this._handleUsernameChange(value)}
                placeholder={intl.formatMessage({
                  id: 'login.username',
                })}
                isEditable
                type="username"
                isFirstImage
                value={username}
              />
              <FormInput
                rightIconName="md-lock"
                leftIconName="md-close-circle"
                isValid={isUsernameValid}
                onChange={value => this._handleOnPasswordChange(value)}
                placeholder={intl.formatMessage({
                  id: 'login.password',
                })}
                isEditable
                secureTextEntry
                type="password"
              />
              <InformationArea
                description={intl.formatMessage({
                  id: 'login.description',
                })}
                iconName="ios-information-circle-outline"
              />
            </KeyboardAwareScrollView>

            <View style={styles.footerButtons}>
              <TextButton
                style={styles.cancelButton}
                onPress={() => navigation.navigate(ROUTES.DRAWER.MAIN)}
                text={intl.formatMessage({
                  id: 'login.cancel',
                })}
              />
              <MainButton
                onPress={this._handleOnPressLogin}
                iconName="md-person"
                iconColor="white"
                text={intl.formatMessage({
                  id: 'login.login',
                })}
                isDisable={!isUsernameValid || password.length < 2 || username.length < 2}
                isLoading={isLoading}
              />
            </View>
          </View>
          <View tabLabel="SteemConnect" style={styles.tabbarItem}>
            <InformationArea
              description={intl.formatMessage({
                id: 'login.steemconnect_description',
              })}
              iconName="ios-information-circle-outline"
            />
            <MainButton
              wrapperStyle={styles.mainButtonWrapper}
              onPress={() => this._handleOnModalToggle()}
              iconName="md-person"
              source={STEEM_CONNECT_LOGO}
              text="steem"
              secondText="connect"
            />
          </View>
        </ScrollableTabView>
        <Modal
          isOpen={isModalOpen}
          isFullScreen
          isCloseButton
          handleOnModalClose={this._handleOnModalToggle}
          title="Steemconnect Login"
        >
          <SteemConnect handleOnModalClose={this._handleOnModalToggle} setPinCodeState={setPinCodeState} />
        </Modal>
      </View>
    );
  }
}

export default injectIntl(LoginScreen);
