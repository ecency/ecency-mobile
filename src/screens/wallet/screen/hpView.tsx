import React, { useRef, useMemo } from 'react';
import { View, Text } from 'react-native';

import { WalletHeader, FormattedCurrency } from '../../../components';
import { WalletContainer, AccountContainer } from '../../../containers';
import { DelegationsModal, MODES } from '../../assetDetails/children/delegationsModal';
import { walletQueries } from '../../../providers/queries';
import globalStyles from '../../../globalStyles';

const HpView = ({ handleOnSelected, index, currentIndex, refreshing: reload }) => {
  const delegationsModalRef = useRef(null);

  // Fetch HP asset with extraData for delegation info
  const assetsQuery = walletQueries.useAssetsQuery();
  const hpAsset = useMemo(
    () => assetsQuery.data?.find((asset) => asset.symbol === 'HP'),
    [assetsQuery.data],
  );

  const _handleDelegationPress = (mode: MODES) => {
    if (delegationsModalRef.current) {
      delegationsModalRef.current.showModal(mode);
    }
  };

  // Extract delegation data from HP asset extraData
  const delegationData = useMemo(() => {
    const outgoing =
      hpAsset?.extraData?.find((item) => item.dataKey === 'delegated_hive_power')?.value || '0 HP';
    const incoming =
      hpAsset?.extraData?.find((item) => item.dataKey === 'received_hive_power')?.value || '0 HP';

    return { outgoing, incoming };
  }, [hpAsset?.extraData]);

  return (
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
              hivePowerDropdown,
              unclaimedBalance,
              navigate,
              estimatedAmount,
            }) => (
              <>
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
                      textKey: 'delegated_hive_power',
                      value: <Text>{delegationData.outgoing}</Text>,
                      onPress: () => _handleDelegationPress(MODES.DELEGATEED),
                    },
                    {
                      textKey: 'received_hive_power',
                      value: <Text>{delegationData.incoming}</Text>,
                      onPress: () => _handleDelegationPress(MODES.RECEIVED),
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
                <DelegationsModal ref={delegationsModalRef} />
              </>
            )}
          </WalletContainer>
        )}
      </AccountContainer>
    </View>
  );
};

export default HpView;
