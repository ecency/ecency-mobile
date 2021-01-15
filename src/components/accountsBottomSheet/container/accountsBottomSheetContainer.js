import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { AccountContainer } from '../../../containers';
import AccountsBottomSheet from '../view/accountsBottomSheetView';

const AccountsBottomSheetContainer = () => {
  const accountsBottomSheetRef = useRef();

  const isVisibleAccountsBottomSheet = useSelector(
    (state) => state.ui.isVisibleAccountsBottomSheet,
  );

  useEffect(() => {
    console.log(isVisibleAccountsBottomSheet, 'isVisibleAccountsBottomSheet');
    if (isVisibleAccountsBottomSheet) {
      accountsBottomSheetRef.current?.showAccountsBottomSheet();
    } else {
      accountsBottomSheetRef.current?.closeAccountsBottomSheet();
    }
  }, [isVisibleAccountsBottomSheet]);

  return (
    <AccountContainer>
      {({ accounts, currentAccount, isLoggedIn, isLoginDone, username }) => (
        <AccountsBottomSheet
          ref={accountsBottomSheetRef}
          accounts={accounts}
          currentAccount={currentAccount}
        />
      )}
    </AccountContainer>
  );
};

export default AccountsBottomSheetContainer;
