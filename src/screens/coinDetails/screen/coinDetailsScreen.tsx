import { View } from 'react-native'
import React from 'react'
import { BasicHeader } from '../../../components'
import { FlatList } from 'react-native-gesture-handler'
import { ActivityItem, CoinSummary } from '../children'
import styles from './screen.styles';

const CoinDetailsScreen = () => {

  const _renderActivityItem = ({item, index}) => {
    return <ActivityItem />
  }

  return (
    <View style={styles.container}>
      <BasicHeader title="Coin Details" />
      <FlatList 
        style={styles.list}
        data={["data"]}
        renderItem={_renderActivityItem}
        keyExtractor={(item, index)=>`activity_item_${index}`}
        ListHeaderComponent={<CoinSummary/>}
      />
    </View>
  )
}

export default CoinDetailsScreen