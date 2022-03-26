import React from 'react'
import { View } from 'react-native'
import { CoinActions, CoinBasics, CoinChart } from '.'
import { FormattedCurrency } from '../../../components'
import { COIN_IDS } from '../../../constants/defaultCoins'
import { CoinData, DataPair } from '../../../redux/reducers/walletReducer'

export interface CoinSummaryProps {
    id:string;
    coinSymbol:string;
    coinData:CoinData;
    onActionPress:(action:string)=>void;
}

export const CoinSummary = ({
    coinSymbol, 
    id, 
    coinData,
    onActionPress,
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
            labelId:'amount_desc',
            value:balance
        }
    ] as DataPair[]

    if(estimateValue !== undefined){
        valuePairs.push({
            labelId:'estimated_value',
            value:<FormattedCurrency isApproximate isToken value={estimateValue} />,
        })
    }

    if(savings !== undefined){
        valuePairs.push({
            labelId:'savings',
            value:savings
        })
    }

    return (
        <View>
            <CoinBasics valuePairs={valuePairs} extraData={extraDataPairs} coinSymbol={coinSymbol}  />
            <CoinActions actions={actions} onActionPress={onActionPress}/>
            {
                id !== COIN_IDS.ECENCY && id !== COIN_IDS.HP && <CoinChart coinId={id} />
            }
        </View>
    )
}
