import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { AccountContainer } from '../../../containers';
import AccountsBottomSheet from '../view/accountsBottomSheetView';

const AccountsBottomSheetContainer = () => {
  const accountsBottomSheetdRef = useRef();

  const isVisibleAccountsBottomSheet = useSelector(
    (state) => state.ui.isVisibleAccountsBottomSheet,
  );

  useEffect(() => {
    //console.log(isVisibleAccountsBottomSheet, 'isVisibleAccountsBottomSheet');
    if (isVisibleAccountsBottomSheet) {
      console.log(accountsBottomSheetdRef.current);
      accountsBottomSheetdRef.current?.showAccountsBottomSheet();
    }
  }, [isVisibleAccountsBottomSheet]);

  return (
    <AccountContainer>
      {({ accounts, currentAccount, isLoggedIn, isLoginDone, username }) => (
        <AccountsBottomSheet ref={accountsBottomSheetdRef} />
      )}
    </AccountContainer>
  );
};

export default AccountsBottomSheetContainer;
