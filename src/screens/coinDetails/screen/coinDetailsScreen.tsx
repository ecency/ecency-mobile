import { View, Text } from 'react-native'
import React from 'react'
import { BasicHeader, Transaction } from '../../../components'
import { FlatList } from 'react-native-gesture-handler'
import { CoinSummary } from '../children'
import styles from './screen.styles';

const CoinDetailsScreen = () => {

  const _renderActivityItem = ({item, index}) => {
    return <Transaction item={item} index={index} />
  }

  const _renderHeaderComponent = (
    <>
      <CoinSummary/>
      <Text style={styles.textActivities}>Activities</Text>
    </>
  )

  return (
    <View style={styles.container}>
      <BasicHeader title="Coin Details" />
      <FlatList 
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={DUMMY_DATA}
        renderItem={_renderActivityItem}
        keyExtractor={(item, index)=>`activity_item_${index}`}
        ListHeaderComponent={_renderHeaderComponent}
      />
    </View>
  )
}

export default CoinDetailsScreen


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