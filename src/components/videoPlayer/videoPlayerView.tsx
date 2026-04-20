import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Image as RNImage,
} from 'react-native';

import WebView from 'react-native-webview';
import YoutubeIframe, { InitialPlayerParams } from 'react-native-youtube-iframe';
import Video from 'react-native-video';
import MediaControls, { PLAYER_STATES } from 'react-native-media-controls';
import Orientation from 'react-native-orientation-locker';
import { orientations } from '../../redux/constants/orientationsConstants';
import { useAppSelector } from '../../hooks';

interface VideoPlayerProps {
  mode: 'uri' | 'youtube';
  contentWidth?: number;
  youtubeVideoId?: string;
  startTime?: number;
  uri?: string;
  // prop for youtube player
  disableAutoplay?: boolean;
  // thumbnail URL used to detect portrait video orientation
  thumbnailUrl?: string;
}

const VideoPlayer = ({
  youtubeVideoId,
  startTime,
  uri,
  contentWidth,
  mode,
  disableAutoplay,
  thumbnailUrl,
}: VideoPlayerProps) => {
  const dim = useWindowDimensions();
  const videoPlayer = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paused, setPaused] = useState(true);
  const [playerState, setPlayerState] = useState(PLAYER_STATES.PAUSED);
  const [screenType, setScreenType] = useState('contain');
  const lockedOrientation = useAppSelector((state) => state.ui.lockedOrientation);

  const playerWidth = contentWidth || dim.width;
  const [playerHeight, setPlayerHeight] = useState(playerWidth * (9 / 16));
  const checkSrcRegex = /(.*?)\.(mp4|webm|ogg)$/gi;
  const isExtensionType = mode === 'uri' ? uri.match(checkSrcRegex) : false;

  // Reset height when URI changes; detect portrait from thumbnail if available
  useEffect(() => {
    let isActive = true;
    setPlayerHeight(playerWidth * (9 / 16));

    if (thumbnailUrl) {
      // Load the thumbnail to detect portrait/square orientation
      RNImage.getSize(
        thumbnailUrl,
        (w: number, h: number) => {
          if (!isActive) return;
          if (w > 0 && h > 0) {
            const ratio = h / w;
            if (ratio > 1.05) {
              // Portrait video — allow up to 16:9 portrait (9:16 → ratio 16/9)
              const cappedRatio = Math.min(ratio, 16 / 9);
              setPlayerHeight(playerWidth * cappedRatio);
            }
          }
        },
        () => {
          // Ignore thumbnail load errors
        },
      );
    }
    return () => {
      isActive = false;
    };
  }, [uri, playerWidth, thumbnailUrl]);

  useEffect(() => {
    if (isFullScreen) {
      Orientation.unlockAllOrientations();
    } else {
      // handle landscape/portrait lock according to initial lock setting
      if (lockedOrientation === orientations.LANDSCAPE) {
        Orientation.lockToLandscape();
      } else {
        Orientation.lockToPortrait();
      }
    }
  }, [isFullScreen, lockedOrientation]);

  useEffect(() => {
    return () => {
      if (lockedOrientation === orientations.LANDSCAPE) {
        Orientation.lockToLandscape();
      } else {
        Orientation.lockToPortrait();
      }
    };
  }, [lockedOrientation]);

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
    setScreenType('contain');
    // Small delay to let native fullscreen dismissal complete before locking orientation
    setTimeout(() => {
      if (lockedOrientation === orientations.LANDSCAPE) {
        Orientation.lockToLandscape();
      } else {
        Orientation.lockToPortrait();
      }
    }, 300);
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
          resizeMode={screenType as any}
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

  // Escape URI for safe HTML attribute interpolation
  const _sanitizeUri = (raw: string) =>
    raw.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const htmlIframeVideoPlayer = (_uri: string) =>
    `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0" />
  <style>
    * { padding: 0; margin: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; }
    iframe {
      border: 0;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
  </style>
</head>
<body>
  <iframe src="${_sanitizeUri(_uri)}"
    allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
    allowfullscreen></iframe>
  <script>
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === '3speak-player-ready' && window.ReactNativeWebView) {
        var msg = { type: 'aspectRatio' };
        if (e.data.isVertical) {
          msg.ratio = 16 / 9;
        } else if (e.data.aspectRatio && Math.abs(e.data.aspectRatio - 1) < 0.1) {
          msg.ratio = 1;
        }
        if (msg.ratio) {
          window.ReactNativeWebView.postMessage(JSON.stringify(msg));
        }
      }
    });
  </script>
</body>
</html>`;
  return (
    <View style={styles.container}>
      {mode === 'youtube' && youtubeVideoId && (
        <View style={{ width: playerWidth, height: playerHeight }}>
          <YoutubeIframe
            height={playerHeight}
            videoId={youtubeVideoId}
            initialPlayerParams={initialParams}
            onReady={_onReady}
            play={shouldPlay}
            onChangeState={_onChangeState}
            onError={_onError}
            onFullScreenChange={(status) => {
              setIsFullScreen(status);
              if (!status) {
                if (lockedOrientation === orientations.LANDSCAPE) {
                  Orientation.lockToLandscape();
                } else {
                  Orientation.lockToPortrait();
                }
              }
            }}
            webViewProps={{ mediaPlaybackRequiresUserAction: true }}
          />
        </View>
      )}
      {mode === 'uri' && uri && (
        <View style={[styles.playerWrapper, { height: playerHeight }]}>
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
              style={[styles.barkBackground, { width: playerWidth, height: playerHeight }]}
              startInLoadingState={true}
              onShouldStartLoadWithRequest={() => true}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              allowsFullscreenVideo={true}
              useWebKit={true}
              domStorageEnabled
              mixedContentMode="compatibility"
              originWhitelist={['*']}
              onMessage={(event) => {
                try {
                  const msg = JSON.parse(event.nativeEvent.data);
                  if (msg.type === 'aspectRatio' && msg.ratio) {
                    const cappedRatio = Math.min(msg.ratio, 16 / 9);
                    setPlayerHeight(playerWidth * cappedRatio);
                  }
                } catch {
                  // ignore non-JSON messages
                }
              }}
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
