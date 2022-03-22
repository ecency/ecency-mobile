import { View, Text, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BasicHeader, Transaction } from '../../../components'
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

  const currentAccount = useAppSelector(state=>state.account.currentAccount);
  const globalProps = useAppSelector(state=>state.account.globalProps);
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


  const _renderHeaderComponent = (
    <>
      <CoinSummary
        id={coinId}
        coinSymbol={symbol}
        coinData={coinData}
        onActionPress={_onActionPress}
      />

    
      {/* 
      //TODO: remove code if not needed in final wallet
      {coinData.pendingRequests && !!coinData.pendingRequests.length && (
        <>
          <Text style={styles.textActivities}>{"Pending Requests"}</Text>
          {coinData.pendingRequests.map((item, index)=>(<Transaction item={item} index={index} />))}
        </>
      )} */}
      

      <Text style={styles.textActivities}>{intl.formatMessage({id:'wallet.activities'})}</Text>
    </>
  )

  return (
    <View style={styles.container}>
      <BasicHeader title={intl.formatMessage({id:'wallet.coin_details'})} />
      <ActivitiesList 
        header={_renderHeaderComponent}
        activities={coinActivities || []}
      />  
    </View>
  )
}

export default withNavigation(CoinDetailsScreen)