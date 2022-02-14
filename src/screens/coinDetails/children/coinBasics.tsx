import React from 'react'
import { View, Text } from 'react-native'
import styles from './children.styles'

export const CoinBasics = () => {

    const _renderCoinHeader = (
        <>
            <View style={styles.coinTitleContainer}>
             <Text style={styles.textCoinTitle}>HIVE</Text>
            </View>
         
            <Text style={styles.textHeaderChange}>Change <Text style={styles.textPositive}>+10.13%</Text></Text>
        </>
    )

    const _renderValuePair = (label:string, value:string) => {
        return (
            <>
                <Text style={styles.textBasicValue}>{value}</Text>
                <Text style={styles.textBasicLabel}>{label}</Text>
            </>
        )

    }

    return (
        <View style={[styles.card, styles.basicsContainer]}>
            {_renderCoinHeader}
            {_renderValuePair('Balance', '234.423897')}
            {_renderValuePair('Value', '$23423.34')}
            {_renderValuePair('Savings', '434.3')}
        </View>
    )
}
