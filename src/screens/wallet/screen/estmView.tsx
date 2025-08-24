import React from 'react';
import get from 'lodash/get';
import { View } from 'react-native';

import { WalletHeader, FormattedCurrency } from '../../../components';
import { PointsContainer } from '../../../containers';

import globalStyles from '../../../globalStyles';

const EstmView = ({ handleOnSelected, index, currentIndex, refreshing: reload }) => (
  <View style={globalStyles.swipeItemWrapper}>
    <PointsContainer>
      {({
        handleOnDropdownSelected,
        claim,
        fetchUserActivity,
        isClaiming,
        isLoading,
        refreshing,
        userActivities,
        userPoints,
        estimatedEstm,
        dropdownOptions,
      }) => (
        <WalletHeader
          componentDidUpdate={() => handleOnSelected(userActivities, isLoading, fetchUserActivity)}
          index={index}
          reload={reload}
          claim={claim}
          fetchUserActivity={fetchUserActivity}
          isClaiming={isClaiming}
          isLoading={isLoading}
          refreshing={refreshing}
          userActivities={userActivities}
          unclaimedBalance={
            get(userPoints, 'unclaimed_points') > 0 && get(userPoints, 'unclaimed_points')
          }
          userBalance={[
            { balance: get(userPoints, 'points'), nameKey: 'estm', options: dropdownOptions },
          ]}
          handleOnDropdownSelected={handleOnDropdownSelected}
          type="estm"
          currentIndex={currentIndex}
          showBuyButton
          showIconList={false}
          valueDescriptions={[
            {
              textKey: 'estimated_value',
              value: <FormattedCurrency isApproximate isToken value={estimatedEstm} />,
              subTextKey: 'estimated_value_desc',
            },
          ]}
        />
      )}
    </PointsContainer>
  </View>
);

export default EstmView;
