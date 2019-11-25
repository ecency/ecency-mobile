import React from 'react';
import { View } from 'react-native';

import { WalletHeader, FormatedCurrency } from '../../../components';
import { SteemWalletContainer, AccountContainer } from '../../../containers';

import globalStyles from '../../../globalStyles';

const SpView = ({ handleOnSelected, index, currentIndex }) => (
  <View style={globalStyles.swipeItemWrapper}>
    <AccountContainer>
      {({ currentAccount }) => (
        <SteemWalletContainer selectedUser={currentAccount}>
          {({
            isClaiming,
            claimRewardBalance,
            handleOnWalletRefresh,
            refreshing,
            userActivities,
            spBalance,
            isLoading,
            steemSavingBalance,
            estimatedValue,
            steemPowerDropdown,
            savingSteemDropdown,
            unclaimedBalance,
            navigate,
          }) => (
            <WalletHeader
              componentDidUpdate={() => handleOnSelected(userActivities, 'steem_power')}
              index={index}
              claim={claimRewardBalance}
              fetchUserActivity={handleOnWalletRefresh}
              isClaiming={isClaiming}
              isLoading={isLoading}
              refreshing={refreshing}
              userActivities={userActivities}
              unclaimedBalance={unclaimedBalance}
              showBuyButton={unclaimedBalance.length > 0}
              userBalance={[
                { balance: spBalance, nameKey: 'steem_power', options: steemPowerDropdown },
              ]}
              handleOnDropdownSelected={option => navigate(option, 'STEEM_POWER')}
              type="steem_power"
              currentIndex={currentIndex}
              showIconList={false}
              valueDescriptions={[
                {
                  textKey: 'estimated_value',
                  value: <FormatedCurrency isApproximate value={estimatedValue} />,
                },
                {
                  textKey: 'estimated_value',
                  value: <FormatedCurrency isApproximate value={estimatedValue} />,
                },
              ]}
            />
          )}
        </SteemWalletContainer>
      )}
    </AccountContainer>
  </View>
);

export default SpView;
