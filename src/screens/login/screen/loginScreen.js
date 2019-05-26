import React, { PureComponent } from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { injectIntl } from 'react-intl';

// Actions
import SteemConnect from '../../steem-connect/steemConnect';

// Internal Components
import { FormInput } from '../../../components/formInput';
import { InformationArea } from '../../../components/informationArea';
import { LoginHeader } from '../../../components/loginHeader';
import { MainButton } from '../../../components/mainButton';
import { Modal } from '../../../components';
import { TabBar } from '../../../components/tabBar';
import { TextButton } from '../../../components/buttons';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Styles
import styles from './loginStyles';
import globalStyles from '../../../globalStyles';

import STEEM_CONNECT_LOGO from '../../../assets/steem_connect.png';

class LoginScreen extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      isUsernameValid: true,
      keyboardIsOpen: false,
      isModalOpen: false,
    };
  }

  _handleOnPasswordChange = value => {
    this.setState({ password: value });
  };

  _handleUsernameChange = username => {
    const { getAccountsWithUsername } = this.props;

    this.setState({ username });

    getAccountsWithUsername(username).then(res => {
      const isValid = res.includes(username);

      this.setState({ isUsernameValid: isValid });
    });
  };

  _handleOnModalToggle = () => {
    const { isModalOpen } = this.state;
    this.setState({ isModalOpen: !isModalOpen });
  };

  render() {
    const { navigation, intl, handleOnPressLogin, handleSignUp, isLoading } = this.props;
    const { username, isUsernameValid, keyboardIsOpen, password, isModalOpen } = this.state;

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
          onPress={() => handleSignUp()}
          rightButtonText={intl.formatMessage({
            id: 'login.signup',
          })}
        />
        <ScrollableTabView
          locked={isLoading}
          style={globalStyles.tabView}
          renderTabBar={() => (
            <TabBar
              style={styles.tabbar}
              tabUnderlineDefaultWidth={100}
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
                rightIconName="at"
                leftIconName="close"
                iconType="MaterialCommunityIcons"
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
                rightIconName="lock"
                leftIconName="close"
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
                onPress={() => handleOnPressLogin(username, password)}
                iconName="person"
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
                id: 'login.steemconnect_fee_description',
              })}
              iconName="ios-information-circle-outline"
              bold
            />
            <InformationArea
              description={intl.formatMessage({
                id: 'login.steemconnect_description',
              })}
              iconName="ios-information-circle-outline"
            />
            <MainButton
              wrapperStyle={styles.mainButtonWrapper}
              onPress={() => this._handleOnModalToggle()}
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
          <SteemConnect handleOnModalClose={this._handleOnModalToggle} />
        </Modal>
      </View>
    );
  }
}

export default injectIntl(LoginScreen);
