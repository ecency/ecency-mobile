import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { AccountContainer } from '../../../containers';
import AccountsBottomSheet from '../view/accountsBottomSheetView';

const AccountsBottomSheetContainer = ({ navigation }) => {
  const accountsBottomSheetRef = useRef();

  const isVisibleAccountsBottomSheet = useSelector(
    (state) => state.ui.isVisibleAccountsBottomSheet,
  );

  useEffect(() => {
    if (isVisibleAccountsBottomSheet) {
      accountsBottomSheetRef.current?.showAccountsBottomSheet();
    }
  }, [isVisibleAccountsBottomSheet]);

  const _navigateToRoute = (route = null) => {
    if (route) {
      //navigation.navigate(route);
    }
  };

  return (
    <AccountContainer>
      {({ accounts, currentAccount, isLoggedIn, isLoginDone, username }) => (
        <AccountsBottomSheet
          ref={accountsBottomSheetRef}
          accounts={accounts}
          currentAccount={currentAccount}
          navigateToRoute={_navigateToRoute}
        />
      )}
    </AccountContainer>
  );
};

export default AccountsBottomSheetContainer;
