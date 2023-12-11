import React, { useEffect, useState } from 'react';
import { View, Platform, Keyboard, Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useIntl } from 'react-intl';
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
import { ECENCY_TERMS_URL } from '../../../config/ecencyApi';

// Styles
import styles from './loginStyles';
import { HiveSignerIcon } from '../../../assets/svgs';

const LoginScreen = ({
  initialUsername,
  getAccountsWithUsername,
  navigation,
  handleOnPressLogin,
  handleSignUp,
  isLoading,
}) => {
  const intl = useIntl();
  const [username, setUsername] = useState(initialUsername || '');
  const [password, setPassword] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (initialUsername) {
      _handleUsernameChange(initialUsername);
    }
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const debouncedCheckValidity = debounce((uname) => {
    _checkUsernameIsValid(uname);
  }, 1000);

  useEffect(() => {
    if (username) {
      debouncedCheckValidity(username);

      return () => debouncedCheckValidity.cancel();
    }
  }, [username]);

  const _keyboardDidShow = () => {
    setKeyboardIsOpen(true);
  };

  const _keyboardDidHide = () => {
    setKeyboardIsOpen(false);
  };

  const _handleOnPasswordChange = (value) => {
    setPassword(value);
  };

  const _handleUsernameChange = (username) => {
    const formattedUsername = username.trim().toLowerCase();
    setUsername(formattedUsername);
  };

  const _checkUsernameIsValid = (uname) => {
    getAccountsWithUsername(uname).then((res) => {
      const isValid = res.includes(uname);
      setIsUsernameValid(isValid);
    });
  };

  const _handleOnModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

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
            onChange={_handleUsernameChange}
            placeholder={intl.formatMessage({
              id: 'login.username',
            })}
            isEditable
            type="username"
            isFirstImage
            value={username}
            inputStyle={styles.input}
            onBlur={() => _checkUsernameIsValid(username)}
          />
          <FormInput
            rightIconName="lock"
            leftIconName="close"
            isValid={isUsernameValid}
            onChange={_handleOnPasswordChange}
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
            onPress={() => _handleOnModalToggle()}
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
        handleOnModalClose={_handleOnModalToggle}
        title={intl.formatMessage({
          id: 'login.signin',
        })}
      >
        <HiveSigner handleOnModalClose={_handleOnModalToggle} />
      </Modal>
    </View>
  );
};

export default LoginScreen;
