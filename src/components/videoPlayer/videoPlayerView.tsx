import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import WebView from 'react-native-webview';
import YoutubeIframe, { InitialPlayerParams } from 'react-native-youtube-iframe';
import Video from 'react-native-video';
import MediaControls, { PLAYER_STATES } from 'react-native-media-controls';
import Orientation from 'react-native-orientation-locker';
import { useSelector } from 'react-redux';
import getWindowDimensions from '../../utils/getWindowDimensions';
import { orientations } from '../../redux/constants/orientationsConstants';

interface VideoPlayerProps {
  mode: 'uri' | 'youtube';
  contentWidth?: number;
  youtubeVideoId?: string;
  startTime?: number;
  uri?: string;
  // prop for youtube player
  disableAutoplay?: boolean;
}

const VideoPlayer = ({
  youtubeVideoId,
  startTime,
  uri,
  contentWidth = getWindowDimensions().width,
  mode,
  disableAutoplay,
}: VideoPlayerProps) => {
  const PLAYER_HEIGHT = contentWidth * (9 / 16);
  const checkSrcRegex = /(.*?)\.(mp4|webm|ogg)$/gi;
  const isExtensionType = mode === 'uri' ? uri.match(checkSrcRegex) : false;

  const videoPlayer = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paused, setPaused] = useState(true);
  const [playerState, setPlayerState] = useState(PLAYER_STATES.PAUSED);
  const [screenType, setScreenType] = useState('contain');
  const lockedOrientation = useSelector((state) => state.ui.lockedOrientation);

  useEffect(() => {
    if (isFullScreen) {
      Orientation.unlockAllOrientations();
    } else {
      // handle landscape/portrait lock according to initial lock setting
      if (lockedOrientation === orientations.LANDSCAPE) {
        !Orientation.isLocked() && Orientation.lockToLandscape();
      } else {
        !Orientation.isLocked() && Orientation.lockToPortrait();
      }
    }
  }, [isFullScreen]);

  // react-native-youtube-iframe handlers
  const [shouldPlay, setShouldPlay] = useState(false);
  const _onReady = () => {
    setIsLoading(false);
    setShouldPlay(!disableAutoplay);
    console.log('ready');
  };

  const _onChangeState = (event: string) => {
    console.log(event);
    setShouldPlay(!(event == 'paused' || event == 'ended'));
  };

  const _onError = () => {
    console.log('error!');
    setIsLoading(false);
  };

  const initialParams: InitialPlayerParams = {
    start: startTime,
  };

  // react-native-video player handlers
  const onSeek = (seek) => {
    videoPlayer.current.seek(seek);
  };

  const onPaused = (playerState) => {
    setPaused(!paused);
    setPlayerState(playerState);
  };

  const onReplay = () => {
    setPlayerState(PLAYER_STATES.PLAYING);
    videoPlayer.current.seek(0);
  };

  const onProgress = (data) => {
    if (!isLoading && playerState !== PLAYER_STATES.ENDED) {
      setCurrentTime(data.currentTime);
    }
  };

  const onLoad = (data) => {
    setDuration(data.duration);
    videoPlayer.current.seek(0);
    setIsLoading(false);
  };

  const onLoadStart = () => setIsLoading(true);

  const onEnd = () => setPlayerState(PLAYER_STATES.ENDED);

  const onError = () => alert('Error while playing');

  const exitFullScreen = () => {
    setIsFullScreen(false);
  };

  const enterFullScreen = () => {
    setIsFullScreen(true);
  };

  const onFullScreen = () => {
    setIsFullScreen(true);
    if (screenType == 'contain') setScreenType('cover');
    else setScreenType('contain');
  };

  const onSeeking = (currentTime) => setCurrentTime(currentTime);

  const _renderVideoplayerWithControls = () => {
    return (
      <View style={{ flex: 1 }}>
        <Video
          source={{
            uri,
          }}
          onEnd={onEnd}
          onLoad={onLoad}
          onLoadStart={onLoadStart}
          onProgress={onProgress}
          onError={onError}
          paused={paused}
          ref={videoPlayer}
          resizeMode="cover"
          fullscreen={isFullScreen}
          style={styles.mediaPlayer}
          volume={10}
          onFullscreenPlayerDidPresent={enterFullScreen}
          onFullscreenPlayerDidDismiss={exitFullScreen}
        />
        <MediaControls
          duration={duration}
          isLoading={isLoading}
          mainColor="#3c4449"
          onFullScreen={onFullScreen}
          onPaused={onPaused}
          onReplay={onReplay}
          onSeek={onSeek}
          onSeeking={onSeeking}
          playerState={playerState}
          progress={currentTime}
          isFullScreen={isFullScreen}
          fadeOutDelay={paused ? Number.MAX_VALUE : 3000}
          containerStyle={{}}
        />
      </View>
    );
  };

  const htmlIframeVideoPlayer = (uri) =>
    `
      <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width,height=device-height,initial-scale=1.0" />
              <style>
                * {
                    padding: 0;
                    margin: 0;
                    box-sizing: border-box;
                  }
                #iframeWrapper {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    height: 100%;
                  }
                </style>
            </head> 
            <body>
              <div id="iframeWrapper">
                <iframe width="100%" height="100%" src="${uri}" frameborder="0"  allowfullscreen>
                </iframe>
                </div>
          </body>
        </html>
                `;
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
            onFullScreenChange={(status) => setIsFullScreen(status)}
          />
        </View>
      )}
      {mode === 'uri' && uri && (
        <View style={[styles.playerWrapper, { height: PLAYER_HEIGHT }]}>
          {isExtensionType ? (
            _renderVideoplayerWithControls()
          ) : (
            <WebView
              scalesPageToFit={true}
              bounces={false}
              javaScriptEnabled={true}
              automaticallyAdjustContentInsets={true}
              onLoadEnd={() => {
                setIsLoading(false);
              }}
              onLoadStart={() => {
                setIsLoading(true);
              }}
              source={{ html: htmlIframeVideoPlayer(uri) }}
              style={[styles.barkBackground, { width: contentWidth, height: PLAYER_HEIGHT }]}
              startInLoadingState={true}
              onShouldStartLoadWithRequest={() => true}
              mediaPlaybackRequiresUserAction={true}
              allowsInlineMediaPlayback={true}
              allowsFullscreenVideo={true}
              useWebKit={true}
              domStorageEnabled
              originWhitelist={['*']}
            />
          )}
        </View>
      )}
      {isLoading && (
        <ActivityIndicator size="large" color="white" style={styles.activityIndicator} />
      )}
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
    top: 25,
    bottom: 0,
    left: 0,
    right: 0,
  },
  toolbar: {
    marginTop: 30,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  playerWrapper: {
    backgroundColor: 'black',
  },
  mediaPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  barkBackground: {
    backgroundColor: 'black',
  },
});
