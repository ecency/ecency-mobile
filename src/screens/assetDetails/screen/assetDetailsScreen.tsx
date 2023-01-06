import { View, Alert, AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { BasicHeader } from '../../../components';
import { CoinSummary } from '../children';
import styles from './screen.styles';
import ActivitiesList from '../children/activitiesList';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  CoinActivitiesCollection,
  CoinData,
  QuoteItem,
} from '../../../redux/reducers/walletReducer';
import { fetchCoinActivities } from '../../../utils/wallet';
import { setCoinActivities } from '../../../redux/actions/walletActions';
import RootNavigation from '../../../navigation/rootNavigation';
import ROUTES from '../../../constants/routeNames';
import { ASSET_IDS } from '../../../constants/defaultAssets';
import { DelegationsModal, MODES } from '../children/delegationsModal';
import transferTypes from '../../../constants/transferTypes';
import { useGetAssetsQuery } from '../../../providers/queries';

export interface AssetDetailsScreenParams {
  coinId: string;
}

interface AssetDetailsScreenProps {
  navigation: any;
  route: any;
}

const FETCH_ITEMS_LIMIT = 500;

const AssetDetailsScreen = ({ navigation, route }: AssetDetailsScreenProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const coinId = route.params?.coinId;
  if (!coinId) {
    throw new Error('Coin symbol must be passed');
  }

  // refs
  const appState = useRef(AppState.currentState);
  const delegationsModalRef = useRef(null);

  //queries
  const walletQuery = useGetAssetsQuery();

  // redux props
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pin = useAppSelector((state) => state.application.pin);
  const globalProps = useAppSelector((state) => state.account.globalProps);
  const selectedCoins = useAppSelector((state) => state.wallet.selectedCoins);
  const coinData: CoinData = useAppSelector((state) => state.wallet.coinsData[coinId]);
  const quote: QuoteItem = useAppSelector((state) =>
    state.wallet.quotes ? state.wallet.quotes[coinId] : {},
  );
  const coinActivities: CoinActivitiesCollection = useAppSelector(
    (state) => state.wallet.coinsActivities[coinId],
  );
  const isPinCodeOpen = useAppSelector((state) => state.application.isPinCodeOpen);

  // state
  const [symbol] = useState(selectedCoins.find((item) => item.id === coinId).symbol);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completedActivities, setCompletedActivities] = useState(coinActivities?.completed || []);
  const [noMoreActivities, setNoMoreActivities] = useState(false);

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
    if (refresh) {
      walletQuery.refresh();
    } else if (noMoreActivities || loading) {
      console.log('Skipping transaction fetch', completedActivities.lastItem?.trxIndex);
      return;
    }

    setRefreshing(refresh);
    setLoading(true);

    const startAt =
      refresh || !completedActivities.length ? -1 : completedActivities.lastItem?.trxIndex - 1;
    const _activites = await fetchCoinActivities(
      currentAccount.name,
      coinId,
      symbol,
      globalProps,
      startAt,
      FETCH_ITEMS_LIMIT,
    );

    if (refresh) {
      dispatch(setCoinActivities(coinId, _activites));
    }

    setCompletedActivities(
      refresh ? _activites.completed : [...completedActivities, ..._activites.completed],
    );
    setNoMoreActivities(
      !_activites.completed.length || _activites.completed.lastItem.trxIndex < FETCH_ITEMS_LIMIT,
    );
    setRefreshing(false);
    setLoading(false);
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
    } else {
      let { balance } = coinData;

      switch (transferType) {
        case transferTypes.UNSTAKE_ENGINE:
          balance =
            coinData.extraDataPairs?.reduce(
              (bal, data) => (data.dataKey === 'staked' ? Number(data.value) : bal),
              0,
            ) ?? 0;
          break;
        case transferTypes.UNDELEGATE_ENGINE:
          balance =
            coinData.extraDataPairs?.reduce(
              (bal, data) => (data.dataKey === 'delegations_out' ? Number(data.value) : bal),
              0,
            ) ?? 0;
        case transferTypes.WITHDRAW_HIVE:
        case transferTypes.WITHDRAW_HBD:
          balance = coinData.savings ?? 0;
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
        completedActivities={completedActivities}
        pendingActivities={coinActivities?.pending || []}
        refreshing={refreshing || walletQuery.isRefreshing}
        loading={loading}
        isEngine={coinData?.isEngine}
        onEndReached={_fetchDetails}
        onRefresh={_onRefresh}
      />
      <DelegationsModal ref={delegationsModalRef} />
    </View>
  );
};

export default gestureHandlerRootHOC(AssetDetailsScreen);
