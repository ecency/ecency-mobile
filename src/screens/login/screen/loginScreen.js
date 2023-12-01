import React, { PureComponent } from 'react';
import { View, Platform, Keyboard, Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { injectIntl } from 'react-intl';
import { debounce } from 'lodash';

// Actions
import HiveSigner from '../../steem-connect/hiveSigner';

// Internal Components
import {
  FormInput,
  InformationArea,
  LoginHeader,
  MainButton,
  Modal,
  OrDivider,
} from '../../../components';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Styles
import styles from './loginStyles';
import { ECENCY_TERMS_URL } from '../../../config/ecencyApi';
import { HiveSignerIcon } from '../../../assets/svgs';

class LoginScreen extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      username: props.initialUsername || '',
      password: '',
      isUsernameValid: true,
      keyboardIsOpen: false,
      isModalOpen: false,
    };
  }

  componentDidMount() {
    if (this.props.initialUsername) {
      this._handleUsernameChange(this.props.initialUsername);
    }
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _handleOnPasswordChange = (value) => {
    this.setState({ password: value });
  };

  _handleUsernameChange = (username) => {
    const { getAccountsWithUsername } = this.props;
    const formattedUsername = username.trim().toLowerCase();
    this.setState({ username: formattedUsername });

    getAccountsWithUsername(formattedUsername).then((res) => {
      const isValid = res.includes(formattedUsername);

      this.setState({ isUsernameValid: isValid });
    });
  };

  _handleOnModalToggle = () => {
    const { isModalOpen } = this.state;
    this.setState({ isModalOpen: !isModalOpen });
  };

  UNSAFE_componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () =>
      this.setState({ keyboardIsOpen: true }),
    );
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () =>
      this.setState({ keyboardIsOpen: false }),
    );
  }

  render() {
    const { navigation, intl, handleOnPressLogin, handleSignUp, isLoading } = this.props;
    const { username, isUsernameValid, keyboardIsOpen, password, isModalOpen } = this.state;

    const _renderHiveicon = () => (
      <View style={styles.hsLoginBtnIconStyle}>
        <HiveSignerIcon />
      </View>
    );

    return (
      <View style={styles.container}>
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
          onBackPress={() => {
            navigation.navigate({
              name: ROUTES.DRAWER.MAIN,
            });
          }}
        />

        <View
          tabLabel={intl.formatMessage({
            id: 'login.signin',
          })}
          style={styles.tabbarItem}
        >
          <KeyboardAwareScrollView
            enableAutoAutomaticScroll={Platform.OS === 'ios'}
            contentContainerStyle={styles.formWrapper}
            enableOnAndroid={true}
          >
            <FormInput
              rightIconName="at"
              leftIconName="close"
              iconType="MaterialCommunityIcons"
              isValid={isUsernameValid}
              onChange={debounce(this._handleUsernameChange, 1000)}
              placeholder={intl.formatMessage({
                id: 'login.username',
              })}
              isEditable
              type="username"
              isFirstImage
              value={username}
              inputStyle={styles.input}
            />
            <FormInput
              rightIconName="lock"
              leftIconName="close"
              isValid={isUsernameValid}
              onChange={(value) => this._handleOnPasswordChange(value)}
              placeholder={intl.formatMessage({
                id: 'login.password',
              })}
              isEditable
              secureTextEntry
              type="password"
              numberOfLines={1}
              value={password}
              inputStyle={styles.input}
            />
            <InformationArea
              description={intl.formatMessage({
                id: 'login.description',
              })}
              link={ECENCY_TERMS_URL}
              iconName="ios-information-circle-outline"
            />
            <MainButton
              onPress={() => handleOnPressLogin(username, password)}
              iconName="person"
              iconColor="white"
              text={intl.formatMessage({
                id: 'login.login',
              })}
              textStyle={styles.mainBtnText}
              isDisable={!isUsernameValid || password.length < 2 || username.length < 2}
              isLoading={isLoading}
              wrapperStyle={styles.loginBtnWrapper}
              bodyWrapperStyle={styles.loginBtnBodyWrapper}
              height={50}
              iconStyle={styles.loginBtnIconStyle}
            />
            <OrDivider />
            <MainButton
              onPress={() => this._handleOnModalToggle()}
              renderIcon={_renderHiveicon()}
              text={intl.formatMessage({
                id: 'login.login_with_hs',
              })}
              textStyle={styles.hsLoginBtnText}
              wrapperStyle={styles.loginBtnWrapper}
              bodyWrapperStyle={styles.loginBtnBodyWrapper}
              height={48}
              style={styles.hsLoginBtnStyle}
            />
          </KeyboardAwareScrollView>
          <View style={styles.footerButtons}>
            <Text style={styles.noAccountText}>
              {intl.formatMessage({
                id: 'login.no_account_text',
              })}
            </Text>
            <Text style={styles.signUpNowText} onPress={() => handleSignUp()}>
              {intl.formatMessage({
                id: 'login.signup_now',
              })}
            </Text>
          </View>
        </View>
        <Modal
          isOpen={isModalOpen}
          isFullScreen
          isCloseButton
          handleOnModalClose={this._handleOnModalToggle}
          title={intl.formatMessage({
            id: 'login.signin',
          })}
        >
          <HiveSigner handleOnModalClose={this._handleOnModalToggle} />
        </Modal>
      </View>
    );
  }
}

export default injectIntl(LoginScreen);
