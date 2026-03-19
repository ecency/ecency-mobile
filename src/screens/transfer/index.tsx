import React from 'react';

import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { TransferContainer } from '../../containers';

import TransferView from './screen/transferScreen';
import AddressView from './screen/addressScreen';
import PowerDownView from './screen/powerDownScreen';
import DelegateView from './screen/delegateScreen';
import TransferTypes from '../../constants/transferTypes';
import { useBadActors } from '../../hooks';

const Transfer = ({ navigation, route }) => {
  const { data: badActors } = useBadActors();

  return (
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
        recurrentTransfers,
        fetchRecurrentTransfers,
        tokenLayer,
        tokenAddress,
      }) => {
        switch (transferType) {
          case TransferTypes.DELEGATE_VESTING_SHARES:
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
                badActors={badActors}
              />
            );
          case TransferTypes.WITHDRAW_VESTING:
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
                currentAccountName={currentAccountName}
                selectedAccount={selectedAccount}
                hivePerMVests={hivePerMVests}
                setWithdrawVestingRoute={setWithdrawVestingRoute}
              />
            );
          case TransferTypes.RECEIVE:
            return (
              <AddressView
                fundType={fundType}
                transferType={transferType}
                handleOnModalClose={handleOnModalClose}
                accountType={accountType}
                currentAccountName={currentAccountName}
                selectedAccount={selectedAccount}
                tokenAddress={tokenAddress}
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
                recurrentTransfers={recurrentTransfers || []}
                fetchRecurrentTransfers={fetchRecurrentTransfers}
                tokenLayer={tokenLayer}
                badActors={badActors}
              />
            );
        }
      }}
    </TransferContainer>
  );
};

export default gestureHandlerRootHOC(Transfer);
