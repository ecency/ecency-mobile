import React from 'react';
import { View } from 'react-native';

import { WalletHeader, FormattedCurrency } from '../../../components';
import { WalletContainer, AccountContainer } from '../../../containers';

import globalStyles from '../../../globalStyles';

const BtcView = ({ handleOnSelected, index, currentIndex, refreshing: reload }) => (
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
            tokenBalance,
            getTokenAddress,
            isLoading,
            estimatedTokenValue,
            btcDropdown,
            navigate,
          }) => (
            <WalletHeader
              componentDidUpdate={() => handleOnSelected(transferHistory, isLoading)}
              index={index}
              claim={claimRewardBalance}
              reload={reload}
              fetchUserActivity={handleOnWalletRefresh}
              getTokenAddress={() => getTokenAddress('BTC')}
              isClaiming={isClaiming}
              isLoading={isLoading}
              refreshing={refreshing}
              unclaimedBalance={0}
              userBalance={[{ balance: tokenBalance, nameKey: 'btc', options: btcDropdown }]}
              handleOnDropdownSelected={(option) => navigate(option, 'BTC')}
              type="btc"
              currentIndex={currentIndex}
              showAddressButton
              showIconList={false}
              valueDescriptions={[
                {
                  textKey: 'estimated_value',
                  value: <FormattedCurrency isApproximate isToken value={estimatedTokenValue} />,
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

export default BtcView;
