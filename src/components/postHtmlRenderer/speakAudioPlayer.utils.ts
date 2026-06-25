// Helpers for the Liketu Speak voice-post player. Kept pure + separate from the
// component so the URL building and waveform/time math are unit-testable.

// The web endpoint that transcodes Liketu's Opus/WebM voice clips to AAC/m4a so
// iOS AVPlayer (react-native-video) can play them. See vision-next
// /api/speak-audio. The source audio is immutable, so responses are edge-cached.
export const SPEAK_AUDIO_ENDPOINT = 'https://ecency.com/api/speak-audio';

/** Build the playable (transcoded) stream URL for a Liketu Speak audio file. */
export const getSpeakAudioStreamUrl = (audioUrl?: string | null): string =>
  audioUrl ? `${SPEAK_AUDIO_ENDPOINT}?src=${encodeURIComponent(audioUrl)}` : '';

/** Format seconds as "m:ss" (e.g. 60 -> "1:00", 5 -> "0:05"). */
export const formatDuration = (seconds?: number): string => {
  const s = Number.isFinite(seconds) && (seconds as number) > 0 ? Math.floor(seconds as number) : 0;
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
};

/**
 * How many of `barCount` waveform bars should render as "played" for a given
 * progress fraction (0..1). Clamped so it never exceeds the bar count.
 */
export const playedBarCount = (barCount: number, progress: number): number => {
  if (barCount <= 0) return 0;
  const clamped = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  return Math.min(barCount, Math.round(clamped * barCount));
};

/** Playback progress fraction (0..1) from current time + total duration. */
export const playbackProgress = (currentTime: number, duration: number): number => {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return Math.max(0, Math.min(1, currentTime / duration));
};
