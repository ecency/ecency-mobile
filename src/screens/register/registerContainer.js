import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { lookupAccounts } from '../../providers/hive/dhive';

const RegisterContainer = ({ children }) => {
  const intl = useIntl();

  const registerAccountModalRef = useRef(null);

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

  return (
    children &&
    children({
      getAccountsWithUsername: _getAccountsWithUsername,
      isLoading,
      registerAccountModalRef,
    })
  );
};

export default RegisterContainer;
