import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  LayoutChangeEvent,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import Svg, { Rect } from 'react-native-svg';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Icon } from '../icon';
import {
  formatDuration,
  getSpeakAudioStreamUrl,
  playbackProgress,
  playedBarCount,
} from './speakAudioPlayer.utils';
import { speakPlayback } from './speakPlaybackCoordinator';
import styles from './speakAudioPlayerStyles';

export interface SpeakMeta {
  audio_url: string;
  duration_ms?: number;
  waveform_peaks?: number[];
}

const WAVE_HEIGHT = 34;
const MIN_BAR_HEIGHT = 3;
const BAR_GAP = 2;

/**
 * Native player for Liketu "Speak" voice posts. Plays the transcoded AAC stream
 * (so iOS AVPlayer can decode it; the source is Opus/WebM) via react-native-video
 * and draws json_metadata.speak.waveform_peaks as a tappable waveform. The Video
 * element is mounted lazily on first play so we never transcode a clip the user
 * never listens to.
 */
const SpeakAudioPlayer = ({
  contentWidth,
  speak,
  author,
  permlink,
}: {
  contentWidth: number;
  speak: SpeakMeta;
  author?: string;
  permlink?: string;
}) => {
  const playerRef = useRef<VideoRef>(null);
  // When the user seeks before the stream has loaded, remember where to jump to
  // once onLoad fires.
  const seekOnLoadRef = useRef<number | null>(null);

  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
    speak.duration_ms && speak.duration_ms > 0 ? speak.duration_ms / 1000 : 0,
  );
  const [waveWidth, setWaveWidth] = useState(0);

  const uri = useMemo(() => getSpeakAudioStreamUrl(author, permlink), [author, permlink]);
  const peaks =
    Array.isArray(speak.waveform_peaks) && speak.waveform_peaks.length > 0
      ? speak.waveform_peaks
      : null;

  const progress = playbackProgress(currentTime, duration);
  const playedColor = EStyleSheet.value('$primaryBlue');
  const unplayedColor = EStyleSheet.value('$borderColor');

  // Single-active-player: a post and its voice comments each render a player, so
  // while this one is playing, pause any other that was playing. Cleared on
  // pause/end and on unmount.
  const _stop = useCallback(() => setPaused(true), []);
  useEffect(() => {
    if (started && !paused) {
      speakPlayback.activate(_stop);
    } else {
      speakPlayback.deactivate(_stop);
    }
  }, [started, paused, _stop]);
  useEffect(() => () => speakPlayback.deactivate(_stop), [_stop]);
  // The <Video> unmounts on pause (render gate below) before onLoad/onBuffer/
  // onError can clear a pending load, which would otherwise leave the spinner
  // stuck instead of the play button. Clear loading whenever this player pauses.
  useEffect(() => {
    if (paused) {
      setLoading(false);
    }
  }, [paused]);

  const _togglePlay = () => {
    if (!started) {
      setStarted(true);
    }
    setPaused((p) => !p);
  };

  const _seekToFraction = (fraction: number) => {
    if (duration <= 0) {
      return;
    }
    const target = Math.max(0, Math.min(1, fraction)) * duration;
    setCurrentTime(target);
    if (started) {
      playerRef.current?.seek(target);
    } else {
      // Start playback at the tapped position.
      seekOnLoadRef.current = target;
      setStarted(true);
      setPaused(false);
    }
  };

  const _onWaveLayout = (e: LayoutChangeEvent) => setWaveWidth(e.nativeEvent.layout.width);

  const _onWavePress = (e: GestureResponderEvent) => {
    if (waveWidth > 0) {
      _seekToFraction(e.nativeEvent.locationX / waveWidth);
    }
  };

  const _onLoad = (data: { duration: number }) => {
    if (Number.isFinite(data?.duration) && data.duration > 0) {
      setDuration(data.duration);
    }
    const pending = seekOnLoadRef.current;
    seekOnLoadRef.current = null;
    // Resume from where we paused: the <Video> is unmounted while paused (see the
    // render gate), so on re-mount seek back to the retained currentTime.
    playerRef.current?.seek(pending ?? currentTime);
    setLoading(false);
  };

  const _onProgress = (data: { currentTime: number }) => {
    if (!loading) {
      setCurrentTime(data.currentTime);
    }
  };

  const _onEnd = () => {
    setPaused(true);
    setCurrentTime(0);
    playerRef.current?.seek(0);
  };

  const _onError = () => {
    // Endpoint not yet deployed / transient stream failure: stop the spinner and
    // reset to a tappable paused state rather than spinning forever.
    setLoading(false);
    setPaused(true);
    setStarted(false);
  };

  const _renderWaveform = () => {
    if (waveWidth <= 0) {
      return null;
    }
    if (!peaks) {
      // No waveform data: a thin progress track.
      return (
        <View style={styles.fallbackTrack}>
          <View style={[styles.fallbackFill, { width: waveWidth * progress }]} />
        </View>
      );
    }
    const maxPeak = Math.max(...peaks, 0.0001);
    const barW = Math.max(1.5, (waveWidth - (peaks.length - 1) * BAR_GAP) / peaks.length);
    const played = playedBarCount(peaks.length, progress);
    return (
      <Svg width={waveWidth} height={WAVE_HEIGHT}>
        {peaks.map((peak, i) => {
          const h = Math.max(MIN_BAR_HEIGHT, (peak / maxPeak) * WAVE_HEIGHT);
          return (
            <Rect
              // positional waveform bars never reorder, so index is a stable key
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              x={i * (barW + BAR_GAP)}
              y={(WAVE_HEIGHT - h) / 2}
              width={barW}
              height={h}
              rx={barW / 2}
              fill={i < played ? playedColor : unplayedColor}
            />
          );
        })}
      </Svg>
    );
  };

  return (
    <View style={[styles.container, { width: contentWidth }]}>
      <Pressable
        style={styles.playButton}
        onPress={_togglePlay}
        accessibilityRole="button"
        accessibilityLabel={paused ? 'Play voice' : 'Pause voice'}
      >
        {loading ? (
          <ActivityIndicator size="small" color={EStyleSheet.value('$pureWhite')} />
        ) : (
          <Icon
            iconType="MaterialIcons"
            name={paused ? 'play-arrow' : 'pause'}
            size={24}
            style={styles.playIcon}
          />
        )}
      </Pressable>

      <Pressable style={styles.waveArea} onPress={_onWavePress} onLayout={_onWaveLayout}>
        {_renderWaveform()}
      </Pressable>

      <Text style={styles.time}>{formatDuration(started ? currentTime : duration)}</Text>

      {/* Mount the <Video> only while THIS player is actively playing, so at most
          ONE AVPlayer is alive across every player on the screen (a post + its
          voice comments). Multiple live AVPlayers contend for the iOS audio
          session: audio routes to one while the play/pause button targets another
          component — so pause "doesn't work", orphaned players keep playing after
          you navigate, and only one clip is audible. Unmounting on pause releases
          the player; resuming re-mounts and seeks back to currentTime. */}
      {started && !paused && !!uri && (
        <Video
          ref={playerRef}
          source={{ uri }}
          paused={paused}
          onLoad={_onLoad}
          onLoadStart={() => setLoading(true)}
          onProgress={_onProgress}
          onBuffer={({ isBuffering }) => setLoading(isBuffering)}
          onEnd={_onEnd}
          onError={_onError}
          ignoreSilentSwitch="ignore"
          // iOS-only, and ONLY while this player is actively playing. On iOS,
          // registering with the now-playing center is the one path that calls
          // AVAudioSession.setActive(true) (configureAudio otherwise just sets the
          // .playback category, never activates it — so after restarts/interruptions
          // the clip plays silently). Gating to `started && !paused` means it
          // registers on each play (re-activating the session) and DEREGISTERS on
          // pause, so paused players don't linger in the now-playing controls.
          // Excluded on Android: the prop there starts a foreground playback
          // service that needs extra manifest config, and Android plays fine
          // without it.
          showNotificationControls={Platform.OS === 'ios' && started && !paused}
          playInBackground={false}
          progressUpdateInterval={250}
          style={styles.hiddenVideo}
        />
      )}
    </View>
  );
};

export default SpeakAudioPlayer;
