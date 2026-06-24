// Matches emoji, pictographic symbols and their joiners/modifiers. Uses explicit
// UTF-16 surrogate ranges and \uXXXX escapes (not the `u` flag or
// \p{Extended_Pictographic}) so it behaves identically across engines, including
// Hermes. The surrogate pair spans U+1F000-1FFFF (emoticons, symbols, transport,
// flags, skin-tone modifiers); the BMP set covers symbols, dingbats, variation
// selectors, the zero-width joiner and the keycap combiner.
const EMOJI_REGEX = new RegExp(
  '[\\uD83C-\\uD83F][\\uDC00-\\uDFFF]' + // astral emoji (U+1F000-1FFFF)
    '|[\\u2600-\\u27BF\\u2300-\\u23FF\\u2B00-\\u2BFF]' + // BMP symbols
    '|[\\uFE00-\\uFE0F]|\\u200D|\\u20E3', // variation selectors, ZWJ, keycap
  'g',
);

/**
 * Splits emoji out of text before it is sent to the translation API. Emoji skew
 * LibreTranslate's language auto-detection (e.g. Spanish gets detected as
 * Portuguese, leaving the text untranslated) and are mangled in the output, so
 * we translate without them and re-attach them to the result.
 */
export const stripEmojis = (text: string): { clean: string; emojis: string } => {
  const emojis: string[] = [];
  const clean = text
    .replace(EMOJI_REGEX, (match) => {
      emojis.push(match);
      return ' ';
    })
    .replace(/\s{2,}/g, ' ')
    .trim();
  return { clean, emojis: emojis.join('') };
};
