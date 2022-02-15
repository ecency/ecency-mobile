import React from 'react'
import { View, Text } from 'react-native'
import styles from './children.styles'

export interface ValuePair {
    value:string|number;
    label:string;
}

interface CoinBasicsProps {
    valuePairs:ValuePair[];
    coinSymbol:string;
}

export const CoinBasics = ({valuePairs, coinSymbol}:CoinBasicsProps) => {

    const _renderCoinHeader = (
        <>
            <View style={styles.coinTitleContainer}>
             <Text style={styles.textCoinTitle}>{coinSymbol}</Text>
            </View>
         
            <Text style={styles.textHeaderChange}>Change <Text style={styles.textPositive}>+10.13%</Text></Text>
        </>
    )

    const _renderValuePair = (args:ValuePair) => {
        return (
            <>
                <Text style={styles.textBasicValue}>{args.value}</Text>
                <Text style={styles.textBasicLabel}>{args.label}</Text>
            </>
        )

    }

    return (
        <View style={[styles.card, styles.basicsContainer]}>
            {_renderCoinHeader}
            {valuePairs.map((valPair)=>_renderValuePair(valPair))}
        </View>
    )
}
