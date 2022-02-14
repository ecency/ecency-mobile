/* eslint-disable react/jsx-wrap-multilines */
import React, { Fragment, useState, useEffect } from 'react';
import Swiper from 'react-native-swiper';
import { SafeAreaView, View, RefreshControl, Text } from 'react-native';

// Containers
import { FlatList } from 'react-native-gesture-handler';
import { useIntl } from 'react-intl';
import { iteratorStream } from '@hiveio/dhive/lib/utils';
import { LoggedInContainer } from '../../../containers';

// Components
import {
  Header,
  Transaction,
  HorizontalIconList,
  ListPlaceHolder,
  CollapsibleCard,
} from '../../../components';
import EstmView from './estmView';
import HiveView from './hiveView';
import HpView from './hpView';
import HbdView from './hbdView';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './walletScreenStyles';

import { useAppSelector } from '../../../hooks';
import {CoinCard} from '../children';
import WALLET_TOKENS from '../../../constants/walletTokens';
import { fetchMarketChart } from '../../../providers/coingecko/coingecko';
import { withNavigation } from 'react-navigation';
import ROUTES from '../../../constants/routeNames';


const WalletScreen = ({navigation}) => {
  const intl = useIntl();


  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);
  const currency = useAppSelector((state)=>state.application.currency)

  const [selectedUserActivities, setSelectedUserActivities] = useState(null);
  const [filteredActivites, setFilteredActivites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const [marketData, setMarketData] = useState([]);

  useEffect(()=>{
    _fetchTokensData();
  },[])

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

  const _fetchTokensData = () => {
    WALLET_TOKENS.forEach(async (token, index)=>{

      if(token.coingeckoId === 'ececny'){
        setMarketData([])
        
      }

      const marketChart = await fetchMarketChart(token.coingeckoId, currency.currency, 3, 'hourly');
      marketData[index] = marketChart.prices.map(item=>item.yValue);
      setMarketData([...marketData]);
    })
  }

  // const _handleSwipeItemChange = (userActivities, _isLoading) => {
  //   setSelectedUserActivities(userActivities);
  //   setIsLoading(_isLoading);
  //   setRefreshing(false);
  // };

  // const _renderHeaderComponent = () => {
  //   return (
  //     <>
  //       <CollapsibleCard
  //         expanded={true}
  //         isExpanded={isExpanded}
  //         noContainer
  //         noBorder
  //         locked
  //         titleComponent={<View />}
  //         handleOnExpanded={() => {
  //           setIsExpanded(true);
  //         }}
  //       >
  //         <View style={[styles.header, { height: HEADER_EXPANDED_HEIGHT }]}>
  //           <Swiper
  //             loop={false}
  //             showsPagination={true}
  //             index={0}
  //             dotStyle={styles.dotStyle}
  //             onIndexChanged={(index) => setCurrentIndex(index)}
  //           >
  //             <EstmView
  //               index={0}
  //               handleOnSelected={_handleSwipeItemChange}
  //               refreshing={refreshing}
  //               currentIndex={currentIndex}
  //             />
  //             <HiveView
  //               index={1}
  //               handleOnSelected={_handleSwipeItemChange}
  //               refreshing={refreshing}
  //               currentIndex={currentIndex}
  //             />
  //             <HbdView
  //               index={2}
  //               handleOnSelected={_handleSwipeItemChange}
  //               refreshing={refreshing}
  //               currentIndex={currentIndex}
  //             />
  //             <HpView
  //               index={3}
  //               refreshing={refreshing}
  //               handleOnSelected={_handleSwipeItemChange}
  //               currentIndex={currentIndex}
  //             />
  //           </Swiper>
  //         </View>
  //       </CollapsibleCard>

  //       <SafeAreaView style={styles.header}>
  //         {currentIndex === 0 && <HorizontalIconList options={POINTS} optionsKeys={POINTS_KEYS} />}
  //       </SafeAreaView>
  //     </>
  //   );
  // };

  const _renderItem = ({ item, index }) => {

    const _onPress = () => {
      navigation.navigate(ROUTES.SCREENS.COIN_DETAILS)
    }

    const _tokenMarketData = marketData[index] || [];
    const _currentValue = item.id == 'Ecency' ? 1/150 : (_tokenMarketData[0] || 0);
    const _changePercent = 
    _tokenMarketData.length > 0 ? 
      ((_tokenMarketData[_tokenMarketData.length - 1] - _tokenMarketData[0])/(_tokenMarketData[_tokenMarketData.length - 1]))*100
      :
      0;
    return (
        <CoinCard 
          chartData={_tokenMarketData || []} 
          currentValue={_currentValue}
          changePercent={_changePercent}
          currencySymbol={currency.currencySymbol}
          ownedTokens={150}
          onPress={_onPress}
          {...item} />
      );
  };

  const _renderLoading = () => {
    if (isLoading) {
      return <ListPlaceHolder />;
    }

    return (
      <Text style={globalStyles.hintText}>{intl.formatMessage({ id: 'wallet.no_activity' })}</Text>
    );
  };

  const _refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => setRefreshing(true)}
      progressBackgroundColor="#357CE6"
      tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
      titleColor="#fff"
      colors={['#fff']}
    />
  );

  const _onScroll = (evt) => {
    console.log(evt);
    const expanded = evt.nativeEvent.contentOffset.y < 10;
    if (isExpanded !== expanded) {
      setIsExpanded(expanded);
    }
  };

  return (
    <Fragment>
      <Header />
      <SafeAreaView style={globalStyles.defaultContainer}>
        <LoggedInContainer>
          {() => (
            <View style={styles.listWrapper}>
              <FlatList
                data={WALLET_TOKENS}
                extraData={marketData}
                style={globalStyles.tabBarBottom}
                ListEmptyComponent={_renderLoading}
                renderItem={_renderItem}
                keyExtractor={(item, index) => index.toString()}
                maxToRenderPerBatch={5}
                initialNumToRender={5}
                refreshControl={_refreshControl}
                windowSize={5}
                onScroll={_onScroll}
                onScrollToTop={() => {
                  setIsExpanded(true);
                }}
              />
            </View>
          )}
        </LoggedInContainer>
      </SafeAreaView>
    </Fragment>
  );
};

export default withNavigation(WalletScreen);
/* eslint-enable */
