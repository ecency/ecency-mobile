import * as Sentry from '@sentry/react-native';
import translationApi from '../../config/translationApi';
import { stripEmojis } from '../../utils/emojiStrip';

export const getTranslation = async (text: string, source: string, target: string) => {
  try {
    const { clean, emojis } = stripEmojis(text);

    // Emoji-only or empty input: nothing to translate, return as-is.
    if (!clean) {
      return { translatedText: text };
    }

    const data = { q: clean, source, target, format: 'text', api_key: '' };
    const res = await translationApi.post('/translate', data);
    if (!res || !res.data) {
      throw new Error('Error while getting translation!');
    }
    // Emoji are re-attached at the end rather than at their original positions;
    // acceptable for the short posts and messages this is used on.
    const translatedText = emojis
      ? `${res.data.translatedText} ${emojis}`.trim()
      : res.data.translatedText;
    return { ...res.data, translatedText };
  } catch (error) {
    console.log('error : ', error);
    Sentry.captureException(error);
    throw error;
  }
};

export const fetchSupportedLangs = async () => {
  try {
    const res = await translationApi.get('/languages');
    if (!res || !res.data) {
      throw new Error('Error while getting supported languages languages!');
    }
    return res.data;
  } catch (error) {
    console.log('error : ', error);
    Sentry.captureException(error);
    throw error;
  }
};

// Ask the backend to detect the language of a text. Returns confidence-ranked
// ISO-639-1 candidates ([{ confidence, language }]). Used only on the full-post
// view to confirm/refine the instant on-device guess (never per feed item).
export const detectLanguage = async (text: string) => {
  try {
    const { clean } = stripEmojis(text);
    if (!clean) {
      return [];
    }
    const res = await translationApi.post('/detect', {
      q: clean.slice(0, 800),
      api_key: '',
    });
    return Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    console.log('error : ', error);
    Sentry.captureException(error);
    throw error;
  }
};

const MAX_TRANSLATE_CHARS = 1800;

const chunkText = (text: string, max: number): string[] => {
  if (text.length <= max) {
    return [text];
  }
  const chunks: string[] = [];
  let buf = '';
  text.split(/\s+/).forEach((word) => {
    if (buf && buf.length + 1 + word.length > max) {
      chunks.push(buf);
      buf = word;
    } else {
      buf = buf ? `${buf} ${word}` : word;
    }
  });
  if (buf) {
    chunks.push(buf);
  }
  return chunks.filter(Boolean);
};

// Translate a full (possibly long) plain-text body, chunking to stay under the
// endpoint's request limit. Returns the joined translation plus the language the
// backend auto-detected on the first chunk (authoritative — used to relabel).
export const translateLongText = async (text: string, source: string, target: string) => {
  const chunks = chunkText(text, MAX_TRANSLATE_CHARS);
  const parts: string[] = [];
  let detectedLanguage;
  // Sequential on purpose: a deliberate user action, keeps us under the rate limit.
  // eslint-disable-next-line no-restricted-syntax
  for (const chunk of chunks) {
    // eslint-disable-next-line no-await-in-loop
    const res = await getTranslation(chunk, source, target);
    parts.push(res.translatedText);
    if (!detectedLanguage && res.detectedLanguage) {
      // eslint-disable-next-line prefer-destructuring
      detectedLanguage = res.detectedLanguage;
    }
  }
  return { translatedText: parts.join(' '), detectedLanguage };
};
