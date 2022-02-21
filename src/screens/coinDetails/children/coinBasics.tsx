import React from 'react'
import { View, Text } from 'react-native'
import { DataPair } from '../../../redux/reducers/walletReducer'
import styles from './children.styles'


interface CoinBasicsProps {
    valuePairs:DataPair[];
    extraData:DataPair[];
    coinSymbol:string;
}

export const CoinBasics = ({valuePairs, extraData, coinSymbol}:CoinBasicsProps) => {

    const _renderCoinHeader = (
        <>
            <View style={styles.coinTitleContainer}>
             <Text style={styles.textCoinTitle}>{coinSymbol}</Text>
            </View>
         
            <Text style={styles.textHeaderChange}>Change <Text style={styles.textPositive}>+10.13%</Text></Text>
        </>
    )

    const _renderValuePair = (args:DataPair) => {
        return (
            <>
                <Text style={styles.textBasicValue}>{args.value}</Text>
                <Text style={styles.textBasicLabel}>{args.label}</Text>
            </>
        )
    }

    const _renderExtraData = (args:DataPair) => {
        return (
            <View style={styles.extraDataContainer}>
                 <Text style={styles.textExtraLabel}>{args.label}</Text>
                 <Text style={styles.textExtraValue}>{args.value}</Text>
            </View>
        )
    }

    return (
        <View style={[styles.card, styles.basicsContainer]}>
            {_renderCoinHeader}
            {valuePairs.map((valPair)=>_renderValuePair(valPair))}
            {extraData && extraData.map(dataItem=>_renderExtraData(dataItem))}
        </View>
    )
}
