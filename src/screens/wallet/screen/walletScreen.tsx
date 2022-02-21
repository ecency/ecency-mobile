/* eslint-disable react/jsx-wrap-multilines */
import React, { Fragment, useState, useEffect } from 'react';
import { SafeAreaView, View, RefreshControl, Text, Alert } from 'react-native';

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
import { CoinBase, CoinData } from '../../../redux/reducers/walletReducer';
import { setCoinsData, setPriceHistory } from '../../../redux/actions/walletActions';
import { fetchCoinsData } from '../../../utils/wallet';
import { COIN_IDS } from '../../../constants/defaultCoins';
import { claimPoints } from '../../../providers/ecency/ePoint';
import { getAccount } from '../../../providers/hive/dhive';


const CHART_DAYS_RANGE = 1;

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
  const [isClaiming, setIsClaiming] = useState(false);


  useEffect(()=>{
    _fetchData();
  },[])

  const _fetchData = () => {
    if(!isLoading){
      _fetchPriceHistory();
      _fetchCoinData();
    }
  } 


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
    setIsLoading(true);
    const coinData = await fetchCoinsData(
      selectedCoins, 
      currentAccount.name, 
      currency.currency, 
      globalProps
    );
    
    console.log("Coins Data", coinData)
    dispatch(setCoinsData(coinData))
    setRefreshing(false);
    setIsLoading(false);
  }

  const _claimEcencyPoints = async () => {
    setIsClaiming(true);
    try{
      await claimPoints()
      await _fetchCoinData(); 
    }catch(error){
      Alert.alert(`${error.message}\nTry again or write to support@ecency.com`);
    }
    setIsClaiming(false);
  };

  const _claimRewardBalance = async () => {
    const account = await getAccount(currentAccount.name);

  }

  const _claimRewards = (coinId:string) => {
    switch(coinId){
      case COIN_IDS.ECENCY:{
        _claimEcencyPoints();
        break;
      }
    }
  }


  const _renderItem = ({ item, index }:{item:CoinBase, index:number}) => {
    const coinData:CoinData = coinsData[item.id] || {};

    const _tokenMarketData:number[] = priceHistories[item.id] ? priceHistories[item.id].data : [];
    const _currentValue = coinData.currentPrice || 0;
    const _balance = coinData.balance + (coinData.savings || 0);

    const _onCardPress = () => {
      navigation.navigate(ROUTES.SCREENS.COIN_DETAILS, {
        coinId:item.id
      } as CoinDetailsScreenParams)
    }

    const _onClaimPress = () => {
      if(coinData.unclaimedBalance){
        _claimRewards(item.id);
      } else if(item.id === COIN_IDS.ECENCY) {
        navigation.navigate(ROUTES.SCREENS.BOOST)
      }
    }


    
    //calculate percentage change
    //TODO: verify or find a way to get exact percent change. current change value slightly differs from coingecko wep app values
    const _pastPrice = _tokenMarketData.length > 0 && _tokenMarketData[0];
    const _latestPrice = _tokenMarketData.length > 0 && _tokenMarketData.lastItem;
    const _changePercent = _pastPrice && _latestPrice 
      ? ((_latestPrice - _pastPrice)/(_latestPrice)) * 100 : 0;

    return (
      <CoinCard 
        chartData={_tokenMarketData || []} 
        currentValue={_currentValue}
        changePercent={_changePercent}
        currencySymbol={currency.currencySymbol}
        ownedTokens={_balance}
        unclaimedRewards={coinData.unclaimedBalance}
        enableBuy={!coinData.unclaimedBalance && item.id === COIN_IDS.ECENCY}
        isClaiming={isClaiming}
        onCardPress={_onCardPress}
        onClaimPress={_onClaimPress}
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
      onRefresh={() => {_fetchData(); setRefreshing(true)}}
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
