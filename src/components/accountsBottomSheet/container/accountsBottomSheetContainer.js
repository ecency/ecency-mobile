import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { navigate } from '../../../navigation/service';

import { updateCurrentAccount } from '../../../redux/actions/accountAction';
import { isRenderRequired } from '../../../redux/actions/applicationActions';

import { getUserDataWithUsername } from '../../../realm/realm';
import { switchAccount } from '../../../providers/hive/auth';

import { AccountContainer } from '../../../containers';
import AccountsBottomSheet from '../view/accountsBottomSheetView';

const AccountsBottomSheetContainer = ({ navigation }) => {
  const dispatch = useDispatch();
  const accountsBottomSheetRef = useRef();

  const [pressSwitch, setPressSwitch] = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState({});

  const isVisibleAccountsBottomSheet = useSelector(
    (state) => state.ui.isVisibleAccountsBottomSheet,
  );
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const accounts = useSelector((state) => state.account.otherAccounts);

  useEffect(() => {
    if (isVisibleAccountsBottomSheet) {
      accountsBottomSheetRef.current?.showAccountsBottomSheet();
    }
  }, [isVisibleAccountsBottomSheet]);

  useEffect(() => {
    if (pressSwitch && switchingAccount.name && !isVisibleAccountsBottomSheet) {
      _handleSwitch();
    }
  }, [pressSwitch, isVisibleAccountsBottomSheet, switchingAccount]);

  const _navigateToRoute = (routeName = null) => {
    if (routeName) {
      accountsBottomSheetRef.current?.closeAccountsBottomSheet();
      navigate({ routeName });
    }
  };

  const _switchAccount = async (account = {}) => {
    accountsBottomSheetRef.current?.closeAccountsBottomSheet();

    setPressSwitch(true);
    setSwitchingAccount(account);
  };

  const _handleSwitch = async () => {
    setPressSwitch(false);
    setSwitchingAccount({});

    if (switchingAccount.username !== currentAccount.name) {
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
    }
  };

  return (
    <AccountsBottomSheet
      ref={accountsBottomSheetRef}
      accounts={accounts}
      currentAccount={currentAccount}
      navigateToRoute={_navigateToRoute}
      switchAccount={_switchAccount}
    />
  );
};

export default AccountsBottomSheetContainer;
