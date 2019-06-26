import React from 'react';

import TransferContainer from './container/transferContainer';

import TransferScreen from './screen/transferScreen';

const Transfer = ({ navigation }) => (
  <TransferContainer navigation={navigation}>
    {({
      accounts,
      balance,
      fundType,
      transferType,
      fetchBalance,
      getAccountsWithUsername,
      transferToAccount,
      handleOnModalClose,
      accountType,
      currentAccountName,
    }) => {
      switch (transferType) {
        case 'transfer_token':
          return (
            <TransferScreen
              accounts={accounts}
              balance={balance}
              fundType={fundType}
              transferType={transferType}
              fetchBalance={fetchBalance}
              getAccountsWithUsername={getAccountsWithUsername}
              transferToAccount={transferToAccount}
              handleOnModalClose={handleOnModalClose}
              accountType={accountType}
              currentAccountName={currentAccountName}
            />
          );

        default:
          return null;
      }
    }}
  </TransferContainer>
);

export default Transfer;
