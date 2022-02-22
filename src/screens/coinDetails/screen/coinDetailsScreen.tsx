import { View, Text, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BasicHeader } from '../../../components'
import { CoinSummary } from '../children'
import styles from './screen.styles';
import ActivitiesList from '../children/activitiesList'
import { withNavigation } from 'react-navigation'
import { useAppDispatch, useAppSelector } from '../../../hooks'
import { CoinActivity, CoinData } from '../../../redux/reducers/walletReducer';
import { fetchCoinActivities } from '../../../utils/wallet';
import { setCoinActivities } from '../../../redux/actions/walletActions';
import { openPinCodeModal } from '../../../redux/actions/applicationActions';
import { navigate } from '../../../navigation/service';
import ROUTES from '../../../constants/routeNames';
import { COIN_IDS } from '../../../constants/defaultCoins';

export interface CoinDetailsScreenParams {
  coinId:string;
}

interface CoinDetailsScreenProps {
  navigation:any
}

const CoinDetailsScreen = ({navigation}:CoinDetailsScreenProps) => {
  const dispatch = useAppDispatch();

  const coinId = navigation.getParam('coinId');
  if(!coinId){
    throw new Error("Coin symbol must be passed")
  }

  const currentAccount = useAppSelector(state=>state.account.currentAccount);
  const globalProps = useAppSelector(state=>state.account.globalProps);
  const tokenAddress =  useAppSelector(state=>state.wallet.tokenAddress);
  const selectedCoins = useAppSelector(state=>state.wallet.selectedCoins);
  const coinData:CoinData = useAppSelector(state=>state.wallet.coinsData[coinId]);
  const coinActivities:CoinActivity[] = useAppSelector(state=>state.wallet.coinsActivities[coinId]);
  const isPinCodeOpen = useAppSelector(state=>state.application.isPinCodeOpen);

  const [symbol] = useState(selectedCoins.find((item)=>item.id===coinId).symbol);


  useEffect(()=>{
    _fetchCoinActivities();
  }, [])

  const _fetchCoinActivities = async () => {
    const _activites = await fetchCoinActivities(currentAccount.name, coinId, symbol, globalProps);
    dispatch(setCoinActivities(coinId, _activites));
  }


  if(!coinData){
    Alert.alert("Invalid coin data");
    navigation.goBack();
  }


  const _onActionPress = (transferType:string) => {
    let balance = 0;
    let fundType = symbol;

    if (
      (transferType === 'transfer_token' || transferType === 'purchase_estm') &&
      coinId === COIN_IDS.HIVE
    ) {
      balance = Math.round(coinData.balance * 1000) / 1000;
    }
    if (
      (transferType === 'transfer_token' ||
        transferType === 'convert' ||
        transferType === 'purchase_estm') &&
        coinId === COIN_IDS.HBD
    ) {
      balance = Math.round(coinData.balance * 1000) / 1000;
    }
    if (transferType === 'withdraw_hive' && coinId === COIN_IDS.HIVE) {
      balance = Math.round(coinData.savings * 1000) / 1000;
    }
    if (transferType === 'withdraw_hbd' && coinId === COIN_IDS.HBD) {
      balance = Math.round(coinData.savings * 1000) / 1000;
    }

    if (isPinCodeOpen) {
      dispatch(
        openPinCodeModal({
          navigateTo: ROUTES.SCREENS.TRANSFER,
          navigateParams: { transferType, fundType, balance, tokenAddress },
        }),
      );
    } else {
      navigate({
        routeName: ROUTES.SCREENS.TRANSFER,
        params: { transferType, fundType, balance, tokenAddress },
      });
    }
  } 


  const _renderHeaderComponent = (
    <>
      <CoinSummary
        id={coinId}
        coinSymbol={symbol}
        coinData={coinData}
        onActionPress={_onActionPress}
      />
      <Text style={styles.textActivities}>Activities</Text>
    </>
  )

  return (
    <View style={styles.container}>
      <BasicHeader title="Coin Details" />
      <ActivitiesList 
        header={_renderHeaderComponent}
        activities={coinActivities || []}
      />  
    </View>
  )
}

export default withNavigation(CoinDetailsScreen)