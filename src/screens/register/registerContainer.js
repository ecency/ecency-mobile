import { useState } from 'react';
import { Alert } from 'react-native';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import get from 'lodash/get';

import { useNavigation } from '@react-navigation/native';
import { lookupAccounts } from '../../providers/hive/dhive';
import { signUp } from '../../providers/ecency/ecency';
import ROUTES from '../../constants/routeNames';

const RegisterContainer = ({ children }) => {
  const navigation = useNavigation();
  const intl = useIntl();
  const isConnected = useSelector((state) => state.application.isConnected);
  const [isLoading, setIsLoading] = useState(false);

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

  const _handleOnPressRegister = ({ username, email, refUsername }) => {
    setIsLoading(true);

    signUp(username, email, refUsername)
      .then((result) => {
        if (result) {
          navigation.navigate(ROUTES.DRAWER.MAIN);
          Alert.alert(
            'Success',
            'Hurrah, you did it! Expect email from us with further instructions.',
          );
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (get(err, 'response.status') === 500) {
          Alert.alert(
            intl.formatMessage({ id: 'alert.fail' }),
            intl.formatMessage({ id: 'register.500_error' }),
          );
        } else if (get(err, 'response.data.message')) {
          Alert.alert(intl.formatMessage({ id: 'alert.fail' }), err.response.data.message);
        } else {
          Alert.alert(
            intl.formatMessage({ id: 'alert.fail' }),
            intl.formatMessage({ id: 'alert.unknow_error' }),
          );
        }
        setIsLoading(false);
      });
  };

  return (
    children &&
    children({
      getAccountsWithUsername: _getAccountsWithUsername,
      handleOnPressRegister: _handleOnPressRegister,
      isLoading,
    })
  );
};

export default RegisterContainer;
