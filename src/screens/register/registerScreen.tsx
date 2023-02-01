import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StatusBar,
  Platform,
  Image,
  Text,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useIntl } from 'react-intl';
import * as Animatable from 'react-native-animatable';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

// Internal Components
import { FormInput, InformationArea, MainButton, TextButton } from '../../components';

// Constants
import ROUTES from '../../constants/routeNames';

// Styles
import styles from './registerStyles';

import ESTEEM_LOGO from '../../assets/like_new.png';
import ESTEEM_SMALL_LOGO from '../../assets/ecency_logo_transparent.png';
import getWindowDimensions from '../../utils/getWindowDimensions';
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
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [refUsername, setRefUsername] = useState(route.params?.referredUser ?? '');
  const [isRefUsernameValid, setIsRefUsernameValid] = useState(true);

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

  const _handleUsernameChange = ({ value }) => {
    value = value.toLowerCase();
    setUsername(value);
    if (!value || value.length <= 2 || value.length >= 16) {
      setIsUsernameValid(false);
      return;
    }

    _getAccountsWithUsername(value).then((res) => {
      const isValid = !res.includes(value);
      setIsUsernameValid(isValid);
    });
  };

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
    <SafeAreaView style={styles.container}>
      <StatusBar hidden translucent />
      <View style={styles.headerRow}>
        <Image style={styles.logo} source={ESTEEM_SMALL_LOGO} />
        <View style={styles.headerButton}>
          <TextButton
            onPress={() => {
              navigation.replace(ROUTES.SCREENS.LOGIN);
            }}
            text="LOGIN"
            textStyle={{ color: '#357ce6' }}
          />
        </View>
      </View>
      <Animatable.View
        animation={keyboardIsOpen ? hideAnimation : showAnimation}
        delay={0}
        duration={300}
      >
        <View style={styles.header}>
          <View style={styles.titleText}>
            <Text style={styles.title}>{intl.formatMessage({ id: 'register.title' })}</Text>
            <Text style={styles.description}>
              {intl.formatMessage({ id: 'register.title_description' })}
            </Text>
          </View>
          <Image style={styles.mascot} source={ESTEEM_LOGO} />
        </View>
      </Animatable.View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.formWrapper}
        keyboardShouldPersistTaps
      >
        <View style={styles.body}>
          <FormInput
            rightIconName="at"
            leftIconName="close"
            iconType="MaterialCommunityIcons"
            isValid={isUsernameValid}
            onChange={(value) => _handleUsernameChange({ value })}
            placeholder={intl.formatMessage({
              id: 'register.username',
            })}
            isEditable
            type="username"
            isFirstImage
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
            iconName="ios-information-circle-outline"
            link={ECENCY_TERMS_URL}
          />
        </View>
        <View style={styles.footerButtons}>
          <TextButton
            style={styles.cancelButton}
            onPress={() => {
              navigation.navigate({
                name: ROUTES.DRAWER.MAIN,
              });
            }}
            text={intl.formatMessage({
              id: 'login.cancel',
            })}
          />
          <MainButton
            onPress={_onContinuePress}
            iconName="arrow-forward"
            iconColor="white"
            iconPosition="right"
            text={intl.formatMessage({ id: 'alert.continue' })}
            isDisable={!isUsernameValid || !isRefUsernameValid || !isEmailValid}
            style={styles.mainButton}
          />
        </View>
      </KeyboardAvoidingView>
      <RegisterAccountModal
        ref={registerAccountModalRef}
        username={username}
        email={email}
        refUsername={refUsername}
      />
    </SafeAreaView>
  );
};

const { height } = getWindowDimensions();
const bodyHeight = height / 5;
const showAnimation = {
  from: {
    opacity: 0,
    height: 0,
  },
  to: {
    opacity: 1,
    height: bodyHeight,
  },
};

const hideAnimation = {
  from: {
    opacity: 1,
    height: bodyHeight,
  },
  to: {
    opacity: 0,
    height: 0,
  },
};
export default gestureHandlerRootHOC(RegisterScreen);
