import { useState } from 'react';
import { Alert } from 'react-native';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { withNavigation } from 'react-navigation';
import get from 'lodash/get';

import { lookupAccounts } from '../../providers/steem/dsteem';
import { register } from '../../providers/esteem/esteem';
import ROUTES from '../../constants/routeNames';

const RegisterContainer = ({ children, navigation }) => {
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
    const data = {
      username,
      email,
      referral: refUsername,
    };
    setIsLoading(true);

    register(data)
      .then((result) => {
        if (result) {
          navigation.navigate({
            routeName: ROUTES.DRAWER.MAIN,
          });
          Alert.alert('Success', 'heeeey');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (get(err, 'response.status', false)) {
          Alert.alert('Error', intl.formatMessage({ id: 'register.500_error' }));
        } else {
          Alert.alert('Error', intl.formatMessage({ id: 'alert.unknow_error' }));
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

export default withNavigation(RegisterContainer);
