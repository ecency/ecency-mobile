import React, { Fragment } from 'react';
import { useIntl } from 'react-intl';
import { SafeAreaView } from 'react-native';
import get from 'lodash/get';

// Containers
import { PointsContainer, LoggedInContainer } from '../../../containers';

// Components
import { Header, Points } from '../../../components';

// Styles
import styles from './pointsStyles';

const PointsScreen = () => {
  const intl = useIntl();

  return (
    <Fragment>
      <Header />
      <SafeAreaView style={styles.container}>
        <LoggedInContainer>
          {() => (
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
              }) => (
                <Points
                  claim={claim}
                  fetchUserActivity={fetchUserActivity}
                  isClaiming={isClaiming}
                  isLoading={isLoading}
                  refreshing={refreshing}
                  userActivities={userActivities}
                  userPoints={userPoints}
                  unclaimedBalance={get(userPoints, 'unclaimed_points', 0)}
                  userBalance={get(userPoints, 'points')}
                  handleOnDropdownSelected={handleOnDropdownSelected}
                  type="estm"
                  dropdownOptions={[
                    intl.formatMessage({ id: 'points.dropdown_transfer' }),
                    intl.formatMessage({ id: 'points.dropdown_promote' }),
                    intl.formatMessage({ id: 'points.dropdown_boost' }),
                  ]}
                />
              )}
            </PointsContainer>
          )}
        </LoggedInContainer>
      </SafeAreaView>
    </Fragment>
  );
};

export default PointsScreen;

// const viewStyle = () => {
//   return {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   };
// };

// <Swiper loop={false} showsPagination={false} index={1}>
// <View style={viewStyle()}>
//   <Points
//     claimPoints={claimPoints}
//     fetchUserActivity={fetchUserActivity}
//     isClaiming={isClaiming}
//     isLoading={isLoading}
//     refreshing={refreshing}
//     userActivities={userActivities}
//     userPoints={userPoints}
//     handleOnDropdownSelected={handleOnDropdownSelected}
//   />
// </View>
// <View style={viewStyle()}>
//   <Points
//     claimPoints={claimPoints}
//     fetchUserActivity={fetchUserActivity}
//     isClaiming={isClaiming}
//     isLoading={isLoading}
//     refreshing={refreshing}
//     userActivities={userActivities}
//     userPoints={userPoints}
//     handleOnDropdownSelected={handleOnDropdownSelected}
//   />
// </View>
// </Swiper>
