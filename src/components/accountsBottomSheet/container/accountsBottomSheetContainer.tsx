import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { useIntl } from 'react-intl';
import { Alert } from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';
import RootNavigation from '../../../navigation/rootNavigation';

import { setPrevLoggedInUsers, updateCurrentAccount } from '../../../redux/actions/accountAction';

import {
  migrateToMasterKeyWithAccessToken,
  refreshSCToken,
  switchAccount,
} from '../../../providers/hive/auth';
import { getUserDataWithUsername } from '../../../realm/realm';

import { logout } from '../../../redux/actions/uiAction';
import AccountsBottomSheet, { AccountsBottomSheetRef } from '../view/accountsBottomSheetView';

// Constants
import AUTH_TYPE from '../../../constants/authType';
import { getDigitPinCode, getMutes } from '../../../providers/hive/dhive';

import { useAppSelector } from '../../../hooks';
import { getPointsSummary } from '../../../providers/ecency/ePoint';
import { getUnreadNotificationCount } from '../../../providers/ecency/ecency';
import { clearSubscribedCommunitiesCache } from '../../../redux/actions/cacheActions';
import { fetchSubscribedCommunities } from '../../../redux/actions/communitiesAction';
import { decryptKey } from '../../../utils/crypto';
import { repairUserAccountData } from '../../../utils/migrationHelpers';
import ROUTES from '../../../constants/routeNames';
import { SheetNames } from '../../../navigation/sheets';

const AccountsBottomSheetContainer = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const accountsBottomSheetViewRef = useRef<AccountsBottomSheetRef | null>(null);

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const accounts = useAppSelector((state) => state.account.otherAccounts);
  const pinHash = useAppSelector((state) => state.application.pin);
  const prevLoggedInUsers = useAppSelector((state) => state.account.prevLoggedInUsers);
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);

  useEffect(() => {
    accountsBottomSheetViewRef.current?.showAccountsBottomSheet();
    _checkPrevLoggedInUsersList();
  }, []);

  // checks if prevLoggedInUsers do not contain any invalid value and filters the array from invalid data
  const _checkPrevLoggedInUsersList = () => {
    if (prevLoggedInUsers && prevLoggedInUsers.length > 0) {
      const filteredUsersList = prevLoggedInUsers.filter((el: any) => el.username);
      dispatch(setPrevLoggedInUsers(filteredUsersList));
    }
  };

  const _navigateToRoute = (name: string, params: any) => {
    SheetManager.hide(SheetNames.ACCOUNTS_SHEET);
    accountsBottomSheetViewRef.current?.closeAccountsBottomSheet();
    if (name) {
      RootNavigation.navigate({ name, params });
    }
  };

  const _switchAccount = async (account = {}) => {
    SheetManager.hide(SheetNames.ACCOUNTS_SHEET);
    accountsBottomSheetViewRef.current?.closeAccountsBottomSheet();
    if (currentAccount && account && account.username !== currentAccount.name) {
      _handleSwitch(account);
    }
  };

  const _logout = async () => {
    dispatch(logout());
  };

  const _checkHiveAuthExpiry = (authData: any) => {
    if (authData?.username) {
      const curTime = new Date().getTime();
      if (curTime > authData.hiveAuthExpiry) {
        SheetManager.show(SheetNames.ACTION_MODAL, {
          payload: {
            title: intl.formatMessage({ id: 'alert.warning' }),
            body: intl.formatMessage({ id: 'alert.auth_expired' }),
            buttons: [
              {
                text: intl.formatMessage({ id: 'alert.cancel' }),
                style: 'destructive',
                onPress: () => {
                  console.log('cancel pressed');
                },
              },
              {
                text: intl.formatMessage({ id: 'alert.verify' }),
                onPress: () => {
                  RootNavigation.navigate({
                    name: ROUTES.SCREENS.LOGIN,
                    params: { username: authData.username },
                  });
                },
              },
            ],
          },
        });
      }
    }
  };

  const _handleSwitch = async (switchingAccount = {}) => {
    try {
      const accountData = accounts.filter(
        (account) => account.username === switchingAccount.username,
      )[0];

      // if account data has persistet content use that first
      // to avoid lag
      if (accountData.name) {
        accountData.username = accountData.name;
        dispatch(updateCurrentAccount(accountData));
      }

      // fetch upto data account data nd update current account;
      let _currentAccount = await switchAccount(accountData.username);
      let realmData = await getUserDataWithUsername(accountData.username);

      _currentAccount.username = _currentAccount.name;

      if (!realmData[0]) {
        realmData = await repairUserAccountData(
          _currentAccount.username,
          dispatch,
          intl,
          accounts,
          pinHash,
        );
        if (!realmData[0]) {
          return;
        }
      }

      [_currentAccount.local] = realmData;

      if (currentAccount.local.authType === AUTH_TYPE.HIVE_AUTH) {
        _checkHiveAuthExpiry(_currentAccount.local);
      }

      // migreate account to use access token for master key auth type
      if (
        realmData[0].authType !== AUTH_TYPE.STEEM_CONNECT &&
        realmData[0].authType !== AUTH_TYPE.HIVE_AUTH &&
        realmData[0].accessToken === ''
      ) {
        _currentAccount = await migrateToMasterKeyWithAccessToken(
          _currentAccount,
          realmData[0],
          pinHash,
        );
      }

      // refresh access token
      const encryptedAccessToken = await refreshSCToken(
        _currentAccount.local,
        getDigitPinCode(pinHash),
      );

      _currentAccount.local.accessToken = encryptedAccessToken;

      const accessToken = decryptKey(encryptedAccessToken, getDigitPinCode(pinHash));
      _currentAccount.unread_activity_count = await getUnreadNotificationCount(accessToken);
      _currentAccount.pointsSummary = await getPointsSummary(_currentAccount.username);
      _currentAccount.mutes = await getMutes(_currentAccount.username);

      dispatch(updateCurrentAccount(_currentAccount));
      dispatch(clearSubscribedCommunitiesCache());
      dispatch(fetchSubscribedCommunities(_currentAccount.username));
    } catch (error) {
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        error.message,
        [
          { text: intl.formatMessage({ id: 'side_menu.logout' }), onPress: () => _logout() },
          { text: intl.formatMessage({ id: 'alert.cancel' }), style: 'destructive' },
        ],
      );
    }
  };

  return (
    <AccountsBottomSheet
      ref={accountsBottomSheetViewRef}
      accounts={accounts}
      currentAccount={currentAccount}
      navigateToRoute={_navigateToRoute}
      switchAccount={_switchAccount}
      prevLoggedInUsers={prevLoggedInUsers}
      dispatch={dispatch}
      isLoggedIn={isLoggedIn}
    />
  );
};

export default AccountsBottomSheetContainer;
