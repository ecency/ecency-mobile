import React from 'react';
import { View } from 'react-native';

import { WalletHeader, FormattedCurrency } from '../../../components';
import { WalletContainer, AccountContainer } from '../../../containers';

import globalStyles from '../../../globalStyles';

const HiveView = ({ handleOnSelected, index, currentIndex, refreshing: reload }) => (
  <View style={globalStyles.swipeItemWrapper}>
    <AccountContainer>
      {({ currentAccount }) => (
        <WalletContainer selectedUser={currentAccount}>
          {({
            isClaiming,
            claimRewardBalance,
            handleOnWalletRefresh,
            refreshing,
            transferHistory,
            hiveBalance,
            isLoading,
            hiveSavingBalance,
            estimatedHiveValue,
            hiveDropdown,
            savingHiveDropdown,
            navigate,
          }) => (
            <WalletHeader
              componentDidUpdate={() => handleOnSelected(transferHistory, isLoading)}
              index={index}
              claim={claimRewardBalance}
              fetchUserActivity={handleOnWalletRefresh}
              reload={reload}
              isClaiming={isClaiming}
              isLoading={isLoading}
              refreshing={refreshing}
              unclaimedBalance={0}
              userBalance={[
                { balance: hiveBalance, nameKey: 'hive', options: hiveDropdown },
                {
                  balance: hiveSavingBalance,
                  nameKey: 'savinghive',
                  options: savingHiveDropdown,
                },
              ]}
              handleOnDropdownSelected={(option) => navigate(option, 'HIVE')}
              type="hive"
              currentIndex={currentIndex}
              showIconList={false}
              valueDescriptions={[
                {
                  textKey: 'estimated_value',
                  value: <FormattedCurrency isApproximate isToken value={estimatedHiveValue} />,
                  subTextKey: 'estimated_value_desc',
                },
              ]}
            />
          )}
        </WalletContainer>
      )}
    </AccountContainer>
  </View>
);

export default HiveView;
