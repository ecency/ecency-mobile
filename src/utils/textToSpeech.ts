/**
 * Utility functions for Text-to-Speech feature
 */

/**
 * Extracts plain text from a post for TTS reading
 * Removes markdown, HTML, links, and other non-readable content
 */
export const extractPlainTextForTTS = (post: any): string => {
  if (!post || !post.body) {
    return '';
  }

  let text = post.body;

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Remove markdown images: ![alt](url)
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');

  // Remove links but keep text: [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, ' ');

  // Remove markdown headers: ## Header -> Header
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove code blocks: ```code```
  text = text.replace(/```[\s\S]*?```/g, '');

  // Remove inline code: `code`
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove markdown bold/italic: **text** or *text* -> text
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');

  // Remove markdown strikethrough: ~~text~~ -> text
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // Remove horizontal rules: --- or ***
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // Remove blockquotes: > text
  text = text.replace(/^>\s+/gm, '');

  // Remove HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Remove URLs
  text = text.replace(/https?:\/\/[^\s]+/g, '');

  // Remove extra whitespace and newlines
  text = text.replace(/\s+/g, ' ').trim();

  // Add natural pauses after sentences for better TTS flow
  text = text.replace(/\.\s+/g, '. ... ');
  text = text.replace(/\?\s+/g, '? ... ');
  text = text.replace(/!\s+/g, '! ... ');

  return text;
};

/**
 * Android TTS has a ~4000 character limit per speak() call.
 * Split text into chunks at sentence boundaries to stay within the limit.
 */
const TTS_CHUNK_LIMIT = 3500; // leave headroom below Android's 4000 char limit

export const chunkTextForTTS = (text: string): string[] => {
  const normalized = text?.trim() || '';
  if (normalized.length === 0) {
    return [];
  }

  if (normalized.length <= TTS_CHUNK_LIMIT) {
    return [normalized];
  }

  const chunks: string[] = [];
  let remaining = normalized;

  while (remaining.length > 0) {
    if (remaining.length <= TTS_CHUNK_LIMIT) {
      chunks.push(remaining);
      break;
    }

    // Find the last sentence boundary within the limit
    const slice = remaining.substring(0, TTS_CHUNK_LIMIT);
    let splitIndex = -1;

    // Prefer splitting at sentence endings (ASCII and CJK punctuation)
    for (let i = slice.length - 1; i >= slice.length / 2; i--) {
      const ch = slice[i];
      if (
        ch === '.' ||
        ch === '!' ||
        ch === '?' ||
        ch === '\u3002' ||
        ch === '\uff01' ||
        ch === '\uff1f'
      ) {
        splitIndex = i + 1;
        break;
      }
    }

    // Fallback to last space if no sentence boundary found
    if (splitIndex === -1) {
      splitIndex = slice.lastIndexOf(' ');
    }

    // Last resort: hard split at limit
    if (splitIndex <= 0) {
      splitIndex = TTS_CHUNK_LIMIT;
    }

    chunks.push(remaining.substring(0, splitIndex).trim());
    remaining = remaining.substring(splitIndex).trim();
  }

  return chunks;
};

/**
 * CJK character regex range covering Chinese, Japanese (Kanji/Hiragana/Katakana), and Korean (Hangul)
 */
const CJK_REGEX =
  /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;

/**
 * Matches tokens that are entirely punctuation or symbols (no letters/digits).
 * Uses Unicode property escape to cover non-ASCII punctuation (e.g. em-dashes, quotes).
 */
const PUNCTUATION_ONLY_REGEX = /^\p{P}+$/u;

/** Split non-CJK text into words, excluding punctuation-only tokens */
const countNonCjkWords = (text: string): number => {
  const nonCjkText = text.replace(CJK_REGEX, ' ').trim();
  if (nonCjkText.length === 0) {
    return 0;
  }
  return nonCjkText
    .split(/\s+/)
    .filter((token) => token.length > 0 && !PUNCTUATION_ONLY_REGEX.test(token)).length;
};

/**
 * Count words in text, properly handling CJK (Chinese/Japanese/Korean) languages.
 * CJK characters are logographic — each character carries word-level meaning,
 * so they are counted individually. Non-CJK segments are split by whitespace.
 */
export const countWords = (text: string): number => {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  // Count CJK characters
  const cjkMatches = text.match(CJK_REGEX);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;

  return cjkCount + countNonCjkWords(text);
};

/**
 * Estimate reading time considering CJK vs Latin text.
 * CJK reading speed is ~500 characters/min; English is ~200 words/min.
 */
export const estimateReadingMinutes = (text: string): number => {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  const cjkMatches = text.match(CJK_REGEX);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;

  const nonCjkWords = countNonCjkWords(text);

  // No actual word content → 0 minutes
  if (cjkCount === 0 && nonCjkWords === 0) {
    return 0;
  }

  // CJK: ~500 chars/min, Non-CJK: ~200 words/min
  const cjkMinutes = cjkCount / 500;
  const nonCjkMinutes = nonCjkWords / 200;

  return Math.max(1, Math.ceil(cjkMinutes + nonCjkMinutes));
};

/**
 * Detect dominant language of text using character-range heuristics.
 * Returns a BCP 47 language tag suitable for expo-speech.
 *
 * Strategy: count CJK script characters; if they exceed 30% of all
 * alphanumeric content, pick the dominant CJK script. Otherwise fall back
 * to English.
 */
const HANGUL_REGEX = /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/g;
const KANA_REGEX = /[\u3040-\u309f\u30a0-\u30ff\u31f0-\u31ff]/g;
const HAN_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g;
const ALPHA_NUM_REGEX = /[a-zA-Z0-9]/g;

export const detectTextLanguage = (text: string): string => {
  if (!text || text.trim().length === 0) {
    return 'en-US';
  }

  const hangulCount = (text.match(HANGUL_REGEX) || []).length;
  const kanaCount = (text.match(KANA_REGEX) || []).length;
  const hanCount = (text.match(HAN_REGEX) || []).length;
  const alphaNumCount = (text.match(ALPHA_NUM_REGEX) || []).length;

  const totalChars = hangulCount + kanaCount + hanCount + alphaNumCount;
  if (totalChars === 0) {
    return 'en-US';
  }

  const cjkTotal = hangulCount + kanaCount + hanCount;
  if (cjkTotal / totalChars < 0.3) {
    return 'en-US';
  }

  // Korean: dominant Hangul
  if (hangulCount >= kanaCount && hangulCount >= hanCount) {
    return 'ko-KR';
  }

  // Japanese: Kana present (even if Han chars outnumber, Kana is unique to Japanese)
  if (kanaCount > 0) {
    return 'ja-JP';
  }

  // Chinese: Han chars dominant with no Kana/Hangul
  return 'zh-CN';
};

/**
 * Check if post has readable text content
 */
export const hasReadableContent = (post: any): boolean => {
  const text = extractPlainTextForTTS(post);
  // Require at least 10 characters of text
  return text.length >= 10;
};

/**
 * Get estimated reading time in seconds
 */
export const getEstimatedReadingTime = (post: any): number => {
  const text = extractPlainTextForTTS(post);
  const minutes = estimateReadingMinutes(text);
  return minutes * 60;
};

/**
 * Format reading time for display
 */
export const formatReadingTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  return `${minutes}m ${remainingSeconds}s`;
};
