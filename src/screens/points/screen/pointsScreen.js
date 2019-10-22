import React, { Fragment } from 'react';
import { useIntl } from 'react-intl';
import { SafeAreaView } from 'react-native';

// Containers
import { PointsContainer } from '../../../containers';

// Components
import { Header, Points, NoPost } from '../../../components';

// Styles
import styles from './pointsStyles';

const PointsScreen = ({ isLoggedIn, handleLoginPress }) => {
  const intl = useIntl();

  return (
    <Fragment>
      <Header />
      <SafeAreaView style={styles.container}>
        {isLoggedIn ? (
          <PointsContainer>
            {({
              handleOnDropdownSelected,
              claimPoints,
              fetchUserActivity,
              isClaiming,
              isDarkTheme,
              isLoading,
              refreshing,
              userActivities,
              userPoints,
            }) => (
              <Points
                claimPoints={claimPoints}
                fetchUserActivity={fetchUserActivity}
                isClaiming={isClaiming}
                isDarkTheme={isDarkTheme}
                isLoading={isLoading}
                refreshing={refreshing}
                userActivities={userActivities}
                userPoints={userPoints}
                handleOnDropdownSelected={handleOnDropdownSelected}
              />
            )}
          </PointsContainer>
        ) : (
          <NoPost
            style={styles.noPostContainer}
            isButtonText
            defaultText={intl.formatMessage({
              id: 'profile.login_to_see',
            })}
            handleOnButtonPress={handleLoginPress}
          />
        )}
      </SafeAreaView>
    </Fragment>
  );
};

export default PointsScreen;
