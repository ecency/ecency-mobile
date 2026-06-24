import { stripEmojis } from './emojiStrip';

describe('stripEmojis', () => {
  it('removes trailing emoji and returns them separately', () => {
    // Regression: 'Mi sobrina posando 😂❤️' was detected as Portuguese because
    // of the emoji, leaving 'Mi sobrina' untranslated.
    const { clean, emojis } = stripEmojis('Mi sobrina posando 😂❤️');
    expect(clean).toBe('Mi sobrina posando');
    expect(emojis).toBe('😂❤️');
  });

  it('removes emoji interspersed in the text and collapses whitespace', () => {
    const { clean, emojis } = stripEmojis('Hola 👋 amigos 😊');
    expect(clean).toBe('Hola amigos');
    expect(emojis).toBe('👋😊');
  });

  it('keeps ZWJ emoji sequences intact when re-joined', () => {
    const { clean, emojis } = stripEmojis('family 👨‍👩‍👧 photo');
    expect(clean).toBe('family photo');
    expect(emojis).toBe('👨‍👩‍👧');
  });

  it('returns the text unchanged when there are no emoji', () => {
    const { clean, emojis } = stripEmojis('Hello world');
    expect(clean).toBe('Hello world');
    expect(emojis).toBe('');
  });

  it('yields empty clean text for emoji-only input', () => {
    const { clean, emojis } = stripEmojis('😂❤️🎉');
    expect(clean).toBe('');
    expect(emojis).toBe('😂❤️🎉');
  });
});
