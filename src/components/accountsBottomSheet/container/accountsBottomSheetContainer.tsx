import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { Alert } from 'react-native';
import { useIntl } from 'react-intl';
import RootNavigation from '../../../navigation/rootNavigation';

import { updateCurrentAccount } from '../../../redux/actions/accountAction';

import { getUserDataWithUsername } from '../../../realm/realm';
import {
  migrateToMasterKeyWithAccessToken,
  refreshSCToken,
  switchAccount,
} from '../../../providers/hive/auth';

import AccountsBottomSheet from '../view/accountsBottomSheetView';
import {
  logout,
  showActionModal,
  toggleAccountsBottomSheet,
} from '../../../redux/actions/uiAction';

// Constants
import AUTH_TYPE from '../../../constants/authType';
import { getDigitPinCode, getMutes } from '../../../providers/hive/dhive';

import { useAppSelector } from '../../../hooks';
import { getUnreadNotificationCount } from '../../../providers/ecency/ecency';
import { decryptKey } from '../../../utils/crypto';
import { getPointsSummary } from '../../../providers/ecency/ePoint';
import { fetchSubscribedCommunities } from '../../../redux/actions/communitiesAction';
import { clearSubscribedCommunitiesCache } from '../../../redux/actions/cacheActions';
import ROUTES from '../../../constants/routeNames';
import { repairUserAccountData } from '../../../utils/migrationHelpers';

const AccountsBottomSheetContainer = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const accountsBottomSheetViewRef = useRef();

  const isVisibleAccountsBottomSheet = useAppSelector(
    (state) => state.ui.isVisibleAccountsBottomSheet,
  );
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const accounts = useAppSelector((state) => state.account.otherAccounts);
  const pinHash = useAppSelector((state) => state.application.pin);

  useEffect(() => {
    if (isVisibleAccountsBottomSheet) {
      accountsBottomSheetViewRef.current?.showAccountsBottomSheet();
    }
  }, [isVisibleAccountsBottomSheet]);

  const _navigateToRoute = (name: string, params: any) => {
    dispatch(toggleAccountsBottomSheet(false));
    accountsBottomSheetViewRef.current?.closeAccountsBottomSheet();
    if (name) {
      RootNavigation.navigate({ name, params });
    }
  };

  const _onClose = () => {
    dispatch(toggleAccountsBottomSheet(false));
  };

  const _switchAccount = async (account = {}) => {
    dispatch(toggleAccountsBottomSheet(false));
    accountsBottomSheetViewRef.current?.closeAccountsBottomSheet();
    if (currentAccount && account && account.username !== currentAccount.name) {
      _handleSwitch(account);
    }
  };

  const _logout = async () => {
    dispatch(logout());
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
        realmData = await repairUserAccountData(_currentAccount.username, dispatch, intl, accounts, pinHash);
        if(!realmData[0]){
          return;
        }
      }

      _currentAccount.local = realmData[0];

      // migreate account to use access token for master key auth type
      if (realmData[0].authType !== AUTH_TYPE.STEEM_CONNECT && realmData[0].accessToken === '') {
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
      onClose={_onClose}
    />
  );
};

export default AccountsBottomSheetContainer;
