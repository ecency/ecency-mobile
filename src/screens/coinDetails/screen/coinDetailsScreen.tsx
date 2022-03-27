import { View, Text, Alert, AppState, AppStateStatus } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { BasicHeader, Transaction } from '../../../components'
import { CoinSummary } from '../children'
import styles from './screen.styles';
import ActivitiesList from '../children/activitiesList'
import { withNavigation } from 'react-navigation'
import { useAppDispatch, useAppSelector } from '../../../hooks'
import { CoinActivitiesCollection, CoinActivity, CoinData, QuoteItem } from '../../../redux/reducers/walletReducer';
import { fetchCoinActivities } from '../../../utils/wallet';
import { fetchAndSetCoinsData, setCoinActivities } from '../../../redux/actions/walletActions';
import { openPinCodeModal } from '../../../redux/actions/applicationActions';
import { navigate } from '../../../navigation/service';
import ROUTES from '../../../constants/routeNames';
import { COIN_IDS } from '../../../constants/defaultCoins';
import { useIntl } from 'react-intl';

export interface CoinDetailsScreenParams {
  coinId:string;
}

interface CoinDetailsScreenProps {
  navigation:any
}

const CoinDetailsScreen = ({navigation}:CoinDetailsScreenProps) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const coinId = navigation.getParam('coinId');
  if(!coinId){
    throw new Error("Coin symbol must be passed")
  }

  //refs
  const appState = useRef(AppState.currentState);

  //redux props
  const currentAccount = useAppSelector(state=>state.account.currentAccount);
  const globalProps = useAppSelector(state=>state.account.globalProps);
  const selectedCoins = useAppSelector(state=>state.wallet.selectedCoins);
  const coinData:CoinData = useAppSelector(state=>state.wallet.coinsData[coinId]);
  const quote:QuoteItem = useAppSelector(state=>state.wallet.quotes[coinId]);
  const coinActivities:CoinActivitiesCollection = useAppSelector(state=>state.wallet.coinsActivities[coinId]);
  const isPinCodeOpen = useAppSelector(state=>state.application.isPinCodeOpen);

  //state
  const [symbol] = useState(selectedCoins.find((item)=>item.id===coinId).symbol);
  const [refreshing, setRefreshing] = useState(false);

  //side-effects
  useEffect(()=>{
    _fetchDetails();
    AppState.addEventListener('change', _handleAppStateChange);
    return _cleanup;
  }, [])


  const _cleanup = () => {
    AppState.removeEventListener('change', _handleAppStateChange);
  }


  const _handleAppStateChange = (nextAppState:AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log("updating coins activities on app resume", coinId)
      _fetchDetails();
    }

    appState.current = nextAppState;
  }


  const _fetchDetails = async (refresh = false) => {
    
    if(refresh){
      setRefreshing(refresh);
      dispatch(fetchAndSetCoinsData(refresh));
    }

    const _activites = await fetchCoinActivities(currentAccount.name, coinId, symbol, globalProps);
    dispatch(setCoinActivities(coinId, _activites));
    setRefreshing(false);
  }


  if(!coinData){
    Alert.alert("Invalid coin data");
    navigation.goBack();
  }


  const _onActionPress = (transferType:string) => {
 
    let navigateTo = ROUTES.SCREENS.TRANSFER
    let navigateParams = {};

    if(coinId === COIN_IDS.ECENCY && transferType !== 'dropdown_transfer'){
        navigateTo = ROUTES.SCREENS.REDEEM;
        navigateParams = {
          balance:coinData.balance,
          redeemType:transferType === 'dropdown_promote'?'promote':'boost',
        }
    } else {
        const balance = transferType === 'withdraw_hive' || transferType === 'withdraw_hbd'
          ? coinData.savings : coinData.balance;
        navigateParams = { 
          transferType:coinId === COIN_IDS.ECENCY?'points':transferType, 
          fundType:coinId === COIN_IDS.ECENCY?'ESTM':symbol, 
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
        routeName: navigateTo,
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
      <BasicHeader title={intl.formatMessage({id:'wallet.coin_details'})} />
      <ActivitiesList 
        header={_renderHeaderComponent}
        completedActivities={coinActivities?.completed || []}
        pendingActivities={coinActivities?.pending || []}
        refreshControlProps={{
          refreshing,
          onRefresh:_onRefresh
        }}
      />  
    </View>
  )
}

export default withNavigation(CoinDetailsScreen)