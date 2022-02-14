import React from 'react'
import { View, Text } from 'react-native'
import { CoinBasics, CoinChart, RangeSelector } from '.'

export const CoinSummary = () => {
    return (
        <View>
            <CoinBasics />
            <CoinChart />
            <RangeSelector />
        </View>
    )
}
