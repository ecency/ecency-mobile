import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Comments, Header } from '../../../components';
import { getComments } from '../../../providers/hive/dhive';
import styles from '../styles/wavesScreen.styles';


const WavesScreen = () => {


    const [waves, setWaves] = useState([]);

    useEffect(() => {
        _fetchWaves()
    }, [])

    const _fetchWaves = async () => {
        const data = await getComments('ecency.waves', 'waves-2023-08-19');
        setWaves(data)
    }

    return (
        <View style={styles.container}>
            <Header />

            <View style={{ flex: 1 }}>
                <Comments
                    comments={waves}
                />
            </View>

        </View>
    );
};


export default WavesScreen;