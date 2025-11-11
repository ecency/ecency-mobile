import { Alert, AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PortfolioItem } from 'providers/ecency/ecency.types';
import { BasicHeader } from '../../../components';
import { CoinSummary, ActivitiesList, RecurrentTransfersModal } from '../children';
import styles from './screen.styles';
import { CoinActivity } from '../../../redux/reducers/walletReducer';
import { useAppSelector } from '../../../hooks';
import RootNavigation from '../../../navigation/rootNavigation';
import ROUTES from '../../../constants/routeNames';
import { DelegationsModal, MODES } from '../children/delegationsModal';
import TransferTypes from '../../../constants/transferTypes';
import { walletQueries } from '../../../providers/queries';
import parseAsset from '../../../utils/parseAsset';
import TokenLayers from '../../../constants/tokenLayers';

export interface AssetDetailsScreenParams {
  asset: PortfolioItem;
}

interface AssetDetailsScreenProps {
  navigation: any;
  route: any;
}

const AssetDetailsScreen = ({ navigation, route }: AssetDetailsScreenProps) => {
  const intl = useIntl();

  if (!route.params?.asset) {
    Alert.alert('Invalid coin data');
    navigation.goBack();
  }

  // refs
  const appState = useRef(AppState.currentState);
  const delegationsModalRef = useRef(null);
  const recurrentTransfersModalRef = useRef(null);

  // state
  const [showChart, setShowChart] = useState(false);
  const [asset, setAsset] = useState<PortfolioItem>(route.params?.asset);
  const assetSymbol = asset.symbol;
  const assetLayer = asset.layer;

  // queries
  const assetsQuery = walletQueries.useAssetsQuery();
  const activitiesQuery = walletQueries.useActivitiesQuery(assetSymbol, asset.layer);
  const pendingRequestsQuery = walletQueries.usePendingRequestsQuery(assetSymbol);
  const recurringActivitiesQuery = walletQueries.useRecurringActivitesQuery(assetSymbol);

  // TODO: verify if quote can be fetched like this or quote fetching can be ignored
  // const quote: QuoteItem = useAppSelector((state) =>
  //   state.wallet.quotes ? state.wallet.quotes[assetSymbol] : {},
  // );
  const username = useAppSelector((state) => state.wallet.username);
  const isPinCodeOpen = useAppSelector((state) => state.application.isPinCodeOpen);

  useEffect(() => {
    if (assetsQuery.data != null) {
      const updatedAsset = assetsQuery.data.find((a) => a.symbol === assetSymbol);
      if (updatedAsset) {
        setAsset(updatedAsset);
      }
    }
  }, [assetsQuery.data]);

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
      console.log('updating coins activities on app resume', assetSymbol);
      _fetchDetails(true);
    }

    appState.current = nextAppState;
  };

  const _fetchDetails = async (refresh = false) => {
    if (refresh && !activitiesQuery.isRefreshing) {
      assetsQuery.refetch();
      activitiesQuery.refresh();
      pendingRequestsQuery.refetch();
      if (recurringActivitiesQuery) {
        recurringActivitiesQuery.refetch();
      }
      return;
    } else if (activitiesQuery.isLoading) {
      console.log('Skipping transaction fetch');
      return;
    }

    activitiesQuery.fetchNextPage();
  };

  const _onInfoPress = (dataKey: string) => {
    if (
      (dataKey === MODES.DELEGATEED || dataKey === MODES.RECEIVED) &&
      delegationsModalRef.current
    ) {
      delegationsModalRef.current.showModal(dataKey);
    }

    if (dataKey === 'total_recurrent_transfers') {
      recurrentTransfersModalRef.current?.showModal();
    }
  };

  const _onActionPress = (transferType: string, baseActivity: CoinActivity | null = null) => {
    let navigateTo: string = ROUTES.SCREENS.TRANSFER;
    let navigateParams = {};
    let { balance } = asset;
    let fundType = assetSymbol;


    if (assetLayer === TokenLayers.POINTS) {
      switch (transferType) {
        case TransferTypes.ECENCY_POINT_TRANSFER:
          fundType = 'ESTM';
          break;
        case TransferTypes.PROMOTE:
          navigateTo = ROUTES.SCREENS.REDEEM;
          navigateParams = {
            balance: asset.balance,
            redeemType: 'promote',
          };
          break;
        case TransferTypes.BOOST:
          navigateTo = ROUTES.SCREENS.REDEEM;
          navigateParams = {
            balance: asset.balance,
            redeemType: 'boost_plus',
          };
          break;
      }
    }

    if (assetLayer === TokenLayers.HIVE) {
      switch (transferType) {
        case TransferTypes.SWAP_TOKEN:
          navigateTo = ROUTES.SCREENS.TRADE;
          break;
        case TransferTypes.TRANSFER_FROM_SAVINGS:
          balance = asset.savings ?? 0;
          break;
      }
    }

    if (assetLayer === TokenLayers.ENGINE) {
      switch (transferType) {
        case TransferTypes.UNSTAKE:
        case TransferTypes.DELEGATE:
          balance = asset.staked ?? 0;
          break;
        case TransferTypes.UNDELEGATE:
          balance =
            asset.extraData?.reduce(
              (bal, data) => (data.dataKey === 'delegations_out' ? Number(data.value) : bal),
              0,
            ) ?? 0;
          break;
      }
    }

    navigateParams = {
      transferType,
      fundType,
      assetLayer,
      balance,
    };

    if (assetLayer === TokenLayers.CHAIN && transferType === TransferTypes.RECEIVE) {
      navigateParams = {
        ...navigateParams,
        tokenAddress: asset.address,
      };
    }

    if (baseActivity) {
      navigateParams = {
        ...navigateParams,
        referredUsername:
          baseActivity.receiver !== username ? baseActivity.receiver : baseActivity.sender,
        initialAmount: `${Math.abs(parseAsset(baseActivity.value.trim()).amount)}`,
        initialMemo: baseActivity.memo,
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
      // id={assetSymbol}
      coinSymbol={assetSymbol}
      asset={asset}
      // percentChagne={(quote ? quote.percentChange : asset?.percentChange) || 0}
      totalRecurrentAmount={recurringActivitiesQuery?.totalAmount || 0}
      onActionPress={_onActionPress}
      onInfoPress={_onInfoPress}
      showChart={showChart}
      setShowChart={setShowChart}
    />
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: 'wallet.coin_details' })} />
      <ActivitiesList
        header={_renderHeaderComponent}
        completedActivities={activitiesQuery.data || []}
        pendingActivities={pendingRequestsQuery.data || []}
        refreshing={activitiesQuery.isRefreshing}
        loading={activitiesQuery.isLoading}
        activitiesEnabled={asset.layer !== 'spk' && asset.layer !== 'chain'}
        onEndReached={_fetchDetails}
        onRefresh={_onRefresh}
        onActionPress={_onActionPress}
      />
      <DelegationsModal ref={delegationsModalRef} />
      <RecurrentTransfersModal assetId={assetSymbol} ref={recurrentTransfersModalRef} />
    </SafeAreaView>
  );
};

export default gestureHandlerRootHOC(AssetDetailsScreen);
