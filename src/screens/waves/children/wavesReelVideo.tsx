import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import Video from 'react-native-video';
import WebView from 'react-native-webview';
import { useIntl } from 'react-intl';
import { ShortVideo } from '@ecency/sdk';

import { Icon } from '../../../components';
import styles from '../styles/wavesReels.styles';

// Resolve a 3Speak video's HLS stream (manifest.m3u8) from its embed API, so the
// reel can play it natively (react-native-video) and fill the frame via
// resizeMode instead of being letterboxed inside an opaque WebView player. The
// feed only carries the embed iframe URL. Returns the primary URL (or a CDN
// fallback), or null when it can't be resolved.
async function resolveThreeSpeakHls(
  author: string,
  permlink: string,
  signal: AbortSignal,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://play.3speak.tv/api/embed?v=${encodeURIComponent(author)}/${encodeURIComponent(
        permlink,
      )}`,
      { signal },
    );
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    const url = [data?.videoUrl, data?.videoUrlFallback1, data?.videoUrlFallback2].find(
      (u: unknown): u is string => typeof u === 'string' && u.length > 0,
    );
    return url ?? null;
  } catch {
    return null;
  }
}

interface Props {
  video: ShortVideo;
  active: boolean;
}

/**
 * Native HLS reel player. Streams the 3Speak manifest into react-native-video so
 * the clip fills the reel aspect-aware: portrait/square clips fill (cover) and
 * landscape clips are letterboxed (contain) so nothing is cropped. While the
 * stream resolves it shows the poster (no black flash), and it falls back to the
 * 3Speak iframe (WebView) if the stream can't be resolved or played.
 */
const WavesReelVideo = ({ video, active }: Props) => {
  const intl = useIntl();
  const [src, setSrc] = useState<string | null>(null);
  const [resizeMode, setResizeMode] = useState<'cover' | 'contain'>('contain');
  const [muted, setMuted] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    const ac = new AbortController();
    let cancelled = false;
    (async () => {
      const url = await resolveThreeSpeakHls(video.author, video.permlink, ac.signal);
      if (cancelled) {
        return;
      }
      if (url) {
        setSrc(url);
      } else {
        setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [active, video.author, video.permlink]);

  if (failed) {
    const reelUrl = `https://play.3speak.tv/watch?v=${encodeURIComponent(
      video.author,
    )}/${encodeURIComponent(video.permlink)}&mode=iframe&autoplay=true`;
    return (
      <WebView
        source={{ uri: reelUrl }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        bounces={false}
        scrollEnabled={false}
        startInLoadingState
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        allowsProtectedMedia
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        mixedContentMode="compatibility"
        originWhitelist={['https://*.3speak.tv']}
      />
    );
  }

  if (!src) {
    return (
      <View style={styles.poster}>
        {video.thumbnail_url ? (
          <Image source={{ uri: video.thumbnail_url }} style={styles.posterImage} />
        ) : (
          <View style={styles.posterFallback} />
        )}
      </View>
    );
  }

  return (
    <>
      <Video
        source={{ uri: src }}
        style={styles.webview}
        paused={!active}
        muted={muted}
        repeat
        resizeMode={resizeMode}
        poster={video.thumbnail_url ?? undefined}
        onLoad={
          ((data: { naturalSize?: { orientation?: string } }) =>
            setResizeMode(
              data?.naturalSize?.orientation === 'portrait' ? 'cover' : 'contain',
            )) as any
        }
        onError={() => setFailed(true)}
      />
      <TouchableOpacity
        onPress={() => setMuted((m) => !m)}
        style={styles.muteBtn}
        accessibilityRole="button"
        accessibilityLabel={
          muted
            ? intl.formatMessage({ id: 'waves.unmute', defaultMessage: 'Unmute' })
            : intl.formatMessage({ id: 'waves.mute', defaultMessage: 'Mute' })
        }
      >
        <Icon
          iconType="MaterialCommunityIcons"
          name={muted ? 'volume-off' : 'volume-high'}
          style={styles.muteIcon}
        />
      </TouchableOpacity>
    </>
  );
};

export default WavesReelVideo;
