import {
  LISTEN_SPEEDS,
  formatTime,
  isUnreadableScript,
  listenMinutes,
  nextSpeed,
  pickTrack,
  preparingMinutes,
} from './listen';

const TRACKS = [
  { lang: 'es', seconds: 160 },
  { lang: 'en', seconds: 150 },
];

describe('listen helpers', () => {
  it('cycles the speed up to 2.5x and back', () => {
    const seen = [1];
    for (let i = 0; i < LISTEN_SPEEDS.length; i++) seen.push(nextSpeed(seen[seen.length - 1]));
    expect(seen).toEqual([1, 1.25, 1.5, 1.75, 2, 2.5, 1]);
  });

  it('formats time', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65.9)).toBe('1:05');
    expect(formatTime(Number.NaN)).toBe('0:00');
  });

  it('prefers the interface language, else the main track', () => {
    expect(pickTrack(TRACKS, 'en-US')?.lang).toBe('en');
    expect(pickTrack(TRACKS, 'de-DE')?.lang).toBe('es');
    expect(pickTrack([], 'en')).toBeUndefined();
  });

  it('estimates the generation wait from the audio length', () => {
    // the first bilingual post: 201 s + 171 s of audio, made in 87 s
    expect(preparingMinutes([{ seconds: 201 }, { seconds: 171 }])).toBe(2);
    expect(preparingMinutes([{ seconds: 2700 }])).toBe(14);
    expect(preparingMinutes([])).toBe(1);
  });

  it('gives the audio length from the analysis, else the words', () => {
    expect(listenMinutes([{ seconds: 201 }, { seconds: 171 }], 0)).toBe(3);
    expect(listenMinutes([], 887)).toBe(6);
    expect(listenMinutes([], 20)).toBe(1);
  });

  it('tells unreadable scripts from supported ones', () => {
    expect(isUnreadableScript('สวัสดีครับ ทุกคน วันนี้อากาศดีมาก')).toBe(true); // Thai
    expect(isUnreadableScript('今天天气很好，我们去公园散步吧。')).toBe(true); // Chinese
    expect(isUnreadableScript('שלום לכולם, היום יום יפה')).toBe(true); // Hebrew
    expect(isUnreadableScript('今日はとても良い天気ですね。公園に行きましょう。')).toBe(false);
    // 33 kanji and a single kana is still Japanese
    expect(
      isUnreadableScript('東京都庁舎展望室見学報告新宿駅西口徒歩十分入場無料営業時間午前九時の'),
    ).toBe(false);
    expect(isUnreadableScript('오늘 날씨가 정말 좋네요')).toBe(false);
    expect(isUnreadableScript('Hola a todos, hoy es un buen día')).toBe(false);
    expect(isUnreadableScript('مرحبا بالجميع')).toBe(false); // Arabic: left to the server
    expect(isUnreadableScript('Great trip ![](https://images.ecency.com/漢字.png) 很好')).toBe(
      false,
    );
    expect(isUnreadableScript('')).toBe(false);
  });
});
