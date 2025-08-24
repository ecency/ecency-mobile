import React from 'react';
import { View } from 'react-native';

import { WalletHeader, FormattedCurrency } from '../../../components';
import { WalletContainer, AccountContainer } from '../../../containers';

import globalStyles from '../../../globalStyles';

const HbdView = ({ handleOnSelected, index, currentIndex, refreshing: reload }) => (
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
            hbdBalance,
            isLoading,
            hbdSavingBalance,
            estimatedHbdValue,
            hbdDropdown,
            savingHbdDropdown,
            navigate,
          }) => (
            <WalletHeader
              componentDidUpdate={() => handleOnSelected(transferHistory, isLoading)}
              index={index}
              claim={claimRewardBalance}
              reload={reload}
              fetchUserActivity={handleOnWalletRefresh}
              isClaiming={isClaiming}
              isLoading={isLoading}
              refreshing={refreshing}
              unclaimedBalance={0}
              userBalance={[
                { balance: hbdBalance, nameKey: 'hbd', options: hbdDropdown },
                { balance: hbdSavingBalance, nameKey: 'savinghbd', options: savingHbdDropdown },
              ]}
              handleOnDropdownSelected={(option) => navigate(option, 'HBD')}
              type="hbd"
              currentIndex={currentIndex}
              showIconList={false}
              valueDescriptions={[
                {
                  textKey: 'estimated_value',
                  value: <FormattedCurrency isApproximate isToken value={estimatedHbdValue} />,
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

export default HbdView;
