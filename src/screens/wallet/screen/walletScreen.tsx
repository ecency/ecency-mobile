/* eslint-disable react/jsx-wrap-multilines */
import React, { useState, useEffect, useRef, Fragment } from 'react';
import { View, Text, AppState, AppStateStatus } from 'react-native';
import { isArray } from 'lodash';

// Containers
import { RefreshControl, FlatList, gestureHandlerRootHOC } from 'react-native-gesture-handler';
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
import { fetchMarketChart } from '../../../providers/coingecko/coingecko';
import ROUTES from '../../../constants/routeNames';
import { AssetDetailsScreenParams } from '../../assetDetails/screen/assetDetailsScreen';
import POINTS, { POINTS_KEYS } from '../../../constants/options/points';
import { AssetBase, ProfileToken, TokenType } from '../../../redux/reducers/walletReducer';
import {
  fetchCoinQuotes,
  resetWalletData,
  setPriceHistory,
  setSelectedAssets,
} from '../../../redux/actions/walletActions';
import DEFAULT_ASSETS from '../../../constants/defaultAssets';
import { fetchEngineMarketData } from '../../../providers/hive-engine/hiveEngine';
import { walletQueries } from '../../../providers/queries';
import { migrateSelectedTokens } from '../../../utils/migrationHelpers';
import { PortfolioItem } from '../../../providers/ecency/ecency.types';

const CHART_DAYS_RANGE = 7;

const WalletScreen = ({ navigation }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  // refs
  const appState = useRef(AppState.currentState);

  // redux
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);
  const currency = useAppSelector((state) => state.application.currency);

  const { selectedAssets, priceHistories, coinsData, updateTimestamp, quotes, ...wallet } =
    useAppSelector((state) => state.wallet);

  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  // queries
  const walletQuery = walletQueries.useAssetsQuery();
  // const unclaimedRewardsQuery = walletQueries.useUnclaimedRewardsQuery();
  const claimRewardsMutation = walletQueries.useClaimRewardsMutation();
  const updateProfileTokensMutation = walletQueries.useUpdateProfileTokensMutation();

  // state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // side-effects
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


  //add hook that checks and migrate token based on current account change
  useEffect(() => {
    const tokens = currentAccount?.about?.profile?.tokens;
    if (tokens) {
      const _migratedTokens = migrateSelectedTokens(tokens);
      if (_migratedTokens) {
       //update profile
        updateProfileTokensMutation.mutate(_migratedTokens);
      }
    }
  }, [currentAccount])

  useEffect(() => {
    _fetchPriceHistory();
  }, [selectedAssets]);

  // actions
  const populateSelectedAssets = (tokensArr:ProfileToken[]) => {
    // filter out HIVE token and hidden tokens
    return tokensArr
      .filter(({ type, meta }) => type !== TokenType.HIVE && (!meta || meta.show))
      .map(({ symbol, type }) => ({
        id: symbol,
        symbol,
        isEngine: type === TokenType.ENGINE,
        isSpk: type === TokenType.SPK,
        isChain: type === TokenType.CHAIN,
        notCrypto: false,
      }));
  };


  //TODO: redo logic to update selected assets from profile json meta
  const _updateSelectedAssetsDataFromProfileJsonMeta = () => {
    const currSelectedEngineTokens = selectedAssets.filter(
      (item) => !DEFAULT_ASSETS.some((defaultAsset) => defaultAsset.id === item.id),
    );

    if (isArray(currentAccount.about?.profile?.tokens)) {
      const _selectedAssets = populateSelectedAssets(currentAccount.about.profile.tokens);
      // check if current selected engine tokens differ from profile json meta
      if (JSON.stringify(_selectedAssets) !== JSON.stringify(currSelectedEngineTokens)) {
        dispatch(setSelectedAssets([...DEFAULT_ASSETS, ..._selectedAssets]));
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
    // unclaimedRewardsQuery.refetch();
  };

  const _fetchPriceHistory = () => {
    selectedAssets.forEach(async (token: AssetBase) => {
      const expiresAt = priceHistories[token.id]?.expiresAt || 0;
      const curTime = new Date().getTime();

      if (!token.notCrypto && curTime > expiresAt) {
        let priceData: number[] = [];

        if (token.isEngine) {
          const marketData = await fetchEngineMarketData(token.id);
          priceData = marketData.map((data) => data.close);
        } else if (token.isSpk) {
          // TODO: add request to fetch chart data if available
        } else {
          const marketChart = await fetchMarketChart(token.id, currency.currency, CHART_DAYS_RANGE);
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
    // claim using mutation;
    claimRewardsMutation.mutate({ assetId });
  };

  const _showAssetsSelectModal = () => {
    navigation.navigate(ROUTES.MODALS.ASSETS_SELECT);
  };

  const _renderItem = ({ item, index }: { item: PortfolioItem; index: number }) => {

    const unclaimedRewards = item.pendingRewards? `${item.pendingRewards.toFixed(3)} ${item.symbol}` : '';

    const _isClaimingThis = claimRewardsMutation.checkIsClaiming(item.symbol);
    const _isClaimingAny = claimRewardsMutation.checkIsClaiming();

    // const _tokenMarketData: number[] =
    //   priceHistories && priceHistories[item.id] ? priceHistories[item.id].data : [];
    // const quote = quotes && quotes[item.id];

    const _balance = item.balance + (item.savings || 0);

    // const percentChange = quote ? quote.percentChange : coinData.percentChange;

    const _onCardPress = () => {
      navigation.navigate(ROUTES.SCREENS.ASSET_DETAILS, {
        asset: item
      } as AssetDetailsScreenParams);
    };

    const _onClaimPress = () => {
      if (unclaimedRewards) {
        _claimRewards(item.symbol);
      } else if (item.symbol === 'POINTS') {
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
      <AssetCard
        symbol={item.symbol}
        name={item.name}
        iconUrl={item.iconUrl}
        // chartData={_tokenMarketData || []}
        currentValue={item.fiatPrice || 0}
        // changePercent={percentChange || 0}
        currencySymbol={currency.currencySymbol}
        ownedBalance={_balance}
        unclaimedRewards={unclaimedRewards}
        enableBuy={!item.pendingRewards && item.symbol === 'POINTS'}
        isClaiming={_isClaimingThis}
        // isLoading={unclaimedRewardsQuery.isFetching && !_isClaimingAny}
        // volume24h={coinData.volume24h}
        // precision={item.precision}
        onCardPress={_onCardPress}
        onClaimPress={_onClaimPress}
        onBoostAccountPress={_onBoostAccountPress}
        footerComponent={
          index === 0 && <HorizontalIconList options={POINTS} optionsKeys={POINTS_KEYS} />
        }

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
      <LoggedInContainer>
        {() => (
          <View style={styles.listWrapper}>
            <FlatList
              data={walletQuery.selectedData}
              // extraData={[coinsData, priceHistories, unclaimedRewardsQuery.data]}
              style={globalStyles.tabBarBottom}
              ListEmptyComponent={walletQuery.isLoading ? <PostCardPlaceHolder /> : null}
              ListHeaderComponent={_renderHeader}
              ListFooterComponent={<ManageAssetsBtn onPress={_showAssetsSelectModal} />}
              renderItem={_renderItem}
              keyExtractor={(item, index) => item.symbol + index}
              refreshControl={_refreshControl}
            />
          </View>
        )}
      </LoggedInContainer>
    </Fragment>
  );
};

export default gestureHandlerRootHOC(WalletScreen);
/* eslint-enable */
