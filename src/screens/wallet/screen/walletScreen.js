import React, { Fragment, useState } from 'react';
import Swiper from 'react-native-swiper';
import { SafeAreaView, Animated, ScrollView, Text } from 'react-native';

// Containers
import { LoggedInContainer } from '../../../containers';

// Components
import { Header, Transaction } from '../../../components';
import EstmView from './estmView';
import SteemView from './steemView';
import SpView from './spView';
import SbdView from './sbdView';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './walletScreenStyles';

const HEADER_EXPANDED_HEIGHT = 260;
const HEADER_COLLAPSED_HEIGHT = 20;
const WALLETS = ['ESTM', 'STEEM', 'SBD', 'SP'];

const WalletScreen = () => {
  const [selectedUserActivities, setSelectedUserActivities] = useState(null);
  const [isLoading, setIsLoading] = useState('points');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [isScroll, setScroll] = useState(false);

  const _handleSwipeItemChange = (userActivities, _isLoading) => {
    setSelectedUserActivities(userActivities);
    setIsLoading(_isLoading);
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT],
    outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
    extrapolate: 'clamp',
  });

  return (
    <Fragment>
      <Header />
      <SafeAreaView style={globalStyles.defaultContainer}>
        <LoggedInContainer>
          {() => (
            <>
              <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Swiper
                  loop={false}
                  showsPagination={true}
                  index={0}
                  onIndexChanged={index => setCurrentIndex(index)}
                >
                  <EstmView
                    index={0}
                    handleOnSelected={_handleSwipeItemChange}
                    refreshing={refreshing}
                    currentIndex={currentIndex}
                  />
                  <SteemView
                    index={1}
                    handleOnSelected={_handleSwipeItemChange}
                    refreshing={refreshing}
                    currentIndex={currentIndex}
                  />
                  <SbdView
                    index={2}
                    handleOnSelected={_handleSwipeItemChange}
                    refreshing={refreshing}
                    currentIndex={currentIndex}
                  />
                  <SpView
                    index={3}
                    refreshing={refreshing}
                    handleOnSelected={_handleSwipeItemChange}
                    currentIndex={currentIndex}
                  />
                </Swiper>
              </Animated.View>
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                onScroll={Animated.event([
                  {
                    nativeEvent: {
                      contentOffset: {
                        y: scrollY,
                      },
                    },
                  },
                ])}
                scrollEventThrottle={16}
              >
                <Transaction
                  type="wallet"
                  transactions={selectedUserActivities}
                  refreshing={refreshing}
                  setRefreshing={setRefreshing}
                  isLoading={isLoading}
                />
              </ScrollView>
            </>
          )}
        </LoggedInContainer>
      </SafeAreaView>
    </Fragment>
  );
};

export default WalletScreen;
