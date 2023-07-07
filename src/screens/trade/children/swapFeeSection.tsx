import React from 'react';
import { View, Text } from "react-native";
import styles from '../styles/sawpFeeSection.styles';


// Reusable component for label, text input, and bottom text
export const SwapFeeSection = () => {

    return (
        <View style={styles.container} >
            <Text style={styles.label}>{'Fee'}</Text>
            <View style={styles.freeContainer}>
                <Text style={styles.free}>{'Free'}</Text>
            </View>

        </View>
    );
};