/* eslint-disable react/jsx-wrap-multilines */
import React, { useEffect, useRef, Fragment } from 'react';
import { View, AppState, AppStateStatus } from 'react-native';
import { isArray } from 'lodash';

// Containers
import { RefreshControl, FlatList, gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { LoggedInContainer } from '../../../containers';

// Components
import { Header, HorizontalIconList, PostCardPlaceHolder } from '../../../components';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './walletScreenStyles';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { AssetCard, WalletHeader } from '../children';
import ROUTES from '../../../constants/routeNames';
import { AssetDetailsScreenParams } from '../../assetDetails/screen/assetDetailsScreen';
import POINTS, { POINTS_KEYS } from '../../../constants/options/points';
import { ProfileToken, TokenType } from '../../../redux/reducers/walletReducer';
import {
  fetchCoinQuotes,
  resetWalletData,
  setSelectedAssets,
} from '../../../redux/actions/walletActions';
import DEFAULT_ASSETS from '../../../constants/defaultAssets';
import { walletQueries } from '../../../providers/queries';
import { migrateSelectedTokens } from '../../../utils/migrationHelpers';
import { PortfolioItem } from '../../../providers/ecency/ecency.types';

const WalletScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();

  // refs
  const appState = useRef(AppState.currentState);

  // redux
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);
  const currency = useAppSelector((state) => state.application.currency);

  const { selectedAssets, quotes, ...wallet } = useAppSelector((state) => state.wallet);

  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  // queries
  const walletQuery = walletQueries.useAssetsQuery();
  // const unclaimedRewardsQuery = walletQueries.useUnclaimedRewardsQuery();
  const claimRewardsMutation = walletQueries.useClaimRewardsMutation();
  const updateProfileTokensMutation = walletQueries.useUpdateProfileTokensMutation();

  // side-effects
  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', _handleAppStateChange);

    // _fetchPriceHistory();

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

  // add hook that checks and migrate token based on current account change
  useEffect(() => {
    const tokens = currentAccount?.about?.profile?.tokens;
    if (tokens) {
      const _migratedTokens = migrateSelectedTokens(tokens);
      if (_migratedTokens) {
        // update profile
        updateProfileTokensMutation.mutate(_migratedTokens);
      }
    }
  }, [currentAccount]);

  // useEffect(() => {
  //   _fetchPriceHistory();
  // }, [selectedAssets]);

  // actions
  const populateSelectedAssets = (tokensArr: ProfileToken[]) => {
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

  // TODO: redo logic to update selected assets from profile json meta
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
    // _fetchPriceHistory();
    _refetchCoinsData();
    // unclaimedRewardsQuery.refetch();
  };

  // const _fetchPriceHistory = () => {
  //   selectedAssets.forEach(async (token: AssetBase) => {
  //     const expiresAt = priceHistories[token.id]?.expiresAt || 0;
  //     const curTime = new Date().getTime();

  //     if (!token.notCrypto && curTime > expiresAt) {
  //       let priceData: number[] = [];

  //       if (token.isEngine) {
  //         const marketData = await fetchEngineMarketData(token.id);
  //         priceData = marketData.map((data) => data.close);
  //       } else if (token.isSpk) {
  //         // TODO: add request to fetch chart data if available
  //       } else {
  //         const marketChart = await fetchMarketChart(token.id, currency.currency, CHART_DAYS_RANGE);
  //         priceData = marketChart.prices.map((item) => item.yValue);
  //       }

  //       dispatch(setPriceHistory(token.id, currency.currency, priceData));
  //     }
  //   });
  // };

  const _refetchCoinsData = async () => {
    if (!quotes) {
      dispatch(fetchCoinQuotes());
    }

    walletQuery.refetch();
  };

  const _claimRewards = (symbol: string) => {
    // claim using mutation;
    claimRewardsMutation.mutate({ symbol });
  };

  const _onRefresh = () => {
    if (!walletQuery.isLoading) {
      _refetchData();
    }
  };

  const _renderItem = ({ item, index }: { item: PortfolioItem; index: number }) => {
    const unclaimedRewards = item.pendingRewards
      ? `${item.pendingRewards.toFixed(3)} ${item.symbol}`
      : '';

    const _isClaimingThis = claimRewardsMutation.checkIsClaiming(item.symbol);

    const _onCardPress = () => {
      navigation.navigate(ROUTES.SCREENS.ASSET_DETAILS, {
        asset: item,
      } as AssetDetailsScreenParams);
    };

    const _onClaimPress = () => {
      if (unclaimedRewards) {
        _claimRewards(item.symbol);
      } else if (item.symbol === 'POINTS') {
        navigation.navigate(ROUTES.SCREENS.BOOST);
      }
    };

    return (
      <AssetCard
        symbol={item.symbol}
        name={item.name}
        iconUrl={item.iconUrl}
        currentValue={item.fiatRate || 0}
        currencySymbol={currency.currencySymbol}
        ownedBalance={item.balance}
        unclaimedRewards={unclaimedRewards}
        enableBuy={!item.pendingRewards && item.symbol === 'POINTS'}
        isClaiming={_isClaimingThis}
        onCardPress={_onCardPress}
        onClaimPress={_onClaimPress}
        footerComponent={
          index === 0 && <HorizontalIconList options={POINTS} optionsKeys={POINTS_KEYS} />
        }
      />
    );
  };

  const _refreshControl = (
    <RefreshControl
      refreshing={walletQuery.isFetching}
      onRefresh={_onRefresh}
      progressBackgroundColor="#357CE6"
      tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
      titleColor="#fff"
      colors={['#fff']}
    />
  );

  const _renderWalletHeader = () => (
    <WalletHeader
      assets={walletQuery.data}
      currencyCode={currency.currency}
      currencySymbol={currency.currencySymbol}
      lastUpdated={walletQuery.dataUpdatedAt || 0}
      updating={walletQuery.isFetching}
      onRefresh={_onRefresh}
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
              style={globalStyles.tabBarBottom}
              ListEmptyComponent={walletQuery.isLoading ? <PostCardPlaceHolder /> : null}
              ListHeaderComponent={_renderWalletHeader}
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
