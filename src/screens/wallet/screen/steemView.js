import React from 'react';
import get from 'lodash/get';
import { View } from 'react-native';

import { Points } from '../../../components';
import { SteemWalletContainer, AccountContainer } from '../../../containers';

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
              userBalance={steemBalance}
              handleOnDropdownSelected={null}
              type="steem"
              dropdownOptions={[]}
              currentIndex={currentIndex}
              showIconList={false}
            />
          )}
        </SteemWalletContainer>
      )}
    </AccountContainer>
  </View>
);

export default SteeemView;
