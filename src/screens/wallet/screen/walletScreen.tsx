/* eslint-disable react/jsx-wrap-multilines */
import React, { Fragment, useState, useEffect } from 'react';
import { SafeAreaView, View, RefreshControl, Text } from 'react-native';

// Containers
import { FlatList } from 'react-native-gesture-handler';
import { useIntl } from 'react-intl';
import { LoggedInContainer } from '../../../containers';

// Components
import {
  Header,
  HorizontalIconList,
  ListPlaceHolder,
} from '../../../components';


// Styles
import globalStyles from '../../../globalStyles';
import styles from './walletScreenStyles';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import {CoinCard} from '../children';
import { fetchMarketChart, INTERVAL_HOURLY } from '../../../providers/coingecko/coingecko';
import { withNavigation } from 'react-navigation';
import ROUTES from '../../../constants/routeNames';
import { CoinDetailsScreenParams } from '../../coinDetails/screen/coinDetailsScreen';
import POINTS, { POINTS_KEYS } from '../../../constants/options/points';
import { CoinBase } from '../../../redux/reducers/walletReducer';
import { setCoinsData, setPriceHistory } from '../../../redux/actions/walletActions';
import { fetchCoinsData } from '../../../utils/wallet';


const CHART_DAYS_RANGE = 3;

const WalletScreen = ({navigation}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);
  const currency = useAppSelector((state)=>state.application.currency);
  const selectedCoins = useAppSelector((state)=>state.wallet.selectedCoins);
  const priceHistories = useAppSelector((state)=>state.wallet.priceHistories);
  const coinsData = useAppSelector((state)=>state.wallet.coinsData);
  const globalProps = useAppSelector((state)=>state.account.globalProps);
  const currentAccount = useAppSelector((state)=>state.account.currentAccount);

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(()=>{
    _fetchPriceHistory();
    _fetchCoinData();
  },[])


  const _fetchPriceHistory = () => {
    selectedCoins.forEach(async (token:CoinBase)=>{

      if(token.id !== 'ececny'){
        const marketChart = await fetchMarketChart(token.id, currency.currency, CHART_DAYS_RANGE, INTERVAL_HOURLY);
        const priceData = marketChart.prices.map(item=>item.yValue);
        dispatch(setPriceHistory(token.id, currency.currency, priceData));
      }
      
    })
  }

  const _fetchCoinData = async () => {
    const coinData = await fetchCoinsData(
      selectedCoins, 
      currentAccount.name, 
      currency.currency, 
      globalProps
    );
    
    console.log("Coins Data", coinData)
    dispatch(setCoinsData(coinData))
  }


  const _renderItem = ({ item, index }:{item:CoinBase, index:number}) => {

    const _onPress = () => {
      navigation.navigate(ROUTES.SCREENS.COIN_DETAILS, {
        coinId:item.id
      } as CoinDetailsScreenParams)
    }

    const coinData = coinsData[item.id] || {};

    const _tokenMarketData = priceHistories[item.id] ? priceHistories[item.id].data : [];
    const _currentValue = item.id == 'ecency' ? 1/150 : (coinData.currentPrice || 0);
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
        footerComponent={index === 0 && <HorizontalIconList options={POINTS} optionsKeys={POINTS_KEYS} />}
        {...item} />
    );
  };

  const _renderLoading = () => {
    if (isLoading) {
      return <ListPlaceHolder />;
    }
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


  return (
    <Fragment>
      <Header />
      <SafeAreaView style={globalStyles.defaultContainer}>
        <LoggedInContainer>
          {() => (
            <View style={styles.listWrapper}>
              <FlatList
                data={selectedCoins}
                extraData={coinsData}
                style={globalStyles.tabBarBottom}
                ListEmptyComponent={_renderLoading}
                renderItem={_renderItem}
                keyExtractor={(item, index) => index.toString()}
                refreshControl={_refreshControl}
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
