import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import styles from './quickProfileStyles'

interface QuickProfileContentProps {
    isLoading:boolean,
    username:string
}

export const QuickProfileContent = ({
    isLoading,
    username
}:QuickProfileContentProps) => {
    return (
        <View style={styles.modalStyle}>
            <Text style={styles.title} >Profile content goes here</Text>
            <Text style={styles.bodyText}>{username}</Text>
            {isLoading && <ActivityIndicator/>}
        </View>
    )
}
