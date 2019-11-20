import React from 'react';
import get from 'lodash/get';
import { View } from 'react-native';

import { Points } from '../../../components';
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
        <Points
          componentDidUpdate={() => handleOnSelected(userActivities, 'estm')}
          index={index}
          showIconList
          claim={claim}
          fetchUserActivity={fetchUserActivity}
          isClaiming={isClaiming}
          isLoading={isLoading}
          refreshing={refreshing}
          userActivities={userActivities}
          unclaimedBalance={get(userPoints, 'unclaimed_points', 0)}
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
