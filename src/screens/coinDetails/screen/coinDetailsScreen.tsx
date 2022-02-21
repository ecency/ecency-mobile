import { View, Text, Alert } from 'react-native'
import React from 'react'
import { BasicHeader } from '../../../components'
import { CoinSummary, CoinSummaryProps } from '../children'
import styles from './screen.styles';
import ActivitiesList from '../children/activitiesList'
import { withNavigation } from 'react-navigation'
import WALLET_TOKENS from '../../../constants/defaultCoins'
import { useAppSelector } from '../../../hooks'
import { CoinData } from '../../../redux/reducers/walletReducer';

export interface CoinDetailsScreenParams {
  coinId:string;
}

interface CoinDetailsScreenProps {
  navigation:any
}

const CoinDetailsScreen = ({navigation}:CoinDetailsScreenProps) => {
  const coinId = navigation.getParam('coinId');
  if(!coinId){
    throw new Error("Coin symbol must be passed")
  }

  const coinData:CoinData = useAppSelector(state=>state.wallet.coinsData[coinId]);

  if(!coinData){
    Alert.alert("Invlaid coin data");
    navigation.goBack();
  }

  const {symbol:coinSymbol, id } = WALLET_TOKENS.find((item)=>item.id===coinId)


  const _renderHeaderComponent = (
    <>
      <CoinSummary {...{
        balance:coinData.balance,
        estimateValue:coinData.estimateValue,
        savings:coinData.savings,
        id,
        coinSymbol,
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
        activities={DUMMY_DATA}
        filter={coinSymbol}
      />  
    </View>
  )
}

export default withNavigation(CoinDetailsScreen)


const DUMMY_DATA = [
  {
      "iconType": "MaterialIcons",
      "textKey": "transfer",
      "created": "2022-02-14T23:59:03",
      "icon": "compare-arrows",
      "value": "0.026 HIVE",
      "details": "@ecency to @demo.com",
      "memo": "Daily 100% curation reward share. Thank you for delegating to @ecency!"
  },
  {
      "iconType": "MaterialIcons",
      "textKey": "curation_reward",
      "created": "2022-02-14T16:05:18",
      "icon": "local-activity",
      "value": "0.002 HP",
      "details": "@abh12345/the-hive-engagement-league-psmzc"
  },
  {
      "iconType": "MaterialIcons",
      "textKey": "transfer",
      "created": "2022-02-13T23:58:33",
      "icon": "compare-arrows",
      "value": "0.017 HIVE",
      "details": "@ecency to @demo.com",
      "memo": "Daily 100% curation reward share. Thank you for delegating to @ecency!"
  },
  {
      "iconType": "MaterialIcons",
      "textKey": "transfer",
      "created": "2022-02-12T23:59:03",
      "icon": "compare-arrows",
      "value": "0.028 HIVE",
      "details": "@ecency to @demo.com",
      "memo": "Daily 100% curation reward share. Thank you for delegating to @ecency!"
  },
  {
      "iconType": "MaterialIcons",
      "textKey": "transfer",
      "created": "2022-02-11T23:58:30",
      "icon": "compare-arrows",
      "value": "0.019 HIVE",
      "details": "@ecency to @demo.com",
      "memo": "Daily 100% curation reward share. Thank you for delegating to @ecency!"
  }
]