import React from 'react'
import { View } from 'react-native'
import { CoinBasics, CoinChart } from '.'
import { FormattedCurrency } from '../../../components'
import { COIN_IDS } from '../../../constants/defaultCoins'
import { CoinData, DataPair } from '../../../redux/reducers/walletReducer'
import CoinActions from './coinActions'

export interface CoinSummaryProps {
    id:string;
    coinSymbol:string;
    coinData:CoinData;
}

export const CoinSummary = ({
    coinSymbol, 
    id, 
    coinData,
}:CoinSummaryProps) => {
    const { 
        balance, 
        estimateValue, 
        savings,    
        extraDataPairs, 
        actions 
    } = coinData

    const valuePairs = [
        {
            label:'Balance',
            value:balance
        }
    ] as DataPair[]

    if(estimateValue !== undefined){
        valuePairs.push({
            label:'Estimated Value',
            value:<FormattedCurrency isApproximate isToken value={estimateValue} />,
        })
    }

    if(savings !== undefined){
        valuePairs.push({
            label:'Savings',
            value:savings
        })
    }

    return (
        <View>
            <CoinBasics valuePairs={valuePairs} extraData={extraDataPairs} coinSymbol={coinSymbol}  />
            <CoinActions actions={actions} />
            {
                id !== COIN_IDS.ECENCY && id !== COIN_IDS.HP && <CoinChart coinId={id} />
            }
        </View>
    )
}
