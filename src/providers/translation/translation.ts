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
