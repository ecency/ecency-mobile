import React from 'react';
import { View } from 'react-native';

import { WalletHeader, FormattedCurrency } from '../../../components';
import { SteemWalletContainer, AccountContainer } from '../../../containers';

import globalStyles from '../../../globalStyles';

const SteemView = ({ handleOnSelected, index, currentIndex, refreshing: reload }) => (
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
            estimatedSteemValue,
            steemDropdown,
            savingSteemDropdown,
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
                  value: <FormattedCurrency isApproximate isToken value={estimatedSteemValue} />,
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
