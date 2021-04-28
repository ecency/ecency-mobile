import React from 'react';
import { View } from 'react-native';
import YouTube from 'react-native-youtube';

const YoutubePlayer = ({navigation}) => {
    
    const videoId = navigation.getParam('videoId');

    if(!videoId){
        throw new Error("Please pass videoId");
    }

    return (
        <View style={{flex:1, backgroundColor:'black', justifyContent:'center', alignItems:'center'}} >
            <YouTube
                videoId={videoId} // The YouTube video ID
                play // control playback of video with true/false
                fullscreen // control whether the video should play in fullscreen or inline
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


