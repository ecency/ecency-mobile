// Listen: natural-voice audio of a post, unlocked once per reader with Points. The
// audio is made server-side; these helpers are the pure parts of the player, kept in
// step with the web player (apps/web/src/features/listen in vision-web).

export interface ListenTrackLike {
  lang: string;
  seconds: number;
}

export const LISTEN_SPEEDS = [1, 1.25, 1.5, 1.75, 2, 2.5];

// Generation takes about a quarter of the audio's length (measured 0.27 on the worker),
// rounded up a little so the estimate is not beaten by the wait.
const GENERATION_PER_AUDIO_SECOND = 0.3;

/** The speed after `speed` in LISTEN_SPEEDS, back to 1x after the fastest. */
export const nextSpeed = (speed: number): number =>
  LISTEN_SPEEDS[(LISTEN_SPEEDS.indexOf(speed) + 1) % LISTEN_SPEEDS.length];

/** m:ss for a number of seconds; 0:00 for anything that is not a time. */
export const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** The reader's interface language if the post has a track in it, else the main one. */
export const pickTrack = <T extends ListenTrackLike>(
  tracks: T[],
  uiLanguage: string,
): T | undefined => {
  const ui = (uiLanguage || '').split('-')[0];
  return tracks.find((t) => t.lang === ui) ?? tracks[0];
};

/** Minutes the audio of these languages takes to generate, at least one. */
export const preparingMinutes = (languages: { seconds: number }[]): number => {
  const audio = languages.reduce((sum, l) => sum + l.seconds, 0);
  return Math.max(1, Math.round((audio * GENERATION_PER_AUDIO_SECOND) / 60));
};

/** Minutes of audio, from the analysis when there is one, else from the word count. */
export const listenMinutes = (languages: { seconds: number }[], words: number): number => {
  if (languages.length) {
    return Math.max(1, Math.round(Math.max(...languages.map((l) => l.seconds)) / 60));
  }
  return Math.max(1, Math.round(words / 150));
};

// Code-point ranges of the scripts that matter here, checked in a plain loop rather than
// with \p{Script=...} (not reliably supported by Hermes) or regex character ranges (which
// would contain combining marks the linter rejects in a character class).
type Range = [number, number];
// Thai, Bengali, Hebrew, Tamil, Telugu: languages the voice cannot read.
const UNSUPPORTED: Range[] = [
  [0x0e00, 0x0e7f],
  [0x0980, 0x09ff],
  [0x0590, 0x05ff],
  [0x0b80, 0x0bff],
  [0x0c00, 0x0c7f],
];
const HAN: Range[] = [
  [0x3400, 0x4dbf],
  [0x4e00, 0x9fff],
  [0xf900, 0xfaff],
];
// Japanese and Korean are supported and also use Han characters. Any kana or hangul marks
// them (Chinese text has none), so kanji-heavy Japanese is never taken for Chinese.
const KANA_HANGUL: Range[] = [
  [0x3040, 0x30ff],
  [0x1100, 0x11ff],
  [0x3130, 0x318f],
  [0xac00, 0xd7af],
];
const LETTER = /\p{L}/u;

const inRanges = (cp: number, ranges: Range[]) => ranges.some(([lo, hi]) => cp >= lo && cp <= hi);

/**
 * True when most of a post's letters are in a script the voice cannot read (Thai,
 * Bengali, Hebrew, Tamil, Telugu, or Chinese). Links and image markup are left out
 * first. Only a first guess: the server's analysis overrides it either way.
 */
export const isUnreadableScript = (body: string): boolean => {
  const text = body.replace(/!?\[[^\]]*\]\([^)]*\)/g, ' ').replace(/https?:\/\/\S+/g, ' ');
  let letters = 0;
  let unsupported = 0;
  let han = 0;
  let kanaHangul = 0;
  Array.from(text).forEach((ch) => {
    if (!LETTER.test(ch)) return;
    letters += 1;
    const cp = ch.codePointAt(0) ?? 0;
    if (inRanges(cp, UNSUPPORTED)) unsupported += 1;
    else if (inRanges(cp, HAN)) han += 1;
    else if (inRanges(cp, KANA_HANGUL)) kanaHangul += 1;
  });
  if (letters === 0) return false;
  const chinese = kanaHangul > 0 ? 0 : han;
  return (unsupported + chinese) / letters > 0.5;
};
