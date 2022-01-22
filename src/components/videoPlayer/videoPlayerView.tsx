import React, { useState } from 'react';
import style from './videoPlayerStyles';
import { Dimensions } from 'react-native';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import YoutubeIframe, { InitialPlayerParams } from 'react-native-youtube-iframe';

interface VideoPlayerProps {
  youtubeVideoId?: string;
  videoUrl?: string;
  startTime?: number;
  contentWidth?: number;
}

const VideoPlayer = ({ youtubeVideoId, videoUrl, startTime, contentWidth }: VideoPlayerProps) => {
  const PLAYER_HEIGHT = Dimensions.get('screen').width * (9 / 16);

  const [shouldPlay, setShouldPlay] = useState(false);
  const [loading, setLoading] = useState(true);

  const _onReady = () => {
    setLoading(false);
    setShouldPlay(true);
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
      {youtubeVideoId && (
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
      {videoUrl && (
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
            source={{ uri: videoUrl }}
            style={{ width: contentWidth, height: (contentWidth * 9) / 16 }}
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
