import React, { useEffect, useRef } from 'react';
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

  const _navigateToRoute = (routeName = null) => {
    if (routeName) {
      accountsBottomSheetRef.current?.closeAccountsBottomSheet();
      navigate({ routeName });
    }
  };

  const _switchAccount = async (switchingAccount = {}) => {
    accountsBottomSheetRef.current?.closeAccountsBottomSheet();

    //TODO: Remove setTimeout
    const timeout = setTimeout(async () => {
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
    }, 750);
    clearTimeout(timeout);
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
