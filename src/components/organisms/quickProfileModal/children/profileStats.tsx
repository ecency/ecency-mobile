import React from 'react'
import { View, Text } from 'react-native'
import styles from './quickProfileStyles'


export interface StatsData {
    label:string,
    value:number|string,
    suffix?:string
}

interface Props {
    data:StatsData[],
    horizontalMargin?:number
}

export const ProfileStats = ({data, horizontalMargin}: Props) => {
    return (
        <View style={{flexDirection:'row', justifyContent:'space-around', marginTop:40, marginHorizontal:horizontalMargin }}>
            {data.map((item)=><StatItem label={item.label} value={item.value}/>)}
        </View>
    )
}

const StatItem = (props:{label:string, value:number|string}) => (
    <View style={{alignItems:'center', flex:1}}>
        <Text style={styles.statValue}>{props.value || '00'}</Text>
        <Text style={styles.statLabel}>{props.label}</Text>
    </View>
)





