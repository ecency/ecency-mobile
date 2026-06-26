import {
  SPEAK_AUDIO_ENDPOINT,
  getSpeakAudioStreamUrl,
  formatDuration,
  playedBarCount,
  playbackProgress,
} from './speakAudioPlayer.utils';

describe('getSpeakAudioStreamUrl', () => {
  it('builds the endpoint url from author + permlink', () => {
    const url = getSpeakAudioStreamUrl('erilej', 're-liketu-speak-x');
    expect(url).toBe(`${SPEAK_AUDIO_ENDPOINT}?author=erilej&permlink=re-liketu-speak-x`);
  });

  it('encodes the params', () => {
    expect(getSpeakAudioStreamUrl('a b', 'p/q')).toBe(
      `${SPEAK_AUDIO_ENDPOINT}?author=a%20b&permlink=p%2Fq`,
    );
  });

  it('returns an empty string when author or permlink is missing', () => {
    expect(getSpeakAudioStreamUrl(undefined, undefined)).toBe('');
    expect(getSpeakAudioStreamUrl('erilej', undefined)).toBe('');
    expect(getSpeakAudioStreamUrl(undefined, 'permlink')).toBe('');
    expect(getSpeakAudioStreamUrl('', '')).toBe('');
  });
});

describe('formatDuration', () => {
  it.each([
    [60, '1:00'],
    [5, '0:05'],
    [0, '0:00'],
    [125, '2:05'],
    [59.9, '0:59'],
  ])('formats %s seconds as %s', (input, expected) => {
    expect(formatDuration(input)).toBe(expected);
  });

  it('treats invalid/negative input as zero', () => {
    expect(formatDuration(undefined)).toBe('0:00');
    expect(formatDuration(-10)).toBe('0:00');
    expect(formatDuration(NaN)).toBe('0:00');
  });
});

describe('playedBarCount', () => {
  it('returns a clamped, rounded count of played bars', () => {
    expect(playedBarCount(48, 0)).toBe(0);
    expect(playedBarCount(48, 1)).toBe(48);
    expect(playedBarCount(48, 0.5)).toBe(24);
    expect(playedBarCount(48, 2)).toBe(48); // over-progress clamps to count
    expect(playedBarCount(48, -1)).toBe(0);
  });

  it('handles empty waveforms', () => {
    expect(playedBarCount(0, 0.5)).toBe(0);
  });
});

describe('playbackProgress', () => {
  it('returns the clamped fraction', () => {
    expect(playbackProgress(30, 60)).toBe(0.5);
    expect(playbackProgress(90, 60)).toBe(1);
    expect(playbackProgress(10, 0)).toBe(0); // no duration yet
    expect(playbackProgress(-5, 60)).toBe(0);
  });
});
