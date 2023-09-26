import React from 'react';

import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { TransferContainer } from '../../containers';

import TransferView from './screen/transferScreen';
import AddressView from './screen/addressScreen';
import PowerDownView from './screen/powerDownScreen';
import DelegateView from './screen/delegateScreen';

const Transfer = ({ navigation, route }) => (
  <TransferContainer navigation={navigation} route={route}>
    {({
      accounts,
      balance,
      fundType,
      transferType,
      fetchBalance,
      selectedAccount,
      getAccountsWithUsername,
      transferToAccount,
      handleOnModalClose,
      accountType,
      currentAccountName,
      hivePerMVests,
      actionModalVisible,
      setWithdrawVestingRoute,
      dispatch,
      referredUsername,
      spkMarkets,
      initialAmount,
      initialMemo,
      initialRecurrence,
    }) => {
      switch (transferType) {
        case 'delegate':
          return (
            <DelegateView
              accounts={accounts}
              currentAccountName={currentAccountName}
              selectedAccount={selectedAccount}
              getAccountsWithUsername={getAccountsWithUsername}
              balance={balance}
              fetchBalance={fetchBalance}
              transferToAccount={transferToAccount}
              accountType={accountType}
              handleOnModalClose={handleOnModalClose}
              hivePerMVests={hivePerMVests}
              actionModalVisible={actionModalVisible}
              dispatch={dispatch}
              referredUsername={referredUsername}
            />
          );
        case 'power_down':
          return (
            <PowerDownView
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
              selectedAccount={selectedAccount}
              hivePerMVests={hivePerMVests}
              setWithdrawVestingRoute={setWithdrawVestingRoute}
            />
          );
        case 'address_view':
          return (
            <AddressView
              fundType={fundType}
              transferType={transferType}
              handleOnModalClose={handleOnModalClose}
              accountType={accountType}
              currentAccountName={currentAccountName}
              selectedAccount={selectedAccount}
            />
          );

        default:
          return (
            <TransferView
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
              selectedAccount={selectedAccount}
              spkMarkets={spkMarkets}
              referredUsername={referredUsername || ''}
              initialAmount={initialAmount || ''}
              initialMemo={initialMemo || ''}
              initialRecurrence={initialRecurrence || ''}
            />
          );
      }
    }}
  </TransferContainer>
);

export default gestureHandlerRootHOC(Transfer);
