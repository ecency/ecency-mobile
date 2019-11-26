import React from 'react';
import get from 'lodash/get';
import { View } from 'react-native';

import { WalletHeader } from '../../../components';
import { PointsContainer } from '../../../containers';

import globalStyles from '../../../globalStyles';

const EstmView = ({ handleOnSelected, index, currentIndex }) => (
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
        dropdownOptions,
      }) => (
        <WalletHeader
          componentDidUpdate={() => handleOnSelected(userActivities, 'estm', fetchUserActivity)}
          index={index}
          showIconList
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
        />
      )}
    </PointsContainer>
  </View>
);

export default EstmView;
