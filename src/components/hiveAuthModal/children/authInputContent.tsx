import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { debounce } from 'lodash';
import Animated, { FadeOut, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import styles from '../styles/hiveAuthModal.styles';
import { lookupAccounts } from '../../../providers/hive/dhive';
import { FormInput, MainButton } from '../..';
import HIVE_AUTH_ICON from '../../../assets/HiveAuth_logo.png';

interface AuthInputContentProps {
  initUsername?: string;
  handleAuthRequest: (username: string) => void;
}

export const AuthInputContent = ({ initUsername, handleAuthRequest }: AuthInputContentProps) => {
  const intl = useIntl();

  const [username, setUsername] = useState(initUsername || '');
  const [isUsernameValid, setIsUsernameValid] = useState(false);

  const debouncedCheckValidity = debounce((uname: string) => {
    _checkUsernameIsValid(uname);
  }, 500);

  useEffect(() => {
    if (initUsername) {
      setUsername(initUsername);
    }
  }, [initUsername]);

  useEffect(() => {
    debouncedCheckValidity(username);
    return () => debouncedCheckValidity.cancel();
  }, [username]);

  const _handleUsernameChange = (username: string) => {
    const formattedUsername = username.trim().toLowerCase();
    setUsername(formattedUsername);
  };

  const _checkUsernameIsValid = async (uname: string) => {
    try {
      const accts = await lookupAccounts(uname);
      const isValid = accts.includes(uname);
      setIsUsernameValid(isValid);
    } catch (err) {
      setIsUsernameValid(false);
    }
  };

  const onSignInPress = () => {
    if (handleAuthRequest) {
      handleAuthRequest(username);
    }
  };

  return (
    <Animated.View style={styles.authInputContent} exiting={FadeOut}>
      <Animated.View style={styles.authInputWrapper} layout={LinearTransition}>
        <FormInput
          rightIconName="at"
          leftIconName="close"
          iconType="MaterialCommunityIcons"
          isValid={!username || isUsernameValid}
          onChange={_handleUsernameChange}
          placeholder={intl.formatMessage({
            id: 'login.username',
          })}
          isEditable
          type="username"
          isFirstImage
          value={username}
          inputStyle={styles.input}
          wrapperStyle={styles.inputWrapper}
          onBlur={() => _checkUsernameIsValid(username)}
        />
      </Animated.View>

      {isUsernameValid && (
        <Animated.View entering={ZoomIn} exiting={ZoomOut}>
          <MainButton
            text={intl.formatMessage({ id: 'login.signin_with_hiveauth' })}
            secondText=""
            textStyle={styles.loginBtnText}
            style={styles.loginBtnWrapper}
            onPress={onSignInPress}
            source={HIVE_AUTH_ICON}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
};
