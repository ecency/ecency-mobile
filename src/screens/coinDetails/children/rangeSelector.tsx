import React, { useState } from 'react'
import { View, Text } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { TouchableOpacity } from 'react-native-gesture-handler'
import styles from './children.styles'

interface RangeOption {
    label:string;
    value:number;
}

export const RangeSelector = () => {

    const [selectedRange, setSelectedRange] = useState(1);

    const _onSelection = (range:number) => {
        console.log('selection', range)
        setSelectedRange(range);
        //TODO: implement on range change prop
    }

    const _renderRangeButtons = FILTERS.map((item:RangeOption)=>(
        <TouchableOpacity onPress={()=>_onSelection(item.value)} >
            <View style={{
                ...styles.rangeOptionWrapper, 
                backgroundColor: EStyleSheet.value(
                        item.value === selectedRange ? 
                            '$primaryDarkText':'$primaryLightBackground'
                    ) 
                }}>
                <Text style={{
                     ...styles.textRange, 
                     color: EStyleSheet.value(
                             item.value === selectedRange ? 
                                 '$white':'$primaryDarkText'
                         ) 
                     }}>
                    {item.label}
                </Text>
            </View>
        </TouchableOpacity>
    ))

    return (
        <View style={[styles.card, styles.rangeContainer]}>
            {_renderRangeButtons}
        </View>
    )
}

const FILTERS = [
    {
        label:'24H',
        value:1
    },
    {
        label:'1W',
        value:7
    },
    {
        label:'1M',
        value:20
    },
    {
        label:'1Y',
        value:365
    },
    {
        label:'All',
        value:0
    },
] as RangeOption[]
