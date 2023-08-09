/* eslint-disable react/jsx-wrap-multilines */
import React, { Fragment, useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, RefreshControl, Text, AppState, AppStateStatus } from 'react-native';
import { isArray } from 'lodash';

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
import { AssetCard, ManageAssetsBtn } from '../children';
import { ChartInterval, fetchMarketChart } from '../../../providers/coingecko/coingecko';
import ROUTES from '../../../constants/routeNames';
import { AssetDetailsScreenParams } from '../../assetDetails/screen/assetDetailsScreen';
import POINTS, { POINTS_KEYS } from '../../../constants/options/points';
import { CoinBase, CoinData } from '../../../redux/reducers/walletReducer';
import {
  fetchCoinQuotes,
  resetWalletData,
  setPriceHistory,
  setSelectedCoins,
} from '../../../redux/actions/walletActions';
import DEFAULT_ASSETS, { ASSET_IDS } from '../../../constants/defaultAssets';
import { fetchEngineMarketData } from '../../../providers/hive-engine/hiveEngine';
import { walletQueries } from '../../../providers/queries';

const CHART_DAYS_RANGE = 7;

const WalletScreen = ({ navigation }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  //refs
  const appState = useRef(AppState.currentState);

  //redux
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);
  const currency = useAppSelector((state) => state.application.currency);

  const { selectedCoins, priceHistories, coinsData, updateTimestamp, quotes, ...wallet } =
    useAppSelector((state) => state.wallet);

  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  //queries
  const walletQuery = walletQueries.useAssetsQuery();
  const unclaimedRewardsQuery = walletQueries.useUnclaimedRewardsQuery();
  const claimRewardsMutation = walletQueries.useClaimRewardsMutation();

  //state
  const [isRefreshing, setIsRefreshing] = useState(false);

  //side-effects
  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', _handleAppStateChange);

    _fetchPriceHistory();

    return () => {
      if (appStateSub) {
        appStateSub.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (currency.currency !== wallet.vsCurrency || currentAccount.username !== wallet.username) {
      dispatch(resetWalletData());
      _refetchData();
    }
    _updateSelectedAssetsDataFromProfileJsonMeta();
  }, [currency, currentAccount]);

  useEffect(() => {
    _fetchPriceHistory();
  }, [selectedCoins]);

  //actions
  const populateSelectedAssets = (tokensArr) => {
    return tokensArr.map(({symbol, type}) => ({
      id: symbol,
      symbol,
      isEngine: type === 'ENGINE',
      isSpk: type === 'SPK',
      notCrypto: false,
    }));
  };

  const _updateSelectedAssetsDataFromProfileJsonMeta = () => {
    const currSelectedEngineTokens = selectedCoins.filter(
      (item) => !DEFAULT_ASSETS.some((defaultAsset) => defaultAsset.id === item.id),
    );

    if (isArray(currentAccount.about?.profile?.tokens)) {
      const _selectedAssets = populateSelectedAssets(
        currentAccount.about.profile.tokens,
      );
      // check if current selected engine tokens differ from profile json meta
      if (JSON.stringify(_selectedAssets) !== JSON.stringify(currSelectedEngineTokens)) {
        dispatch(setSelectedCoins([...DEFAULT_ASSETS, ..._selectedAssets]));
      }
    }

  };

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
          const marketData = await fetchEngineMarketData(token.id);
          priceData = marketData.map((data) => data.close);

        } else if(token.isSpk){
          //TODO: add request to fetch chart data if available

        } else {
          const marketChart = await fetchMarketChart(
            token.id,
            currency.currency,
            CHART_DAYS_RANGE,
          );
          priceData = marketChart.prices.map((item) => item.yValue);
        }

        dispatch(setPriceHistory(token.id, currency.currency, priceData));
      }
    });
  };

  const _refetchCoinsData = async () => {
    if (!quotes) {
      dispatch(fetchCoinQuotes());
    }

    await walletQuery.refetch();
    setIsRefreshing(false);
  };

  const _claimRewards = (assetId: string) => {
    //claim using mutation;
    claimRewardsMutation.mutate({ assetId });
  };

  const _showAssetsSelectModal = () => {
    navigation.navigate(ROUTES.MODALS.ASSETS_SELECT)
  };


  const _renderItem = ({ item, index }: { item: CoinBase; index: number }) => {
    const coinData: CoinData = coinsData[item.id];
    const unclaimedRewards =
      (unclaimedRewardsQuery.data && unclaimedRewardsQuery.data[item.id]) || '';

    if (!coinData) {
      return null;
    }

    const _isClaimingThis = claimRewardsMutation.checkIsClaiming(item.id);
    const _isClaimingAny = claimRewardsMutation.checkIsClaiming();

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
        precision={coinData.precision}
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
        if (!isRefreshing) {
          setIsRefreshing(true);
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
                extraData={[coinsData, priceHistories, unclaimedRewardsQuery.data]}
                style={globalStyles.tabBarBottom}
                ListEmptyComponent={<PostCardPlaceHolder />}
                ListHeaderComponent={_renderHeader}
                ListFooterComponent={<ManageAssetsBtn onPress={_showAssetsSelectModal} />}
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
