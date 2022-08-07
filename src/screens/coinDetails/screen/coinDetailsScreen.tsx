import { View, Alert, AppState, AppStateStatus } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { BasicHeader } from '../../../components'
import { CoinSummary } from '../children'
import styles from './screen.styles';
import ActivitiesList from '../children/activitiesList'
import { useAppDispatch, useAppSelector } from '../../../hooks'
import { CoinActivitiesCollection, QuoteItem } from '../../../redux/reducers/walletReducer';
import { fetchCoinActivities } from '../../../utils/wallet';
import { fetchAndSetCoinsData, setCoinActivities } from '../../../redux/actions/walletActions';
import { openPinCodeModal } from '../../../redux/actions/applicationActions';
import { navigate } from '../../../navigation/service';
import ROUTES from '../../../constants/routeNames';
import { COIN_IDS } from '../../../constants/defaultCoins';
import { useIntl } from 'react-intl';

export interface CoinDetailsScreenParams {
  coinId: string;
}

interface CoinDetailsScreenProps {
  navigation: any
  route: any
}

const FETCH_ITEMS_LIMIT = 500;

const CoinDetailsScreen = ({ navigation, route }: CoinDetailsScreenProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const coinId = route.params?.coinId;
  if (!coinId) {
    throw new Error("Coin symbol must be passed")
  }

  //refs
  const appState = useRef(AppState.currentState);

  //redux props
  const currentAccount = useAppSelector(state => state.account.currentAccount);
  const globalProps = useAppSelector(state => state.account.globalProps);
  const selectedCoins = useAppSelector(state => state.wallet.selectedCoins);
  const coinData: CoinData = useAppSelector(state => state.wallet.coinsData[coinId]);
  const quote: QuoteItem = useAppSelector(state => state.wallet.quotes ? state.wallet.quotes[coinId] : {});
  const coinActivities: CoinActivitiesCollection = useAppSelector(state => state.wallet.coinsActivities[coinId]);
  const isPinCodeOpen = useAppSelector(state => state.application.isPinCodeOpen);

  //state
  const [symbol] = useState(selectedCoins.find((item) => item.id === coinId).symbol);
  const [refreshing, setRefreshing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [completedActivities, setCompletedActivities] = useState(coinActivities?.completed || []);
  const [noMoreActivities, setNoMoreActivities] = useState(false);

  //side-effects
  useEffect(() => {
    _fetchDetails(true);
    AppState.addEventListener('change', _handleAppStateChange);
    return _cleanup;
  }, [])


  const _cleanup = () => {
    AppState.removeEventListener('change', _handleAppStateChange);
  }


  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log("updating coins activities on app resume", coinId)
      _fetchDetails(true);
    }

    appState.current = nextAppState;
  }


  const _fetchDetails = async (refresh = false) => {

    if (refresh) {
      setRefreshing(refresh);
      dispatch(fetchAndSetCoinsData(refresh));
    } else if(noMoreActivities || loading) {
      console.log('Skipping transaction fetch', completedActivities.lastItem?.trxIndex)
      return;
    }

    setLoading(true);

    const startAt = refresh || !completedActivities.length ? -1 : completedActivities.lastItem?.trxIndex - 1;
    const _activites = await fetchCoinActivities(currentAccount.name, coinId, symbol, globalProps, startAt, FETCH_ITEMS_LIMIT);

    if(refresh){
      dispatch(setCoinActivities(coinId, _activites));
    }
    
    setCompletedActivities(refresh ? _activites.completed : [...completedActivities, ..._activites.completed]);
    setNoMoreActivities(!_activites.completed.length || _activites.completed.lastItem.trxIndex < FETCH_ITEMS_LIMIT);
    setRefreshing(false);
    setLoading(false);
  }


  if (!coinData) {
    Alert.alert("Invalid coin data");
    navigation.goBack();
  }


  const _onActionPress = (transferType: string) => {

    let navigateTo = ROUTES.SCREENS.TRANSFER
    let navigateParams = {};

    if (coinId === COIN_IDS.ECENCY && transferType !== 'dropdown_transfer') {
      navigateTo = ROUTES.SCREENS.REDEEM;
      navigateParams = {
        balance: coinData.balance,
        redeemType: transferType === 'dropdown_promote' ? 'promote' : 'boost',
      }
    } else {
      const balance = transferType === 'withdraw_hive' || transferType === 'withdraw_hbd'
        ? coinData.savings : coinData.balance;
      navigateParams = {
        transferType: coinId === COIN_IDS.ECENCY ? 'points' : transferType,
        fundType: coinId === COIN_IDS.ECENCY ? 'ESTM' : symbol,
        balance
      };
    }

    if (isPinCodeOpen) {
      dispatch(
        openPinCodeModal({
          navigateTo,
          navigateParams,
        }),
      );
    } else {
      navigate({
        name: navigateTo,
        params: navigateParams
      });
    }
  }


  const _onRefresh = () => {
    _fetchDetails(true);
  }


  const _renderHeaderComponent = (
    <CoinSummary
      id={coinId}
      coinSymbol={symbol}
      coinData={coinData}
      percentChagne={quote.percentChange || 0}
      onActionPress={_onActionPress} />
  )


  return (
    <View style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: 'wallet.coin_details' })} />
      <ActivitiesList
        header={_renderHeaderComponent}
        completedActivities={completedActivities}
        pendingActivities={coinActivities?.pending || []}
        refreshing={refreshing}
        loading={loading}
        onEndReached={_fetchDetails}
        onRefresh={_onRefresh}
      />
    </View>
  )
}

export default CoinDetailsScreen