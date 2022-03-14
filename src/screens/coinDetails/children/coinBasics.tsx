import React from 'react'
import { useIntl } from 'react-intl';
import { View, Text } from 'react-native'
import { DataPair } from '../../../redux/reducers/walletReducer'
import styles from './children.styles'


interface CoinBasicsProps {
    valuePairs:DataPair[];
    extraData:DataPair[];
    coinSymbol:string;
}

export const CoinBasics = ({valuePairs, extraData, coinSymbol}:CoinBasicsProps) => {
    const intl = useIntl();
    const _renderCoinHeader = (
        <>
            <View style={styles.coinTitleContainer}>
             <Text style={styles.textCoinTitle}>{coinSymbol}</Text>
            </View>
         
            <Text style={styles.textHeaderChange}>{intl.formatMessage({id:'wallet.change'})} <Text style={styles.textPositive}>+10.13%</Text></Text>
        </>
    )

    const _renderValuePair = (args:DataPair) => {
        const label = intl.formatMessage({id:`wallet.${args.labelId}`})
        return (
            <>
                <Text style={styles.textBasicValue}>{args.value}</Text>
                <Text style={styles.textBasicLabel}>{label}</Text>
            </>
        )
    }

    const _renderExtraData = (args:DataPair) => {
        const label = intl.formatMessage({id:`wallet.${args.labelId}`})
        return (
            <View style={styles.extraDataContainer}>
                 <Text style={styles.textExtraLabel}>{label}</Text>
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
