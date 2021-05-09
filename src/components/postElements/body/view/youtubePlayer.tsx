import React, {useState} from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';

interface YoutubePlayerProps {
    videoId:string
}

const YoutubePlayer = ({videoId}: YoutubePlayerProps) => {

    const [shouldPlay, setShouldPlay] = useState(false);
    const [loading, setLoading] = useState(true);

    const _onReady = () => {
        setLoading(false)
        setShouldPlay(true);
    }

    const _onChangeState = (event:string) => {
        setShouldPlay(!(event == 'paused' || event == 'ended'));
    }

    const _onError = () => {
        setLoading(false)
    }

    return (
        <View style={styles.container}>
            
            {videoId && 
                <YoutubeIframe 
                    height={250} 
                    videoId={videoId} 
                    onReady={_onReady} 
                    play={shouldPlay} 
                    onChangeState={_onChangeState} 
                    onError={_onError}
                />
            }
            {loading && <ActivityIndicator style={styles.activityIndicator}/>}
        </View>
  );
};

export default YoutubePlayer;

const styles = StyleSheet.create({
    container: {
        paddingVertical:16,
    },
    activityIndicator: {
        position:'absolute', alignItems:'center', justifyContent:'center', top:0, bottom:0, left:0, right:0}
});
