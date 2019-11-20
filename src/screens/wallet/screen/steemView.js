import React from 'react';
import get from 'lodash/get';
import { View } from 'react-native';

import { Points, FormatedCurrency } from '../../../components';
import { SteemWalletContainer, AccountContainer } from '../../../containers';
import { navigate } from '../../../navigation/service';

import globalStyles from '../../../globalStyles';

const SteeemView = ({ handleOnSelected, index, currentIndex }) => (
  <View style={globalStyles.swipeItemWrapper}>
    <AccountContainer>
      {({ currentAccount }) => (
        <SteemWalletContainer selectedUser={currentAccount}>
          {({
            isClaiming,
            claimRewardBalance,
            handleOnWalletRefresh,
            refreshing,
            walletData,
            steemPerMVests,
            userActivities,
            steemBalance,
            isLoading,
            steemSavingBalance,
            estimatedValue,
            steemDropdown,
          }) => (
            <Points
              componentDidUpdate={() => handleOnSelected(userActivities, 'steem')}
              index={index}
              showIconList
              claim={claimRewardBalance}
              fetchUserActivity={handleOnWalletRefresh}
              isClaiming={isClaiming}
              isLoading={isLoading}
              refreshing={refreshing}
              userActivities={userActivities}
              unclaimedBalance={0}
              userBalance={[
                { balance: steemBalance, nameKey: 'steem', options: steemDropdown },
                { balance: steemSavingBalance, nameKey: 'saving', options: [] },
              ]}
              handleOnDropdownSelected={selectedIndex => {
                navigate({ routeName: steemDropdown[selectedIndex], params: 'STEEM' });
              }}
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

export default SteeemView;
