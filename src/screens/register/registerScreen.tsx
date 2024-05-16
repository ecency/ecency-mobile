import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Platform, Text, Keyboard, KeyboardAvoidingView, Alert } from 'react-native';
import { useIntl } from 'react-intl';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { debounce } from 'lodash';
// Internal Components
import { FormInput, InformationArea, LoginHeader, MainButton } from '../../components';

// Constants
import ROUTES from '../../constants/routeNames';

// Styles
import styles from './registerStyles';
import { RegisterAccountModal } from './children/registerAccountModal';
import { ECENCY_TERMS_URL } from '../../config/ecencyApi';
import { lookupAccounts } from '../../providers/hive/dhive';
import { useAppSelector } from '../../hooks';

const RegisterScreen = ({ navigation, route }) => {
  const intl = useIntl();

  const registerAccountModalRef = useRef(null);

  const isConnected = useAppSelector((state) => state.application.isConnected);

  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);
  const [username, setUsername] = useState(route.params?.username ?? '');
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [refUsername, setRefUsername] = useState(route.params?.referredUser ?? '');
  const [isRefUsernameValid, setIsRefUsernameValid] = useState(true);
  const [isUserExist, setIsUserExist] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardIsOpen(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardIsOpen(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    if (registerAccountModalRef.current) {
      const { purchaseOnly, email, username, referredUser } = route.params || {};
      if (email) {
        _handleEmailChange(email);
      }
      if (username) {
        _handleUsernameChange({ value: username });
      }
      if (referredUser) {
        _handleRefUsernameChange({ value: referredUser });
      }
      if (purchaseOnly && email && username) {
        registerAccountModalRef.current.showModal({ purchaseOnly });
      }
    }
  }, [registerAccountModalRef]);

  const _getAccountsWithUsername = async (username) => {
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

  const _handleEmailChange = (value) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    setIsEmailValid(re.test(value));
    setEmail(value);
  };

  const _isValidUsername = (value) => {
    if (!value || value.length <= 2 || value.length >= 16) {
      setUsernameError(intl.formatMessage({ id: 'register.validation.username_length_error' }));
      return false;
    } else {
      return value.split('.').some((item) => {
        if (item.length < 3) {
          setUsernameError(intl.formatMessage({ id: 'register.validation.username_length_error' }));
          return false;
        } else if (!/^[\x00-\x7F]*$/.test(item[0])) {
          setUsernameError(
            intl.formatMessage({ id: 'register.validation.username_no_ascii_first_letter_error' }),
          );
          return false;
        } else if (!/^([a-zA-Z0-9]|-|\.)+$/.test(item)) {
          setUsernameError(
            intl.formatMessage({ id: 'register.validation.username_contains_symbols_error' }),
          );
          return false;
        } else if (item.includes('--')) {
          setUsernameError(
            intl.formatMessage({ id: 'register.validation.username_contains_double_hyphens' }),
          );
          return false;
        } else if (item.includes('_')) {
          setUsernameError(
            intl.formatMessage({ id: 'register.validation.username_contains_underscore' }),
          );
          return false;
        } else {
          return true;
        }
      });
    }
  };

  const _handleUsernameChange = ({ value }) => {
    value = value.toLowerCase();
    setUsername(value);

    if (!_isValidUsername(value)) {
      setIsUserExist(false);
      setIsUsernameValid(false);
      return;
    }

    _getAccountsWithUsername(value).then((res) => {
      const isValid = !res.includes(value);
      if (!isValid) {
        setUsernameError(intl.formatMessage({ id: 'register.validation.username_exists' }));
      }
      setIsUserExist(!isValid);
      setIsUsernameValid(isValid);
    });
  };
  const changeTextDebouncer = useCallback(debounce(_handleUsernameChange, 500), []);

  const _handleRefUsernameChange = ({ value }) => {
    value = value.toLowerCase();
    setRefUsername(value);
    if (!value) {
      setIsRefUsernameValid(true);
      return;
    }
    _getAccountsWithUsername(value).then((res) => {
      const isValid = res.includes(value);
      setIsRefUsernameValid(isValid);
    });
  };

  const _onContinuePress = () => {
    Keyboard.dismiss();
    registerAccountModalRef.current?.showModal();
  };

  return (
    <View style={styles.container}>
      {/* <StatusBar hidden translucent /> */}
      <LoginHeader
        isKeyboardOpen={keyboardIsOpen}
        title={intl.formatMessage({ id: 'register.title' })}
        description={intl.formatMessage({
          id: 'register.title_description',
        })}
        onPress={() => null}
        rightButtonText={intl.formatMessage({
          id: 'login.login',
        })}
        onBackPress={() => {
          navigation.navigate({
            name: ROUTES.DRAWER.MAIN,
          });
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.formWrapper}
        // keyboardShouldPersistTaps="always"
      >
        <View style={styles.body}>
          <FormInput
            rightIconName="at"
            leftIconName="close"
            iconType="MaterialCommunityIcons"
            isValid={isUsernameValid}
            onChange={(value) => changeTextDebouncer({ value })}
            placeholder={intl.formatMessage({
              id: 'register.username',
            })}
            isEditable
            rightInfoIcon
            errorInfo={usernameError}
            type="username"
            isFirstImage={!!isUserExist}
            value={username}
            inputStyle={styles.input}
            onFocus={() => setKeyboardIsOpen(true)}
          />
          <FormInput
            rightIconName="mail"
            leftIconName="close"
            isValid={isEmailValid}
            onChange={_handleEmailChange}
            placeholder={intl.formatMessage({
              id: 'register.mail',
            })}
            isEditable
            type="emailAddress"
            value={email}
            inputStyle={styles.input}
            onFocus={() => setKeyboardIsOpen(true)}
          />
          <FormInput
            rightIconName="person"
            leftIconName="close"
            isValid={isRefUsernameValid}
            onChange={(value) => _handleRefUsernameChange({ value })}
            placeholder={intl.formatMessage({
              id: 'register.ref_user',
            })}
            isEditable
            type="username"
            isFirstImage
            value={refUsername}
            inputStyle={styles.input}
            onFocus={() => setKeyboardIsOpen(true)}
          />
          <InformationArea
            description={intl.formatMessage({ id: 'register.form_description' })}
            iconName="information-circle-outline"
            link={ECENCY_TERMS_URL}
          />
        </View>
        <View style={styles.footerButtons}>
          <MainButton
            onPress={_onContinuePress}
            iconName="arrow-forward"
            iconColor="white"
            iconPosition="right"
            text={intl.formatMessage({ id: 'alert.continue' })}
            isDisable={
              !isUsernameValid || !isRefUsernameValid || !isEmailValid || !username || !email
            }
            style={styles.mainButton}
            height={50}
            wrapperStyle={styles.mainBtnWrapper}
            bodyWrapperStyle={styles.mainBtnBodyWrapper}
          />
          <View style={styles.loginBtnRow}>
            <Text style={styles.doYouHaveTxt}>
              {intl.formatMessage({
                id: 'register.have_account_text',
              })}
            </Text>
            <Text
              style={styles.loginBtnTxt}
              onPress={() => {
                navigation.replace(ROUTES.SCREENS.LOGIN);
              }}
            >
              {intl.formatMessage({
                id: 'register.login_here',
              })}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
      <RegisterAccountModal
        ref={registerAccountModalRef}
        username={username}
        email={email}
        refUsername={refUsername}
      />
    </View>
  );
};

export default gestureHandlerRootHOC(RegisterScreen);
