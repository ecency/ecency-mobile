// The util pulls the sheet registry, which drags the components barrel and its
// native chains; stub the boundary modules before importing it.
jest.mock('react-native-actions-sheet', () => ({ SheetManager: { show: jest.fn() } }));
jest.mock('../navigation/sheets', () => ({
  SheetNames: { NEWSLETTER_DIGEST: 'newsletter_digest' },
}));
jest.mock('../storage/storage', () => ({
  getItemFromStorage: jest.fn(),
  setItemToStorage: jest.fn(),
}));
jest.mock('../redux/store/store', () => ({ store: { getState: jest.fn(() => ({})) } }));
jest.mock('../redux/selectors', () => ({ selectCurrentAccount: jest.fn() }));

// eslint-disable-next-line import/first
import { SheetManager } from 'react-native-actions-sheet';
// eslint-disable-next-line import/first
import { getItemFromStorage, setItemToStorage } from '../storage/storage';
// eslint-disable-next-line import/first
import { selectCurrentAccount } from '../redux/selectors';
// eslint-disable-next-line import/first
import {
  firstPublishDigestKey,
  maybeOfferFirstPublishDigest,
  shouldOfferFirstPublishDigest,
} from './firstPublishDigest';

describe('shouldOfferFirstPublishDigest', () => {
  it('offers only on a known-zero post count with no prior offer', () => {
    expect(shouldOfferFirstPublishDigest(0, false)).toBe(true);
    expect(shouldOfferFirstPublishDigest(0, true)).toBe(false);
    expect(shouldOfferFirstPublishDigest(3, false)).toBe(false);
    // A partial account (post_count not loaded) means "don't know" = no.
    expect(shouldOfferFirstPublishDigest(undefined, false)).toBe(false);
    expect(shouldOfferFirstPublishDigest(null, false)).toBe(false);
    expect(shouldOfferFirstPublishDigest('0', false)).toBe(false);
  });
});

describe('maybeOfferFirstPublishDigest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getItemFromStorage as jest.Mock).mockResolvedValue(null);
    (setItemToStorage as jest.Mock).mockResolvedValue(true);
    (selectCurrentAccount as unknown as jest.Mock).mockReturnValue({ name: 'newbie' });
  });

  it('writes the per-username flag BEFORE showing the sheet', async () => {
    const order: string[] = [];
    (setItemToStorage as jest.Mock).mockImplementation(async () => order.push('flag'));
    (SheetManager.show as jest.Mock).mockImplementation(() => order.push('sheet'));

    await maybeOfferFirstPublishDigest('newbie', 0);

    expect(setItemToStorage).toHaveBeenCalledWith(
      firstPublishDigestKey('newbie'),
      expect.objectContaining({ offeredAt: expect.any(String) }),
    );
    expect(SheetManager.show).toHaveBeenCalledWith('newsletter_digest', {
      payload: { type: 'own', target: 'newbie', firstPublish: true },
    });
    expect(order).toEqual(['flag', 'sheet']);
  });

  it('never re-prompts once the flag exists, and never prompts past the first post', async () => {
    (getItemFromStorage as jest.Mock).mockResolvedValue({ offeredAt: 'x' });
    await maybeOfferFirstPublishDigest('newbie', 0);
    (getItemFromStorage as jest.Mock).mockResolvedValue(null);
    await maybeOfferFirstPublishDigest('newbie', 5);
    await maybeOfferFirstPublishDigest(undefined, 0);
    expect(SheetManager.show).not.toHaveBeenCalled();
    expect(setItemToStorage).not.toHaveBeenCalled();
  });

  it('skips silently, without burning the flag, when the account changed during the delay', async () => {
    (selectCurrentAccount as unknown as jest.Mock).mockReturnValue({ name: 'someone-else' });
    await maybeOfferFirstPublishDigest('newbie', 0);
    expect(SheetManager.show).not.toHaveBeenCalled();
    // Not written: the offer stays available for a later genuine first publish.
    expect(setItemToStorage).not.toHaveBeenCalled();
  });

  it('swallows storage failures rather than surfacing them into the publish flow', async () => {
    (getItemFromStorage as jest.Mock).mockRejectedValue(new Error('storage down'));
    await expect(maybeOfferFirstPublishDigest('newbie', 0)).resolves.toBeUndefined();
    expect(SheetManager.show).not.toHaveBeenCalled();
  });
});
