import React from 'react';
import { View } from 'react-native';
import YouTube from 'react-native-youtube';

const YoutubePlayer = ({navigation}) => {
    
    return (
        <View style={{flex:1, backgroundColor:'black', justifyContent:'center', alignItems:'center'}} >
            <YouTube
                videoId={"SCgX4ixCRcQ"} // The YouTube video ID
                play // control playback of video with true/false
                fullscreen // control whether the video should play in fullscreen or inline
                loop // control whether the video should loop when ended
                onReady={e => {
                  
                }}
                onChangeFullscreen={(e)=>{
                    if(!e.isFullscreen){
                        navigation.goBack();
                    }
                }}
                onError={e => {
                    navigation.goBack();
                }}
                style={{ alignSelf: 'stretch', height: '90%', backgroundColor:'black' }}
                origin="http://www.youtube.com"
            />
        </View>
    )
};


export default YoutubePlayer


