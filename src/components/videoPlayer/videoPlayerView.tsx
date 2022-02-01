import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import YoutubeIframe, { InitialPlayerParams } from 'react-native-youtube-iframe';
import { WebViewSource } from 'react-native-webview/lib/WebViewTypes';

interface VideoPlayerProps {
  mode: 'source'|'youtube'|'url';
  contentWidth?: number;
  youtubeVideoId?: string;
  videoUrl?: string;
  startTime?: number;
  source?: WebViewSource;

  //prop for youtube player
  disableAutoplay?:boolean;
}

const VideoPlayer = ({ 
    youtubeVideoId, 
    videoUrl, 
    startTime, 
    source, 
    contentWidth = Dimensions.get('screen').width, 
    mode,
    disableAutoplay
  }: VideoPlayerProps) => {
  
  const PLAYER_HEIGHT = contentWidth * (9 / 16);

  const [shouldPlay, setShouldPlay] = useState(false);
  const [loading, setLoading] = useState(true);

  const _onReady = () => {
    setLoading(false);
    setShouldPlay(disableAutoplay ? false : true);
    console.log('ready');
  };

  const _onChangeState = (event: string) => {
    console.log(event);
    setShouldPlay(!(event == 'paused' || event == 'ended'));
  };

  const _onError = () => {
    console.log('error!');
    setLoading(false);
  };

  const initialParams: InitialPlayerParams = {
    start: startTime,
  };

  return (
    <View style={styles.container}>
      {mode === 'youtube' && youtubeVideoId && (
        <View style={{ width: contentWidth, height: PLAYER_HEIGHT }}>
          <YoutubeIframe
            height={PLAYER_HEIGHT}
            videoId={youtubeVideoId}
            initialPlayerParams={initialParams}
            onReady={_onReady}
            play={shouldPlay}
            onChangeState={_onChangeState}
            onError={_onError}
          />
        </View>
      )}
      {((mode === 'source' && source) || (mode === 'url' && videoUrl)) && (
        <View style={{ height: PLAYER_HEIGHT }}>
          <WebView
            scalesPageToFit={true}
            bounces={false}
            javaScriptEnabled={true}
            automaticallyAdjustContentInsets={false}
            onLoadEnd={() => {
              setLoading(false);
            }}
            onLoadStart={() => {
              setLoading(true);
            }}
            source={source || { uri: videoUrl }}
            style={{ width: contentWidth, height: PLAYER_HEIGHT}}
            startInLoadingState={true}
            onShouldStartLoadWithRequest={() => true}
            mediaPlaybackRequiresUserAction={true}
            allowsInlineMediaPlayback={true}
          />
        </View>
      )}
      {loading && <ActivityIndicator style={styles.activityIndicator} />}
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  activityIndicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
