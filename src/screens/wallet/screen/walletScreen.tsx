/* eslint-disable react/jsx-wrap-multilines */
import React, { Fragment, useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  RefreshControl,
  Text,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';

// Containers
import { FlatList, gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { useIntl } from 'react-intl';
import moment from 'moment';
import { LoggedInContainer } from '../../../containers';

// Components
import { Header, HorizontalIconList, PostCardPlaceHolder } from '../../../components';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './walletScreenStyles';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { CoinCard } from '../children';
import { fetchMarketChart, INTERVAL_HOURLY } from '../../../providers/coingecko/coingecko';
import ROUTES from '../../../constants/routeNames';
import { CoinDetailsScreenParams } from '../../coinDetails/screen/coinDetailsScreen';
import POINTS, { POINTS_KEYS } from '../../../constants/options/points';
import { CoinBase, CoinData } from '../../../redux/reducers/walletReducer';
import {
  fetchAndSetCoinsData,
  fetchCoinQuotes,
  resetWalletData,
  setPriceHistory,
} from '../../../redux/actions/walletActions';
import { COIN_IDS } from '../../../constants/defaultCoins';
import { claimPoints } from '../../../providers/ecency/ePoint';
import { claimRewardBalance, getAccount } from '../../../providers/hive/dhive';
import { toastNotification } from '../../../redux/actions/uiAction';

const CHART_DAYS_RANGE = 1;

const WalletScreen = ({ navigation }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  //refs
  const appState = useRef(AppState.currentState);

  //redux
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);
  const currency = useAppSelector((state) => state.application.currency);

  const {
    selectedCoins,
    priceHistories,
    coinsData,
    updateTimestamp,
    quotes,
    ...wallet
  } = useAppSelector((state) => state.wallet);

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinHash = useAppSelector((state) => state.application.pin);

  //state
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  //side-effects
  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', _handleAppStateChange);

    //if coinsData is empty, initilise wallet without a fresh acount fetch
    _fetchData(Object.keys(coinsData).length ? true : false);

    return ()=>{
      if(appStateSub){
        appStateSub.remove()
      }
    };
  }, []);

  useEffect(() => {
    if (currency.currency !== wallet.vsCurrency || currentAccount.username !== wallet.username) {
      dispatch(resetWalletData());
      _fetchData(true);
    }
  }, [currency, currentAccount]);



  //actions
  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('updating selected coins data on app resume');
      _fetchCoinsData(true);
    }
    appState.current = nextAppState;
  };

  const _fetchData = (refresh?: boolean) => {
    if (!isLoading) {
      _fetchPriceHistory();
      _fetchCoinsData(refresh);
    }
  };

  const _fetchPriceHistory = () => {
    selectedCoins.forEach(async (token: CoinBase) => {
      const expiresAt = priceHistories[token.id]?.expiresAt || 0;
      const curTime = new Date().getTime();

      if (!token.notCrypto && curTime > expiresAt) {
        const marketChart = await fetchMarketChart(
          token.id,
          currency.currency,
          CHART_DAYS_RANGE,
          INTERVAL_HOURLY,
        );
        const priceData = marketChart.prices.map((item) => item.yValue);
        dispatch(setPriceHistory(token.id, currency.currency, priceData));
      }
    });
  };

  const _fetchCoinsData = async (refresh?: boolean) => {
    setIsLoading(true);
    if (refresh || !quotes) {
      dispatch(fetchCoinQuotes());
    }
    await dispatch(fetchAndSetCoinsData(refresh));

    setRefreshing(false);
    setIsLoading(false);
  };

  const _claimEcencyPoints = async () => {
    setIsClaiming(true);
    try {
      await claimPoints();
      await _fetchCoinsData(true);
    } catch (error) {
      Alert.alert(`${error.message}\nTry again or write to support@ecency.com`);
    }
    setIsClaiming(false);
  };

  const _claimRewardBalance = async () => {
    setIsClaiming(true);
    try {
      const account = await getAccount(currentAccount.name);
      await claimRewardBalance(
        currentAccount,
        pinHash,
        account.reward_hive_balance,
        account.reward_hbd_balance,
        account.reward_vesting_balance,
      );
      await _fetchCoinsData(true);
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.claim_reward_balance_ok',
          }),
        ),
      );
    } catch (error) {
      Alert.alert(intl.formatMessage({ id: 'alert.claim_failed' }, { message: error.message }));
    }
    setIsClaiming(false);
  };

  const _claimRewards = (coinId: string) => {
    if (isLoading) {
      setRefreshing(true);
      Alert.alert(intl.formatMessage({ id: 'alert.wallet_updating' }));
      return;
    }
    switch (coinId) {
      case COIN_IDS.ECENCY:
        _claimEcencyPoints();
        break;

      case COIN_IDS.HP:
        _claimRewardBalance();
        break;
    }
  };

  const _renderItem = ({ item, index }: { item: CoinBase; index: number }) => {
    const coinData: CoinData = coinsData[item.id] || {};

    const _tokenMarketData: number[] = priceHistories[item.id] ? priceHistories[item.id].data : [];

    const _balance = coinData.balance + (coinData.savings || 0);
    const quote = quotes ? quotes[item.id] : {};

    const _onCardPress = () => {
      navigation.navigate(ROUTES.SCREENS.COIN_DETAILS, {
        coinId: item.id,
      } as CoinDetailsScreenParams);
    };

    const _onClaimPress = () => {
      if (coinData.unclaimedBalance) {
        _claimRewards(item.id);
      } else if (item.id === COIN_IDS.ECENCY) {
        navigation.navigate(ROUTES.SCREENS.BOOST);
      }
    };

    const _onBoostAccountPress = () => {
      navigation.navigate({
        name: ROUTES.SCREENS.ACCOUNT_BOOST,
        params: {
          username: currentAccount.name,
        },
      });
    };

    return (
      <CoinCard
        chartData={_tokenMarketData || []}
        currentValue={quote.price || 0}
        changePercent={quote.percentChange || 0}
        currencySymbol={currency.currencySymbol}
        ownedTokens={_balance}
        unclaimedRewards={coinData.unclaimedBalance}
        enableBuy={!coinData.unclaimedBalance && item.id === COIN_IDS.ECENCY}
        isClaiming={isClaiming}
        isLoading={isLoading}
        onCardPress={_onCardPress}
        onClaimPress={_onClaimPress}
        onBoostAccountPress={_onBoostAccountPress}
        footerComponent={
          index === 0 && <HorizontalIconList options={POINTS} optionsKeys={POINTS_KEYS} />
        }
        {...item}
      />
    );
  };

  const _renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.lastUpdateText}>
          {isLoading
            ? intl.formatMessage({ id: 'wallet.updating' })
            : `${intl.formatMessage({ id: 'wallet.last_updated' })} ${moment(
                updateTimestamp,
              ).format('HH:mm:ss')}`}
        </Text>
      </View>
    );
  };

  const _refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => {
        _fetchData(true);
        setRefreshing(true);
      }}
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
                data={updateTimestamp ? selectedCoins : []}
                extraData={[coinsData, priceHistories]}
                style={globalStyles.tabBarBottom}
                ListEmptyComponent={<PostCardPlaceHolder />}
                ListHeaderComponent={_renderHeader}
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

export default gestureHandlerRootHOC(WalletScreen);
/* eslint-enable */
