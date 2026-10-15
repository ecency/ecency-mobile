import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import Slider from '@react-native-community/slider';
import Video, { VideoRef } from 'react-native-video';
import type { ListenTrack } from '@ecency/sdk';
import { Icon } from '../icon';
import { languageDisplayName } from '../../utils/iso639';
import { formatTime, nextSpeed, pickTrack } from '../../utils/listen';
import { speakPlayback } from '../postHtmlRenderer/speakPlaybackCoordinator';

// A signed URL that keeps failing is really gone: stop asking for fresh ones.
const MAX_URL_REFRESHES = 3;

interface ListenAudioProps {
  post: any;
  tracks: ListenTrack[];
  uiLanguage: string;
  /** The signed URL expired: fetch the status again for fresh ones. */
  onExpired: () => Promise<void> | void;
}

/**
 * The unlocked player. Keeps playing in the background and shows lock-screen / media
 * notification controls (iOS `audio` background mode, Android media playback service),
 * and goes through the same coordinator as 3Speak audio so only one plays at a time.
 */
export const ListenAudio = ({ post, tracks, uiLanguage, onExpired }: ListenAudioProps) => {
  const intl = useIntl();
  const playerRef = useRef<VideoRef>(null);
  const [lang, setLang] = useState(() => pickTrack(tracks, uiLanguage)?.lang);
  const track = tracks.find((t) => t.lang === lang) ?? tracks[0];

  // The player is mounted from the first play on, so the lock-screen controls stay while
  // paused; before that nothing is loaded.
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(true);
  const [loading, _setLoading] = useState(false);
  // Read by the playback-state handler, which must not act on a stale render's value.
  const loadingRef = useRef(false);
  const setLoading = (value: boolean) => {
    loadingRef.current = value;
    _setLoading(value);
  };
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(track.seconds);
  const [speed, setSpeed] = useState(1);
  const [seeking, setSeeking] = useState<number | null>(null);
  // Where to resume after the source changes: a refreshed URL, or a switched track.
  const resumeRef = useRef<number | null>(null);
  const refreshesRef = useRef(0);
  // The URL could not be renewed: say so and offer a retry rather than a silent player.
  const [failed, setFailed] = useState(false);

  const stop = useCallback(() => setPaused(true), []);

  useEffect(() => {
    if (!paused) speakPlayback.activate(stop);
    else speakPlayback.deactivate(stop);
  }, [paused, stop]);

  useEffect(() => () => speakPlayback.deactivate(stop), [stop]);

  const _toggle = () => {
    if (!started) setStarted(true);
    setPaused((p) => !p);
  };

  const _onLoad = ({ duration: d }: { duration: number }) => {
    setLoading(false);
    if (Number.isFinite(d) && d > 0) setDuration(d);
    if (resumeRef.current !== null) {
      playerRef.current?.seek(resumeRef.current);
      resumeRef.current = null;
    }
  };

  const _renew = () =>
    Promise.resolve()
      .then(onExpired)
      .catch(() => {
        setPaused(true);
        setFailed(true);
      });

  const _onError = () => {
    // Most likely the signed URL expired: fetch a fresh one and pick up here.
    if (refreshesRef.current >= MAX_URL_REFRESHES) {
      setPaused(true);
      setFailed(true);
      return;
    }
    refreshesRef.current += 1;
    resumeRef.current = time;
    _renew();
  };

  const _retry = () => {
    setFailed(false);
    refreshesRef.current = 0;
    resumeRef.current = time;
    _renew();
  };

  const _switchTrack = (next: string) => {
    if (next === track.lang) return;
    resumeRef.current = 0;
    setTime(0);
    setLang(next);
  };

  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={_toggle}
          style={styles.playButton}
          accessibilityRole="button"
          accessibilityLabel={intl.formatMessage({ id: paused ? 'listen.play' : 'listen.pause' })}
        >
          {loading && !paused ? (
            <ActivityIndicator size="small" color={EStyleSheet.value('$white')} />
          ) : (
            <Icon
              iconType="MaterialCommunityIcons"
              name={paused ? 'play' : 'pause'}
              size={24}
              color={EStyleSheet.value('$white')}
            />
          )}
        </TouchableOpacity>
        <Text style={styles.time}>{formatTime(seeking ?? time)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={Math.max(1, duration)}
          value={seeking ?? time}
          minimumTrackTintColor={EStyleSheet.value('$primaryBlue')}
          maximumTrackTintColor={EStyleSheet.value('$primaryLightBackground')}
          thumbTintColor={EStyleSheet.value('$primaryBlue')}
          onValueChange={setSeeking}
          onSlidingComplete={(v) => {
            setSeeking(null);
            setTime(v);
            playerRef.current?.seek(v);
          }}
          accessibilityLabel={intl.formatMessage({ id: 'listen.seek' })}
        />
        <Text style={styles.time}>{formatTime(duration)}</Text>
        <TouchableOpacity
          style={styles.chip}
          onPress={() => setSpeed(nextSpeed(speed))}
          accessibilityRole="button"
          accessibilityLabel={intl.formatMessage({ id: 'listen.speed' })}
        >
          <Text style={styles.chipText}>{`${speed}x`}</Text>
        </TouchableOpacity>
      </View>

      {failed && (
        <View style={styles.failedRow}>
          <Text style={styles.failedText}>{intl.formatMessage({ id: 'listen.unavailable' })}</Text>
          <TouchableOpacity onPress={_retry} accessibilityRole="button">
            <Text style={styles.retryText}>{intl.formatMessage({ id: 'listen.retry' })}</Text>
          </TouchableOpacity>
        </View>
      )}

      {tracks.length > 1 && (
        <View
          style={styles.langRow}
          accessibilityLabel={intl.formatMessage({ id: 'listen.language' })}
        >
          {tracks.map((t) => {
            const active = t.lang === track.lang;
            return (
              <TouchableOpacity
                key={t.lang}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => _switchTrack(t.lang)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {languageDisplayName(t.lang)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {started && (
        <Video
          ref={playerRef}
          source={{
            uri: track.url,
            metadata: {
              title: post?.title || '',
              artist: `@${post?.author}`,
              subtitle: 'Ecency',
            },
          }}
          paused={paused}
          rate={speed}
          playInBackground={true}
          playWhenInactive={true}
          ignoreSilentSwitch="ignore"
          showNotificationControls={true}
          progressUpdateInterval={500}
          onLoadStart={() => setLoading(true)}
          onLoad={_onLoad}
          onBuffer={({ isBuffering }) => setLoading(isBuffering)}
          onProgress={({ currentTime }) => setTime(currentTime)}
          // Lock-screen and notification play/pause act on the player directly; keep the
          // button in step with them. Not while loading or seeking: the player reports
          // "not playing" then too, and following it would pause before the start.
          onPlaybackStateChanged={({ isPlaying, isSeeking }) => {
            if (!loadingRef.current && !isSeeking) setPaused(!isPlaying);
          }}
          onEnd={() => {
            setPaused(true);
            setTime(0);
            playerRef.current?.seek(0);
          }}
          onError={_onError}
          style={styles.hiddenVideo}
        />
      )}
    </View>
  );
};

const styles = EStyleSheet.create({
  bar: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '$primaryLightBackground',
    borderRadius: 12,
    backgroundColor: '$primaryBackgroundColor',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryBlue',
  },
  time: {
    fontSize: 12,
    color: '$primaryDarkGray',
    fontVariant: ['tabular-nums'],
  },
  slider: {
    flex: 1,
    height: 32,
  },
  failedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  failedText: {
    flex: 1,
    fontSize: 12,
    color: '$primaryDarkGray',
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '$primaryBlue',
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderWidth: 1,
    borderColor: '$primaryLightBackground',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipActive: {
    borderColor: '$primaryBlue',
  },
  chipText: {
    fontSize: 12,
    color: '$primaryBlack',
    fontVariant: ['tabular-nums'],
  },
  chipTextActive: {
    color: '$primaryBlue',
  },
  hiddenVideo: {
    width: 0,
    height: 0,
  },
});
