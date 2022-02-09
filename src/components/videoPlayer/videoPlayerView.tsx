import React, { useState, useRef } from 'react';
import { Dimensions } from 'react-native';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import YoutubeIframe, { InitialPlayerParams } from 'react-native-youtube-iframe';
import Video from 'react-native-video';

interface VideoPlayerProps {
  mode: 'source' | 'youtube';
  contentWidth?: number;
  youtubeVideoId?: string;
  startTime?: number;
  source?: string;
  //prop for youtube player
  disableAutoplay?: boolean;
}

const VideoPlayer = ({
  youtubeVideoId,
  startTime,
  source,
  contentWidth = Dimensions.get('screen').width,
  mode,
  disableAutoplay,
}: VideoPlayerProps) => {
  const PLAYER_HEIGHT = contentWidth * (9 / 16);
  const checkSrcRegex = /(.*?)\.(mp4|webm|ogg)$/gi;
  const isExtensionType = mode === 'source' ? source.match(checkSrcRegex) : false;

  const [shouldPlay, setShouldPlay] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoPlayerRef = useRef(null);
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
      {mode === 'source' && source && (
        <View style={{ height: PLAYER_HEIGHT }}>
          {isExtensionType ? (
            <Video
              source={{ uri: source }}
              ref={videoPlayerRef}
              onBuffer={() => console.log('buffering')}
              onError={() => console.log('error while playing')}
              onEnd={() => console.log('end playing!')}
              onLoadStart={() => setLoading(true)}
              onLoad={() => setLoading(false)}
              style={styles.videoPlayer}
              controls
              paused
            />
          ) : (
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
              source={{ uri: source }}
              style={{ width: contentWidth, height: PLAYER_HEIGHT }}
              startInLoadingState={true}
              onShouldStartLoadWithRequest={() => true}
              mediaPlaybackRequiresUserAction={true}
              allowsInlineMediaPlayback={true}
            />
          )}
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
  videoPlayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
