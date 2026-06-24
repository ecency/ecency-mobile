import { getTranslation } from './translation';
import translationApi from '../../config/translationApi';

jest.mock('../../config/translationApi', () => ({
  __esModule: true,
  default: { post: jest.fn(), get: jest.fn() },
}));
jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

const mockedPost = translationApi.post as jest.Mock;

describe('getTranslation', () => {
  afterEach(() => mockedPost.mockReset());

  it('translates the cleaned text and re-attaches the emoji', async () => {
    mockedPost.mockResolvedValue({ data: { translatedText: 'My niece posing' } });

    const result = await getTranslation('Mi sobrina posando 😂❤️', 'auto', 'en');

    expect(mockedPost).toHaveBeenCalledWith(
      '/translate',
      expect.objectContaining({ q: 'Mi sobrina posando', source: 'auto', target: 'en' }),
    );
    expect(result.translatedText).toBe('My niece posing 😂❤️');
  });

  it('skips the request for emoji-only input and returns it unchanged', async () => {
    const result = await getTranslation('😂❤️', 'auto', 'en');

    expect(mockedPost).not.toHaveBeenCalled();
    expect(result.translatedText).toBe('😂❤️');
  });
});
