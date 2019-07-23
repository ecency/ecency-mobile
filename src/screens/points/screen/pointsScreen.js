import React, { PureComponent } from 'react';
import { injectIntl } from 'react-intl';
import { View } from 'react-native';

// Containers
import { PointsContainer } from '../../../containers';

// Components
import { Header } from '../../../components/header';
import { NoPost } from '../../../components/basicUIElements';
import { Points } from '../../../components/points';

// Styles
import styles from './pointsStyles';

class PointsScreen extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const { intl, isLoggedIn, handleLoginPress } = this.props;

    return (
      <View style={styles.container}>
        <Header />
        {isLoggedIn ? (
          <PointsContainer>
            {({
              handleOnPressTransfer,
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
                handleOnPressTransfer={handleOnPressTransfer}
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
      </View>
    );
  }
}

export default injectIntl(PointsScreen);
