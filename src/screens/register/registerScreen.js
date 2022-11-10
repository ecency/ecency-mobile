import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  Platform,
  Image,
  Text,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { useIntl } from 'react-intl';
import * as Animatable from 'react-native-animatable';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import RegisterContainer from './registerContainer';

// Internal Components
import { FormInput, InformationArea, MainButton, TextButton } from '../../components';

// Constants
import ROUTES from '../../constants/routeNames';

// Styles
import styles from './registerStyles';

import ESTEEM_LOGO from '../../assets/like_new.png';
import ESTEEM_SMALL_LOGO from '../../assets/ecency_logo_transparent.png';
import getWindowDimensions from '../../utils/getWindowDimensions';
import { ECENCY_TERMS_URL } from '../../config/ecencyApi';

const RegisterScreen = ({ navigation, route }) => {
  const intl = useIntl();
  const [keyboardIsOpen, setKeyboardIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [email, setEmail] = useState('');
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

  const _handleEmailChange = (value) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    setIsEmailValid(re.test(value));
    setEmail(value);
  };

  const _handleUsernameChange = ({ value, getAccountsWithUsername }) => {
    setUsername(value);
    if (!value || value.length <= 2 || value.length >= 16) {
      setIsUsernameValid(false);
      return;
    }
    getAccountsWithUsername(value).then((res) => {
      const isValid = !res.includes(value);
      setIsUsernameValid(isValid);
    });
  };

  const _handleRefUsernameChange = ({ value, getAccountsWithUsername }) => {
    setRefUsername(value);
    if (!value) {
      setIsRefUsernameValid(true);
      return;
    }
    getAccountsWithUsername(value).then((res) => {
      const isValid = res.includes(value);
      setIsRefUsernameValid(isValid);
    });
  };

  return (
    <RegisterContainer>
      {({ getAccountsWithUsername, isLoading, handleOnPressRegister, referredUser }) => (
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.formWrapper}
            keyboardShouldPersistTaps
          >
            <View style={styles.body}>
              <FormInput
                rightIconName="at"
                leftIconName="close"
                iconType="MaterialCommunityIcons"
                isValid={isUsernameValid}
                onChange={(value) => _handleUsernameChange({ value, getAccountsWithUsername })}
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
                onChange={(value) => _handleRefUsernameChange({ value, getAccountsWithUsername })}
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
                onPress={() => handleOnPressRegister({ username, email, refUsername })}
                iconName="person"
                iconColor="white"
                text={intl.formatMessage({
                  id: 'register.button',
                })}
                isDisable={!isUsernameValid || !isRefUsernameValid || !isEmailValid}
                isLoading={isLoading}
                style={styles.mainButton}
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
    </RegisterContainer>
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
