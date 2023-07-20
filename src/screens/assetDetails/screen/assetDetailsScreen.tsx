import { View, Alert, AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { BasicHeader } from '../../../components';
import { CoinSummary } from '../children';
import styles from './screen.styles';
import ActivitiesList from '../children/activitiesList';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { CoinData, QuoteItem } from '../../../redux/reducers/walletReducer';
import RootNavigation from '../../../navigation/rootNavigation';
import ROUTES from '../../../constants/routeNames';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { DelegationsModal, MODES } from '../children/delegationsModal';
import TransferTypes from '../../../constants/transferTypes';
import { walletQueries } from '../../../providers/queries';

export interface AssetDetailsScreenParams {
  coinId: string;
}

interface AssetDetailsScreenProps {
  navigation: any;
  route: any;
}

const AssetDetailsScreen = ({ navigation, route }: AssetDetailsScreenProps) => {
  const intl = useIntl();

  const coinId = route.params?.coinId;
  if (!coinId) {
    throw new Error('Coin symbol must be passed');
  }

  // refs
  const appState = useRef(AppState.currentState);
  const delegationsModalRef = useRef(null);

  // queries
  const assetsQuery = walletQueries.useAssetsQuery();
  const activitiesQuery = walletQueries.useActivitiesQuery(coinId);
  const pendingRequestsQuery = walletQueries.usePendingRequestsQuery(coinId);

  // redux props
  const selectedCoins = useAppSelector((state) => state.wallet.selectedCoins);
  const coinData: CoinData = useAppSelector((state) => state.wallet.coinsData[coinId]);
  const quote: QuoteItem = useAppSelector((state) =>
    state.wallet.quotes ? state.wallet.quotes[coinId] : {},
  );
  const isPinCodeOpen = useAppSelector((state) => state.application.isPinCodeOpen);

  // state
  const [symbol] = useState(selectedCoins.find((item) => item.id === coinId).symbol);

  // side-effects
  useEffect(() => {
    _fetchDetails();
    const appStateSub = AppState.addEventListener('change', _handleAppStateChange);
    return _cleanup(appStateSub);
  }, []);

  const _cleanup = (appStateSub: NativeEventSubscription) => {
    return () => {
      if (appStateSub) {
        appStateSub.remove();
      }
    };
  };

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('updating coins activities on app resume', coinId);
      _fetchDetails(true);
    }

    appState.current = nextAppState;
  };

  const _fetchDetails = async (refresh = false) => {
    if (refresh && !activitiesQuery.isRefreshing) {
      assetsQuery.refetch();
      activitiesQuery.refresh();
      pendingRequestsQuery.refetch();
      return;
    } else if (activitiesQuery.isLoading) {
      console.log('Skipping transaction fetch');
      return;
    }

    activitiesQuery.fetchNextPage();
  };

  if (!coinData) {
    Alert.alert('Invalid coin data');
    navigation.goBack();
  }

  const _onInfoPress = (dataKey: string) => {
    if (
      (dataKey === MODES.DELEGATEED || dataKey === MODES.RECEIVED) &&
      delegationsModalRef.current
    ) {
      delegationsModalRef.current.showModal(dataKey);
    }
  };

  const _onActionPress = (transferType: string) => {
    let navigateTo = ROUTES.SCREENS.TRANSFER;
    let navigateParams = {};

    if (coinId === ASSET_IDS.ECENCY && transferType !== 'dropdown_transfer') {
      navigateTo = ROUTES.SCREENS.REDEEM;
      navigateParams = {
        balance: coinData.balance,
        redeemType: transferType === 'dropdown_promote' ? 'promote' : 'boost',
      };
    } 
    
    
    else {
      let { balance } = coinData;

      switch (transferType) {
        case TransferTypes.UNSTAKE_ENGINE:
          balance =
            coinData.extraDataPairs?.reduce(
              (bal, data) => (data.dataKey === 'staked' ? Number(data.value) : bal),
              0,
            ) ?? 0;
          break;
        case TransferTypes.UNDELEGATE_ENGINE:
          balance =
            coinData.extraDataPairs?.reduce(
              (bal, data) => (data.dataKey === 'delegations_out' ? Number(data.value) : bal),
              0,
            ) ?? 0;
        case TransferTypes.WITHDRAW_HIVE:
        case TransferTypes.WITHDRAW_HBD:
          balance = coinData.savings ?? 0;
          break;

        case TransferTypes.SWAP_TOKEN:
          navigateTo = ROUTES.SCREENS.TRADE;
          break;

      }

      navigateParams = {
        transferType: coinId === ASSET_IDS.ECENCY ? 'points' : transferType,
        fundType: coinId === ASSET_IDS.ECENCY ? 'ESTM' : symbol,
        balance,
      };
    }

    if (isPinCodeOpen) {
      RootNavigation.navigate({
        name: ROUTES.SCREENS.PINCODE,
        params: {
          navigateTo,
          navigateParams,
        },
      });
    } else {
      RootNavigation.navigate({
        name: navigateTo,
        params: navigateParams,
      });
    }
  };

  const _onRefresh = () => {
    _fetchDetails(true);
  };

  const _renderHeaderComponent = (
    <CoinSummary
      id={coinId}
      coinSymbol={symbol}
      coinData={coinData}
      percentChagne={(quote ? quote.percentChange : coinData?.percentChange) || 0}
      onActionPress={_onActionPress}
      onInfoPress={_onInfoPress}
    />
  );

  return (
    <View style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: 'wallet.coin_details' })} />
      <ActivitiesList
        header={_renderHeaderComponent}
        completedActivities={activitiesQuery.data || []}
        pendingActivities={pendingRequestsQuery.data || []}
        refreshing={activitiesQuery.isRefreshing}
        loading={activitiesQuery.isLoading}
        activitiesEnabled={!coinData?.isSpk}
        onEndReached={_fetchDetails}
        onRefresh={_onRefresh}
      />
      <DelegationsModal ref={delegationsModalRef} />
    </View>
  );
};

export default gestureHandlerRootHOC(AssetDetailsScreen);
