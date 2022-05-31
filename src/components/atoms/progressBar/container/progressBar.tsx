import React from 'react';
import { View } from "react-native"




export const ProgressBar = ({
    progress
}) => {

    return (
        <View style={{height:16, flex:1, flexDirection:'row', color:'green'}}>
            <View style={{flex:progress, color:'blue'}} />

            <View style={{flex:100 - progress}} />
        </View>
    )
}