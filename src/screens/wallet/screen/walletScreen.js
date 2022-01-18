/* eslint-disable react/jsx-wrap-multilines */
import React, { Fragment, useState, useEffect } from 'react';
import Swiper from 'react-native-swiper';
import { SafeAreaView, View, RefreshControl, Text } from 'react-native';

// Containers
import { FlatList } from 'react-native-gesture-handler';
import { useIntl } from 'react-intl';
import { LoggedInContainer, ThemeContainer } from '../../../containers';

// Components
import { Header, Transaction, HorizontalIconList, ListPlaceHolder } from '../../../components';
import EstmView from './estmView';
import HiveView from './hiveView';
import HpView from './hpView';
import HbdView from './hbdView';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './walletScreenStyles';

import POINTS, { POINTS_KEYS } from '../../../constants/options/points';

const HEADER_EXPANDED_HEIGHT = 260;

const WalletScreen = () => {
  const intl = useIntl();
  const [selectedUserActivities, setSelectedUserActivities] = useState(null);
  const [filteredActivites, setFilteredActivites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (selectedUserActivities) {
      const activities = selectedUserActivities
        ? selectedUserActivities.filter((item) => {
            return (
              item &&
              item.value &&
              item.value.indexOf(['Points', 'HIVE', 'HBD', 'HP'][currentIndex]) > -1
            );
          })
        : [];
      setFilteredActivites(activities);
    } else {
      setFilteredActivites([]);
    }
  }, [selectedUserActivities]);

  const _handleSwipeItemChange = (userActivities, _isLoading) => {
    setSelectedUserActivities(userActivities);
    setIsLoading(_isLoading);
    setRefreshing(false);
  };

  const _renderHeaderComponent = () => {
    return (
      <>
        <View style={[styles.header, { height: HEADER_EXPANDED_HEIGHT }]}>
          <Swiper
            loop={false}
            showsPagination={true}
            index={0}
            dotStyle={styles.dotStyle}
            onIndexChanged={(index) => setCurrentIndex(index)}
          >
            <EstmView
              index={0}
              handleOnSelected={_handleSwipeItemChange}
              refreshing={refreshing}
              currentIndex={currentIndex}
            />
            <HiveView
              index={1}
              handleOnSelected={_handleSwipeItemChange}
              refreshing={refreshing}
              currentIndex={currentIndex}
            />
            <HbdView
              index={2}
              handleOnSelected={_handleSwipeItemChange}
              refreshing={refreshing}
              currentIndex={currentIndex}
            />
            <HpView
              index={3}
              refreshing={refreshing}
              handleOnSelected={_handleSwipeItemChange}
              currentIndex={currentIndex}
            />
          </Swiper>
        </View>
        <SafeAreaView style={styles.header}>
          {currentIndex === 0 && <HorizontalIconList options={POINTS} optionsKeys={POINTS_KEYS} />}
        </SafeAreaView>
      </>
    );
  };

  const _renderItem = ({ item, index }) => {
    return <Transaction type={currentIndex} item={item} index={index} />;
  };

  const _refreshControl = () => (
    <ThemeContainer>
      {(isDarkTheme) => (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => setRefreshing(true)}
          progressBackgroundColor="#357CE6"
          tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
          titleColor="#fff"
          colors={['#fff']}
        />
      )}
    </ThemeContainer>
  );

  const _renderLoading = () => {
    if (isLoading) {
      return <ListPlaceHolder />;
    }

    return (
      <Text style={globalStyles.hintText}>{intl.formatMessage({ id: 'wallet.no_activity' })}</Text>
    );
  };

  return (
    <Fragment>
      <Header />
      <SafeAreaView style={globalStyles.defaultContainer}>
        <LoggedInContainer>
          {() => (
            <>
              {_renderHeaderComponent()}
              <View style={globalStyles.listWrapper}>
                <FlatList
                  data={filteredActivites}
                  style={globalStyles.tabBarBottom}
                  ListEmptyComponent={_renderLoading}
                  renderItem={_renderItem}
                  keyExtractor={(item, index) => index.toString()}
                  // ListHeaderComponent={_renderHeaderComponent}
                  maxToRenderPerBatch={5}
                  initialNumToRender={5}
                  refreshControl={_refreshControl}
                  windowSize={5}
                />
              </View>
            </>
          )}
        </LoggedInContainer>
      </SafeAreaView>
    </Fragment>
  );
};

export default WalletScreen;
/* eslint-enable */
