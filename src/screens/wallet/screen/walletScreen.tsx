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
import { AssetCard } from '../children';
import { fetchMarketChart, INTERVAL_HOURLY } from '../../../providers/coingecko/coingecko';
import ROUTES from '../../../constants/routeNames';
import { AssetDetailsScreenParams } from '../../assetDetails/screen/assetDetailsScreen';
import POINTS, { POINTS_KEYS } from '../../../constants/options/points';
import { CoinBase, CoinData } from '../../../redux/reducers/walletReducer';
import {
  fetchCoinQuotes,
  resetWalletData,
  setPriceHistory,
  updateUnclaimedBalance,
} from '../../../redux/actions/walletActions';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { claimPoints } from '../../../providers/ecency/ePoint';
import { claimRewardBalance, getAccount } from '../../../providers/hive/dhive';
import { toastNotification } from '../../../redux/actions/uiAction';
import { ManageAssets } from '../children/manageAssets';
import { claimRewards } from '../../../providers/hive-engine/hiveEngineActions';
import { fetchEngineMarketData } from '../../../providers/hive-engine/hiveEngine';
import { useGetAssetsQuery, useUnclaimedRewardsQuery } from '../../../providers/queries';


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

  //queries
  const walletQuery = useGetAssetsQuery()
  const unclaimedRewardsQuery = useUnclaimedRewardsQuery();

  //state
  const [isClaimingColl, setIsClaimingColl] = useState<{[key:string]:boolean}>({});
  const isClaimingCollRef = useRef(isClaimingColl);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(()=>{
    isClaimingCollRef.current = isClaimingColl;
  },[isClaimingColl])

  //side-effects
  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', _handleAppStateChange);

    _fetchPriceHistory();

    return () => {
      if (appStateSub) {
        appStateSub.remove()
      }
    };
  }, []);

  useEffect(() => {
    if (currency.currency !== wallet.vsCurrency || currentAccount.username !== wallet.username) {
      dispatch(resetWalletData());
      _refetchData();
    }
  }, [currency, currentAccount]);

  useEffect(() => {
    _fetchPriceHistory();
  }, [selectedCoins])



  //actions
  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('updating selected coins data on app resume');
      _refetchData();

    }
    appState.current = nextAppState;
  };

  const _refetchData = () => {
    _fetchPriceHistory();
    _refetchCoinsData(); 
    unclaimedRewardsQuery.refetch();
  };


  const _fetchPriceHistory = () => {
    selectedCoins.forEach(async (token: CoinBase) => {
      const expiresAt = priceHistories[token.id]?.expiresAt || 0;
      const curTime = new Date().getTime();

      if (!token.notCrypto && curTime > expiresAt) {
        let priceData: number[] = [];
        if (token.isEngine) {
          const marketData = await fetchEngineMarketData(token.id)
          priceData = marketData.map(data => data.close);
        } else {
          const marketChart = await fetchMarketChart(
            token.id,
            currency.currency,
            CHART_DAYS_RANGE,
            INTERVAL_HOURLY,
          );
          priceData = marketChart.prices.map((item) => item.yValue)
        }

        dispatch(setPriceHistory(token.id, currency.currency, priceData));

      }
    });
  };

  const _refetchCoinsData = async () => {

    if (!quotes) {
      dispatch(fetchCoinQuotes());
    }

    await walletQuery.refetch()
    setIsRefreshing(false);
  };

  const _claimEcencyPoints = async (assetId:string) => {
    
    try {
      setIsClaimingColl({...isClaimingCollRef.current, [assetId]:true});
      await claimPoints();
      await unclaimedRewardsQuery.refetch();
      setIsClaimingColl({...isClaimingCollRef.current, [assetId]:false});
      await _refetchCoinsData();
    } catch (error) {
      setIsClaimingColl({...isClaimingCollRef.current, [assetId]:false});
      Alert.alert(`${error.message}\nTry again or write to support@ecency.com`);
    }
    
  };

  const _claimRewardBalance = async (assetId:string) => {
    
    try {
      setIsClaimingColl({...isClaimingCollRef.current, [assetId]:true});
      const account = await getAccount(currentAccount.name);
      await claimRewardBalance(
        currentAccount,
        pinHash,
        account.reward_hive_balance,
        account.reward_hbd_balance,
        account.reward_vesting_balance,
      );
      await unclaimedRewardsQuery.refetch();
      setIsClaimingColl({...isClaimingCollRef.current, [assetId]:false});
      await _refetchCoinsData();
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.claim_reward_balance_ok',
          }),
        ),
      );
    } catch (error) {
      setIsClaimingColl({...isClaimingCollRef.current, [assetId]:false});
      Alert.alert(intl.formatMessage({ id: 'alert.claim_failed' }, { message: error.message }));
    }
    
  };

  const _claimEngineBalance = async (symbol: string) => {
    try {
      setIsClaimingColl({...isClaimingCollRef.current, [symbol]:true});
      await claimRewards([symbol], currentAccount, pinHash);
      await unclaimedRewardsQuery.refetch();
      setIsClaimingColl({...isClaimingCollRef.current, [symbol]:false});
      await _refetchCoinsData();
      dispatch(
        updateUnclaimedBalance(symbol, '')
      )
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'alert.claim_reward_balance_ok',
          }),
        ),
      );
    } catch (error) {
      setIsClaimingColl({...isClaimingCollRef.current, [symbol]:false});
      Alert.alert(intl.formatMessage({ id: 'alert.claim_failed' }, { message: error.message }));
    }
    
  }

  const _claimRewards = (assetId: string) => {
    switch (assetId) {
      case ASSET_IDS.ECENCY:
        _claimEcencyPoints(assetId);
        break;

      case ASSET_IDS.HP:
        _claimRewardBalance(assetId);
        break;
      default:
        _claimEngineBalance(assetId)
        break;
    }
  };

  const _renderItem = ({ item, index }: { item: CoinBase; index: number }) => {
    const coinData: CoinData = coinsData[item.id];
    const unclaimedRewards = (unclaimedRewardsQuery.data && unclaimedRewardsQuery.data[item.id]) || '';

    if (!coinData) {
      return null;
    }

    const _isClaimingThis = isClaimingColl[item.id] || false;
    let _isClaimingAny = false;
    for(let key in isClaimingColl){
      if(isClaimingColl[key] === true){
        _isClaimingAny = true;
      }
    }

    const _tokenMarketData: number[] = priceHistories[item.id] ? priceHistories[item.id].data : [];

    const _balance = coinData.balance + (coinData.savings || 0);
    const quote = quotes && quotes[item.id];

    const percentChange = quote ? quote.percentChange : coinData.percentChange;

    const _onCardPress = () => {
      navigation.navigate(ROUTES.SCREENS.ASSET_DETAILS, {
        coinId: item.id,
      } as AssetDetailsScreenParams);
    };

    const _onClaimPress = () => {
      if (unclaimedRewards) {
        _claimRewards(item.id);
      } else if (item.id === ASSET_IDS.ECENCY) {
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

    if (!coinData) {
      return null;
    }



    return (
      <AssetCard
        name={coinData.name}
        iconUrl={coinData.iconUrl}
        chartData={_tokenMarketData || []}
        currentValue={quote?.price || coinData?.currentPrice || 0}
        changePercent={percentChange || 0}
        currencySymbol={currency.currencySymbol}
        ownedBalance={_balance}
        unclaimedRewards={unclaimedRewards}
        enableBuy={!coinData.unclaimedBalance && item.id === ASSET_IDS.ECENCY}
        isClaiming={_isClaimingThis}
        isLoading={unclaimedRewardsQuery.isFetching && !_isClaimingAny}
        volume24h={coinData.volume24h}
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
          {walletQuery.isFetching
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
      refreshing={isRefreshing}
      onRefresh={() => {
        if(!isRefreshing){
          setIsRefreshing(true)
          _refetchData();
        }
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
                extraData={[coinsData, priceHistories, isClaimingColl, unclaimedRewardsQuery.data]}
                style={globalStyles.tabBarBottom}
                ListEmptyComponent={<PostCardPlaceHolder />}
                ListHeaderComponent={_renderHeader}
                ListFooterComponent={<ManageAssets />}
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
