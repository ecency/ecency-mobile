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
  const selectedCoins = useAppSelector(state=>state.wallet.selectedCoins);
  const coinData:CoinData = useAppSelector(state=>state.wallet.coinsData[coinId]);
  const coinActivities:CoinActivity[] = useAppSelector(state=>state.wallet.coinsActivities[coinId]);
  

  const {symbol, id } = selectedCoins.find((item)=>item.id===coinId)

  const [activities, setActivities] = useState([])


  useEffect(()=>{
    _fetchCoinActivities();
  }, [])

  const _fetchCoinActivities = async () => {
    const _activites = await fetchCoinActivities(currentAccount.name, symbol, globalProps);
    setActivities(_activites)
    // dispatch();
    
  }


  if(!coinData){
    Alert.alert("Invalid coin data");
    navigation.goBack();
  }



  const _renderHeaderComponent = (
    <>
      <CoinSummary {...{
        balance:coinData.balance,
        estimateValue:coinData.estimateValue,
        savings:coinData.savings,
        id,
        coinSymbol:symbol,
        extraData:coinData.extraDataPairs
      }} />
      <Text style={styles.textActivities}>Activities</Text>
    </>
  )

  return (
    <View style={styles.container}>
      <BasicHeader title="Coin Details" />
      <ActivitiesList 
        header={_renderHeaderComponent}
        activities={activities || []}

      />  
    </View>
  )
}

export default withNavigation(CoinDetailsScreen)