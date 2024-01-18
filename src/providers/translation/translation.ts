import bugsnagInstance from '../../config/bugsnag';
import translationApi from '../../config/translationApi';

export const getTranslation = async (text: string, source: string, target: string) => {
  try {
    const data = { q: text, source, target, format: 'text', api_key: '' };
    const res = await translationApi.post('/translate', data);
    if (!res || !res.data) {
      throw new Error('Error while getting translation!');
    }
    return res.data;
  } catch (error) {
    console.log('error : ', error);
    bugsnagInstance.notify(error);
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
    bugsnagInstance.notify(error);
    throw error;
  }
};
