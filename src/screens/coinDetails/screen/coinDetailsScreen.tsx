import { View, Text } from 'react-native'
import React from 'react'
import { BasicHeader, Transaction } from '../../../components'
import { FlatList } from 'react-native-gesture-handler'
import { CoinSummary, CoinSummaryProps } from '../children'
import styles from './screen.styles';
import { AccountContainer, WalletContainer } from '../../../containers'
import ActivitiesList from '../children/activitiesList'
import { NavigationStackRouterConfig, withNavigation } from 'react-navigation'
import { NavigationStackConfig } from 'react-navigation-stack'
import WALLET_TOKENS from '../../../constants/walletTokens'

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

  const {tokenSymbol:coinSymbol, coingeckoId } = WALLET_TOKENS.find((item)=>item.id===coinId)


  const _renderHeaderComponent = (headerProps:CoinSummaryProps) => (
    <>
      <CoinSummary {...headerProps} />
      <Text style={styles.textActivities}>Activities</Text>
    </>
  )

  return (
    <View style={styles.container}>
      <BasicHeader title="Coin Details" />
          <AccountContainer>
          {({ currentAccount }) => (
            <WalletContainer selectedUser={currentAccount} coinSymbol={coinSymbol}>
              {({
                isClaiming,
                claimRewardBalance,
                handleOnWalletRefresh,
                refreshing,
                transferHistory,
                hiveBalance,
                isLoading,
                hiveSavingBalance,
                estimatedHiveValue,
                hiveDropdown,
                savingHiveDropdown,
                navigate,
                balance,
                savings,
                estimateValue
              }) => (
                <ActivitiesList 
                  header={_renderHeaderComponent({
                    balance,
                    savings,
                    estimateValue,
                    coinSymbol,
                    coingeckoId,
                  })}
                  activities={transferHistory}
                  filter={coinSymbol}
                />
                 
              )}
              </WalletContainer>
          )}
          </AccountContainer>
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