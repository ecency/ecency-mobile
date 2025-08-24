import React from 'react';
import { View, Text } from 'react-native';

import { WalletHeader, FormattedCurrency } from '../../../components';
import { WalletContainer, AccountContainer } from '../../../containers';

import globalStyles from '../../../globalStyles';

const HpView = ({ handleOnSelected, index, currentIndex, refreshing: reload }) => (
  <View style={globalStyles.swipeItemWrapper}>
    <AccountContainer>
      {({ currentAccount }) => (
        <WalletContainer selectedUser={currentAccount}>
          {({
            isClaiming,
            claimRewardBalance,
            handleOnWalletRefresh,
            refreshing,
            userActivities,
            hpBalance,
            isLoading,
            estimatedHpValue,
            delegationsAmount,
            hivePowerDropdown,
            unclaimedBalance,
            navigate,
            estimatedAmount,
          }) => (
            <WalletHeader
              componentDidUpdate={() => handleOnSelected(userActivities, isLoading)}
              index={index}
              claim={claimRewardBalance}
              reload={reload}
              fetchUserActivity={handleOnWalletRefresh}
              isClaiming={isClaiming}
              isLoading={isLoading}
              refreshing={refreshing}
              userActivities={userActivities}
              unclaimedBalance={unclaimedBalance}
              showBuyButton={unclaimedBalance.length > 0}
              userBalance={[
                { balance: hpBalance, nameKey: 'hive_power', options: hivePowerDropdown },
              ]}
              handleOnDropdownSelected={(option) => navigate(option, 'HIVE_POWER')}
              type="hive_power"
              currentIndex={currentIndex}
              showIconList={false}
              valueDescriptions={[
                {
                  textKey: 'delegations',
                  value: (
                    <Text>
                      {delegationsAmount}
                      {' HP'}
                    </Text>
                  ),
                },
                {
                  textKey: 'estimated_value',
                  value: <FormattedCurrency isApproximate isToken value={estimatedHpValue} />,
                },
                {
                  textKey: 'vote_value',
                  value: <FormattedCurrency isApproximate value={estimatedAmount} />,
                },
              ]}
            />
          )}
        </WalletContainer>
      )}
    </AccountContainer>
  </View>
);

export default HpView;
