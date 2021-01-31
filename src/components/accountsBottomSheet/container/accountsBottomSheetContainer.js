import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { navigate } from '../../../navigation/service';

import { updateCurrentAccount } from '../../../redux/actions/accountAction';
import { isRenderRequired } from '../../../redux/actions/applicationActions';

import { getUserDataWithUsername } from '../../../realm/realm';
import { switchAccount } from '../../../providers/hive/auth';

import AccountsBottomSheet from '../view/accountsBottomSheetView';
import { toggleAccountsBottomSheet } from '../../../redux/actions/uiAction';

const AccountsBottomSheetContainer = ({ navigation }) => {
  const dispatch = useDispatch();
  const accountsBottomSheetViewRef = useRef();

  const isVisibleAccountsBottomSheet = useSelector(
    (state) => state.ui.isVisibleAccountsBottomSheet,
  );
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const accounts = useSelector((state) => state.account.otherAccounts);

  useEffect(() => {
    if (isVisibleAccountsBottomSheet) {
      accountsBottomSheetViewRef.current?.showAccountsBottomSheet();
    }
  }, [isVisibleAccountsBottomSheet]);

  const _navigateToRoute = (routeName = null) => {
    if (routeName) {
      accountsBottomSheetViewRef.current?.closeAccountsBottomSheet();
      setTimeout(() => {
        navigate({ routeName });
      }, 200);
    }
  };

  const _switchAccount = async (account = {}) => {
    if (account.username !== currentAccount.name) {
      _handleSwitch(account);
    } else {
      accountsBottomSheetViewRef.current?.closeAccountsBottomSheet();
    }
  };

  const _handleSwitch = async (switchingAccount = {}) => {
    // Call this dispatch because when we make request, onDismiss is not working
    // =========================================================================
    accountsBottomSheetViewRef.current?.closeAccountsBottomSheet();
    dispatch(toggleAccountsBottomSheet());
    // =========================================================================

    const accountData = accounts.filter(
      (account) => account.username === switchingAccount.username,
    )[0];

    // control user persist whole data or just username
    if (accountData.name) {
      accountData.username = accountData.name;

      dispatch(updateCurrentAccount(accountData));
      dispatch(isRenderRequired(true));

      const upToDateCurrentAccount = await switchAccount(accountData.name);
      const realmData = await getUserDataWithUsername(accountData.name);

      upToDateCurrentAccount.username = upToDateCurrentAccount.name;
      upToDateCurrentAccount.local = realmData[0];

      dispatch(updateCurrentAccount(upToDateCurrentAccount));
    } else {
      const _currentAccount = await switchAccount(accountData.username);
      const realmData = await getUserDataWithUsername(accountData.username);

      _currentAccount.username = _currentAccount.name;
      _currentAccount.local = realmData[0];

      dispatch(updateCurrentAccount(_currentAccount));
      dispatch(isRenderRequired(true));
    }
  };

  return (
    <AccountsBottomSheet
      ref={accountsBottomSheetViewRef}
      accounts={accounts}
      currentAccount={currentAccount}
      navigateToRoute={_navigateToRoute}
      switchAccount={_switchAccount}
    />
  );
};

export default AccountsBottomSheetContainer;
