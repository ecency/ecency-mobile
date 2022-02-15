import React from 'react'
import { View } from 'react-native'
import { CoinBasics, CoinChart, RangeSelector, ValuePair } from '.'
import { FormattedCurrency } from '../../../components'

export interface CoinSummaryProps {
    balance:number;
    estimateValue:number;
    savings:number;
    coinSymbol:string;
}

export const CoinSummary = ({balance, estimateValue, savings, coinSymbol}:CoinSummaryProps) => {
    const valuePairs = [
        {
            label:'Balance',
            value:balance
        },{
            label:'Estimated Value',
            value:<FormattedCurrency isApproximate isToken value={estimateValue} />,
        },{
            label:'Savings',
            value:savings
        }
    ] as ValuePair[]
    return (
        <View>
            <CoinBasics valuePairs={valuePairs} coinSymbol={coinSymbol}  />
            <CoinChart />
            <RangeSelector />
        </View>
    )
}
