import React, { Fragment, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import Swiper from 'react-native-swiper';
import { SafeAreaView } from 'react-native';
import get from 'lodash/get';

// Containers
import { PointsContainer, LoggedInContainer } from '../../../containers';

// Components
import { Header, Points, Transaction } from '../../../components';

// Styles
import styles from './pointsStyles';
import globalStyles from '../../../globalStyles';

const WalletScreen = () => {
  const intl = useIntl();
  const [selectedUserActivities, setSelectedUserActivities] = useState(null);
  const [selectedType, setSelectedType] = useState('points');
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <Fragment>
      <Header />
      <SafeAreaView style={styles.container}>
        <LoggedInContainer>
          {() => (
            <>
              <Swiper
                loop={false}
                showsPagination={true}
                index={0}
                onIndexChanged={index => setCurrentIndex(index)}
              >
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
                        componentDidUpdate={() => {
                          setSelectedUserActivities(userActivities);
                          setSelectedType('points');
                        }}
                        index={0}
                        showIconList
                        claim={claim}
                        setSelectedUserActivities={setSelectedUserActivities}
                        fetchUserActivity={fetchUserActivity}
                        isClaiming={isClaiming}
                        isLoading={isLoading}
                        refreshing={refreshing}
                        userActivities={userActivities}
                        unclaimedBalance={get(userPoints, 'unclaimed_points', 0)}
                        userBalance={get(userPoints, 'points')}
                        handleOnDropdownSelected={handleOnDropdownSelected}
                        type="estm"
                        dropdownOptions={dropdownOptions}
                        currentIndex={currentIndex}
                      />
                    )}
                  </PointsContainer>
                </View>
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
                        currentIndex={currentIndex}
                        componentDidUpdate={() => {
                          setSelectedUserActivities(userActivities.reverse());
                          setSelectedType('wallet');
                        }}
                        index={1}
                        showIconList
                        claim={claim}
                        setSelectedUserActivities={setSelectedUserActivities}
                        fetchUserActivity={fetchUserActivity}
                        isClaiming={isClaiming}
                        isLoading={isLoading}
                        refreshing={refreshing}
                        userActivities={userActivities}
                        unclaimedBalance={get(userPoints, 'unclaimed_points', 0)}
                        userBalance={213}
                        handleOnDropdownSelected={handleOnDropdownSelected}
                        type="estm"
                        dropdownOptions={dropdownOptions}
                      />
                    )}
                  </PointsContainer>
                </View>
              </Swiper>

              <Transaction type={selectedType} transactions={selectedUserActivities} />
            </>
          )}
        </LoggedInContainer>
      </SafeAreaView>
    </Fragment>
  );
};

export default WalletScreen;
