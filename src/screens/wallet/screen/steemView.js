import React from 'react';
import { View } from 'react-native';

import { WalletHeader, FormatedCurrency } from '../../../components';
import { SteemWalletContainer, AccountContainer } from '../../../containers';

import globalStyles from '../../../globalStyles';

const SteemView = ({ handleOnSelected, index, currentIndex }) => (
  <View style={globalStyles.swipeItemWrapper}>
    <AccountContainer>
      {({ currentAccount }) => (
        <SteemWalletContainer selectedUser={currentAccount}>
          {({
            isClaiming,
            claimRewardBalance,
            handleOnWalletRefresh,
            refreshing,
            transferHistory,
            steemBalance,
            isLoading,
            steemSavingBalance,
            estimatedValue,
            steemDropdown,
            savingSteemDropdown,
            navigate,
          }) => (
            <WalletHeader
              componentDidUpdate={() => handleOnSelected(transferHistory, isLoading)}
              index={index}
              claim={claimRewardBalance}
              fetchUserActivity={handleOnWalletRefresh}
              isClaiming={isClaiming}
              isLoading={isLoading}
              refreshing={refreshing}
              unclaimedBalance={0}
              userBalance={[
                { balance: steemBalance, nameKey: 'steem', options: steemDropdown },
                {
                  balance: steemSavingBalance,
                  nameKey: 'savingsteem',
                  options: savingSteemDropdown,
                },
              ]}
              handleOnDropdownSelected={option => navigate(option, 'STEEM')}
              type="steem"
              currentIndex={currentIndex}
              showIconList={false}
              valueDescriptions={[
                {
                  textKey: 'estimated_value',
                  value: <FormatedCurrency isApproximate value={estimatedValue} />,
                  subTextKey: 'estimated_value_desc',
                },
              ]}
            />
          )}
        </SteemWalletContainer>
      )}
    </AccountContainer>
  </View>
);

export default SteemView;
