import React from 'react'
import { View } from 'react-native'
import { CoinBasics, CoinChart } from '.'
import { FormattedCurrency } from '../../../components'
import { COIN_IDS } from '../../../constants/defaultCoins'
import { DataPair } from '../../../redux/reducers/walletReducer'

export interface CoinSummaryProps {
    balance:number;
    estimateValue:number;
    savings:number;
    coinSymbol:string;
    id:string;
    extraData?:DataPair[]
}

export const CoinSummary = ({balance, estimateValue, savings, coinSymbol, id, extraData}:CoinSummaryProps) => {
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
            <CoinBasics valuePairs={valuePairs} extraData={extraData} coinSymbol={coinSymbol}  />
            {
                id !== COIN_IDS.ECENCY && id !== COIN_IDS.HP && <CoinChart coinId={id} />
            }
        </View>
    )
}
