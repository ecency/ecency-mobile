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
        },{
            label:'Estimated Value',
            value:<FormattedCurrency isApproximate isToken value={estimateValue} />,
        }
    ] as DataPair[]

    if(savings !== undefined){
        valuePairs.push({
            label:'Savings',
            value:savings
        })
    }
    if(extraData){
        valuePairs.push(...extraData);
    }

    return (
        <View>
            <CoinBasics valuePairs={valuePairs} coinSymbol={coinSymbol}  />
            {
                id !== COIN_IDS.ECENCY && id !== COIN_IDS.HP && <CoinChart coingeckoId={id} />
            }
            
        </View>
    )
}
